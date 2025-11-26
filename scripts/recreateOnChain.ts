import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const dataPath = path.join(repoRoot, "frontend-next", "data", "charities.json");

  if (!fs.existsSync(dataPath)) {
    console.error(`Data file not found: ${dataPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  let saved: Record<string, any> = {};
  try {
    saved = JSON.parse(raw || "{}");
  } catch (e) {
    console.error("Failed to parse charities.json", e);
    process.exit(1);
  }

  // Determine contract address: prefer env var, else try to read frontend constants, else fallback
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

  if (!contractAddress) {
    console.warn("No contract address found in env or frontend constants. Using Hardhat default address.");
    contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  }

  const provider = ethers.provider;

  // Determine signer: use PRIVATE_KEY if provided, otherwise first hardhat signer
  let signer: any;
  const pk = process.env.PRIVATE_KEY;
  if (pk) {
    signer = new ethers.Wallet(pk, provider);
    console.log("Using signer from PRIVATE_KEY", signer.address);
  } else {
    const accounts = await ethers.getSigners();
    signer = accounts[0];
    console.log("Using default signer", await signer.getAddress());
  }

  const contract = await ethers.getContractAt("CharityRegistry", contractAddress, signer);

  // log contract owner and signer to help diagnose permission issues
  try {
    const owner = await contract.owner();
    const signerAddr = await signer.getAddress ? await signer.getAddress() : signer.address;
    console.log(`Contract owner: ${owner}`);
    console.log(`Using signer: ${signerAddr}`);
    if (owner.toLowerCase() !== (signerAddr || "").toLowerCase()) {
      console.warn("Signer is not contract owner — addCharity calls will likely revert. Use PRIVATE_KEY of owner or deploy with this signer.");
    }
  } catch (e) {
    console.warn("Could not read contract owner:", String(e));
  }

  // get current on-chain count
  let onChainCount = 0;
  try {
    const cnt = await contract.charityIdCounter();
    onChainCount = Number(cnt.toString());
  } catch (e) {
    console.error("Failed to read charityIdCounter from contract:", e);
    process.exit(1);
  }

  const persistedIds = Object.keys(saved).map((k) => Number(k)).filter((n) => !Number.isNaN(n));
  if (persistedIds.length === 0) {
    console.log("No persisted charities found in data/charities.json");
    return;
  }
  const maxPersistedId = Math.max(...persistedIds);

  console.log(`On-chain count: ${onChainCount}. Max persisted id: ${maxPersistedId}`);

  for (let id = onChainCount; id <= maxPersistedId; id++) {
    const rec = saved[id];
    if (!rec) {
      console.log(`Skipping id ${id}: no persisted record`);
      continue;
    }

    const name = rec.name || "";
    const mission = rec.mission || "";
    const website = rec.website || "";
    const active = !!rec.active;
    const wallet = rec.wallet || rec.walletAddress || rec.wallet_address || rec.wallet || "";

    if (!name || !wallet) {
      console.log(`Skipping id ${id}: missing name or wallet`);
      continue;
    }

    console.log(`Adding charity id=${id} name='${name}' wallet=${wallet} active=${active}`);
    try {
      const tx = await contract.addCharity(name, mission, website, active, wallet);
      const receipt = await tx.wait();
      console.log(`Added id ${id} tx=${receipt.transactionHash}`);
    } catch (e: any) {
      console.error(`Failed to add charity id ${id}:`, e?.message || e);
      // Continue with next
    }
  }

  console.log("Recreate finished.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
