import { 
  pgTable, 
  text, 
  timestamp, 
  bigint, 
  varchar, 
  boolean, 
  uniqueIndex, 
  index, 
  unique, 
  check 
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- Users Table ---
export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  avatarUrl: text("avatar_url"),
  provider: text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueOauth: unique("unique_oauth_user").on(table.provider, table.providerUserId),
}));

// --- Pastes Table ---
export const pastes = pgTable("pastes", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug", { length: 21 }).unique().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  
  visibility: text("visibility").default("public").$type<'public' | 'private' | 'unlisted'>(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  
  isDeleted: boolean("is_deleted").default(false),
  
  userId: bigint("user_id", { mode: "number" }).references(() => users.id, { onDelete: 'set null' }),
}, (table) => ({
  // Mirroring your SQL indexes
  slugIdx: uniqueIndex("idx_pastes_slug").on(table.slug),
  userIdIdx: index("idx_pastes_user_id").on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  // Mirroring your SQL CHECK constraint
  visibilityCheck: check("visibility_check", sql`${table.visibility} IN ('public', 'private', 'unlisted')`),
}));