import {
  admins,
  content,
  type Admin,
  type InsertAdmin,
  type Content,
  type InsertContent,
  type UpdateContent,
  type ContentFilters,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  verifyAdmin(username: string, password: string): Promise<Admin | null>;
  
  // Content operations
  getContent(filters?: ContentFilters): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: UpdateContent): Promise<Content>;
  deleteContent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const [admin] = await db
      .insert(admins)
      .values({
        ...adminData,
        password: hashedPassword,
      })
      .returning();
    return admin;
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return null;
    
    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
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
