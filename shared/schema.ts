import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content table for articles and videos
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  category: varchar("category", { length: 50 }).notNull(), // Physics, Chemistry, Biology, Astronomy, Technology
  type: varchar("type", { length: 20 }).notNull(), // article, video
  author: varchar("author", { length: 100 }).notNull(),
  tags: text("tags").array().default([]),
  videoUrl: varchar("video_url", { length: 500 }),
  featuredImage: varchar("featured_image", { length: 500 }),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validations
export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateContentSchema = insertContentSchema.partial();

export const contentFilterSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['all', 'physics', 'chemistry', 'biology', 'astronomy', 'technology']).optional(),
  type: z.enum(['all', 'article', 'video']).optional(),
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
export type ContentFilters = z.infer<typeof contentFilterSchema>;
