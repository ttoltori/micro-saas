import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createDb, closePool } from "@worldvs/database";

async function main() {
  const db = createDb();
  const seedsDir = join(process.cwd(), "..", "..", "database", "seeds", "worldvs");

  const files = readdirSync(seedsDir)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(seedsDir, file), "utf-8");
    console.log(`Running seed: ${file}`);
    await db.query(sql);
    console.log(`  ✓ Done`);
  }

  console.log("All seeds completed.");
  await closePool();
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
