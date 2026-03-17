import type { Visibility } from "@pastebin/shared";
import { db } from "./index.js"; // Adjust path to your Drizzle instance
import { pastes } from "./schema.js"; // Adjust path to your schema
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";

async function main() {
  console.log("Seeding database...");
  console.log("DB_URL Check:", process.env.DATABASE_URL);
  // Optional: Clear existing pastes
  // await db.delete(pastes);

  const getRandom = <T>(arr:T[]) => arr[Math.floor(Math.random() * arr.length)];

  const seedData = Array.from({ length: 10 }).map(() => {
    // Define visibility options
    const visibilities: Visibility[] = ['public', 
      // 'private', 
      'unlisted'];

    // Define possible expiration offsets (in minutes)
    const expirationOffsets = [
      3,          // 3m
      60,         // 1h
      60 * 24,       // 1d
      60 * 24 * 7,      // 1w
      60 * 24 * 365,     // 1y
      null,        // Never
      -10, //expire
    ];

    const offset = getRandom(expirationOffsets);
    const expiresAt = offset
      ? new Date(Date.now() + offset * 60 * 1000)
      : null;

    return {
      slug: nanoid(21),
      title: faker.lorem.sentence({ min: 1, max: 3 }).slice(0, 100),
      content: faker.lorem.paragraphs(3),
      visibility: getRandom(visibilities),
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      userId: null,
    };
  });

  try{

    const res = await db.insert(pastes).values(seedData).returning();
    console.log("Seeding completed!");
    for(const row of res){
      console.log(`row: Title: ${row.title} Nano ID: ${row.slug}`);
    }
  }catch(err){
    console.error("Database insert failed. Check for schema mismatches.");
    throw err;
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed!");
  console.error(err);
  process.exit(1);
});