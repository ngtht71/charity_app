import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const dataPath = path.join(repoRoot, "data", "charities.json");

  let saved: Record<string, any> = {};
  if (fs.existsSync(dataPath)) {
    try {
      const raw = fs.readFileSync(dataPath, "utf8");
      saved = JSON.parse(raw || "{}");
    } catch (e) {
      console.error("Failed to parse data/charities.json:", e);
      process.exit(1);
    }
  } else {
    console.warn("No data/charities.json found — persisted data empty.");
  }

  // Determine contract address from env or frontend constants
  let contractAddress = process.env.RECREATE_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    try {
      const constantsPath = path.join(repoRoot, "frontend-next", "utils", "constants.ts");
      if (fs.existsSync(constantsPath)) {
        const c = fs.readFileSync(constantsPath, "utf8");
        const m = c.match(/CONTRACT_ADDRESS\s*=\s*["'](.+?)["']/);
        if (m) contractAddress = m[1];
      }
    } catch (e) {
      // ignore
    }
  }
  if (!contractAddress) contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("Checking on-chain contract at", contractAddress);

  const provider = ethers.provider;
  // Use Hardhat's default contract attachment (do not pass provider object as signer)
  // Passing the provider wrapper as the signer caused an "invalid signer" error in some setups.
  const contract = await ethers.getContractAt("CharityRegistry", contractAddress);

  let onChainCount = 0;
  try {
    const cnt = await contract.charityIdCounter();
    onChainCount = Number(cnt.toString());
  } catch (e) {
    console.error("Failed to read charityIdCounter:", e);
    process.exit(1);
  }

  console.log(`On-chain charity count: ${onChainCount}`);

  const onChain: Record<number, { name: string; active: boolean; wallet: string }> = {};
  for (let i = 0; i < onChainCount; i++) {
    try {
      const c = await contract.charities(i);
      onChain[i] = { name: c.name || "", active: !!c.active, wallet: (c.wallet || "").toLowerCase() };
    } catch (e) {
      console.warn(`Failed to read charity ${i}:`, String(e));
    }
  }

  const persistedIds = Object.keys(saved).map((k) => Number(k)).filter((n) => !Number.isNaN(n));

  console.log("--- On-chain entries ---");
  for (const id of Object.keys(onChain).map((k) => Number(k))) {
    const v = onChain[id];
    console.log(`id=${id} name='${v.name}' active=${v.active} wallet=${v.wallet}`);
  }

  console.log("--- Persisted entries ---");
  for (const id of persistedIds.sort((a, b) => a - b)) {
    const rec = saved[id];
    console.log(`id=${id} name='${rec?.name || ""}' active=${!!rec?.active} wallet=${(rec?.wallet || rec?.walletAddress || "").toLowerCase()}`);
  }

  console.log("--- Comparison ---");
  for (const id of persistedIds.sort((a, b) => a - b)) {
    const on = onChain[id];
    const rec = saved[id];
    if (!on) {
      console.log(`id=${id} MISSING on-chain`);
      continue;
    }
    const nameMatch = (on.name || "") === (rec?.name || "");
    const activeMatch = Boolean(on.active) === Boolean(rec?.active);
    const walletMatch = (on.wallet || "") === ((rec?.wallet || rec?.walletAddress || "") as string).toLowerCase();
    console.log(`id=${id} on-chain present. nameMatch=${nameMatch} activeMatch=${activeMatch} walletMatch=${walletMatch}`);
  }

  console.log("Check complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
