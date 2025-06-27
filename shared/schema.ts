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

// Admin user table for simple login
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(), // Will be hashed
  email: varchar("email", { length: 100 }),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
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
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
export type ContentFilters = z.infer<typeof contentFilterSchema>;
