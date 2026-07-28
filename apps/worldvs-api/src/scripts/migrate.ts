import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createDb, closePool } from "@worldvs/database";

async function main() {
  const db = createDb();
  const migrationsDir = join(process.cwd(), "..", "..", "database", "migrations", "worldvs");

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    console.log(`Running migration: ${file}`);
    await db.query(sql);
    console.log(`  ✓ Done`);
  }

  console.log("All migrations completed.");
  await closePool();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
