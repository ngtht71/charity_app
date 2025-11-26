import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const outPath = path.join(repoRoot, "data", "charities.json");
  const constantsPath = path.join(repoRoot, "frontend-next", "utils", "constants.ts");

  // Determine contract address from env or frontend constants
  let contractAddress = process.env.RECREATE_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS;
  if (!contractAddress && fs.existsSync(constantsPath)) {
    try {
      const c = fs.readFileSync(constantsPath, "utf8");
      const m = c.match(/CONTRACT_ADDRESS\s*=\s*["'](.+?)["']/);
      if (m) contractAddress = m[1];
    } catch (e) {
      // ignore
    }
  }
  if (!contractAddress) contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("Dumping on-chain charities from", contractAddress);

  const contract = await ethers.getContractAt("CharityRegistry", contractAddress);

  let count = 0;
  try {
    const c = await contract.charityIdCounter();
    count = Number(c.toString());
  } catch (e) {
    console.error("Failed to read charityIdCounter:", String(e));
    process.exit(1);
  }

  const out: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    try {
      const ch = await contract.charities(i);
      out[i] = {
        id: i,
        name: ch.name || "",
        mission: ch.mission || "",
        website: ch.website || "",
        totalDonation: (ch.totalDonation || 0).toString(),
        active: !!ch.active,
        wallet: (ch.wallet || "").toString(),
        image: "",
        description: "",
      };
    } catch (e) {
      console.warn(`Failed reading charity ${i}:`, String(e));
    }
  }

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${Object.keys(out).length} charities to ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
