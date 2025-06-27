import {
  users,
  content,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type UpdateContent,
  type ContentFilters,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Content operations
  getContent(filters?: ContentFilters): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: UpdateContent): Promise<Content>;
  deleteContent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Content operations
  async getContent(filters?: ContentFilters): Promise<Content[]> {
    let whereCondition = eq(content.published, true);

    if (filters?.search || filters?.category !== 'all' || filters?.type !== 'all') {
      const conditions = [eq(content.published, true)];

      if (filters?.search) {
        conditions.push(
          or(
            ilike(content.title, `%${filters.search}%`),
            ilike(content.excerpt, `%${filters.search}%`),
            ilike(content.author, `%${filters.search}%`)
          )!
        );
      }

      if (filters?.category && filters.category !== 'all') {
        conditions.push(eq(content.category, filters.category));
      }

      if (filters?.type && filters.type !== 'all') {
        conditions.push(eq(content.type, filters.type));
      }

      whereCondition = and(...conditions)!;
    }

    // Apply sorting
    if (filters?.sort === 'oldest') {
      return await db
        .select()
        .from(content)
        .where(whereCondition)
        .orderBy(asc(content.createdAt));
    } else {
      return await db
        .select()
        .from(content)
        .where(whereCondition)
        .orderBy(desc(content.createdAt)); // default to newest
    }
  }

  async getContentById(id: number): Promise<Content | undefined> {
    const [contentItem] = await db.select().from(content).where(eq(content.id, id));
    return contentItem;
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(content).values(contentData).returning();
    return newContent;
  }

  async updateContent(id: number, contentData: UpdateContent): Promise<Content> {
    const [updatedContent] = await db
      .update(content)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(content).where(eq(content.id, id));
  }
}

export const storage = new DatabaseStorage();
