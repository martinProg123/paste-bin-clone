import { db } from "./index.js"; // Adjust path to your Drizzle instance
import { pastes } from "./schema.js"; // Adjust path to your schema
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";

async function main() {
  console.log("Seeding database...");
  console.log("DB_URL Check:", process.env.DATABASE_URL);
  // Optional: Clear existing pastes
  // await db.delete(pastes);

  const seedData = Array.from({ length: 20 }).map((el, idx) => ({
    slug: nanoid(21),
    title: `public ${idx}`,
    content: faker.lorem.paragraphs(3),
    visibility: "public" as const,
    expiresAt: null, // "Never Expire"
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    userId: null,
  }));

  await db.insert(pastes).values(seedData);

  console.log("Seeding completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed!");
  console.error(err);
  process.exit(1);
});