import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContentSchema, updateContentSchema, contentFilterSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public content routes
  app.get('/api/content', async (req, res) => {
    try {
      const filters = contentFilterSchema.parse(req.query);
      const contentList = await storage.getContent(filters);
      res.json(contentList);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  app.get('/api/content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contentItem = await storage.getContentById(id);
      
      if (!contentItem) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json(contentItem);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  // Admin-only routes
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify admin status' });
    }
  };

  // Admin content management routes
  app.post('/api/admin/content', isAuthenticated, requireAdmin, upload.single('featuredImage'), async (req, res) => {
    try {
      const contentData = insertContentSchema.parse({
        ...req.body,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      });
      
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.renameSync(req.file.path, filePath);
        contentData.featuredImage = `/uploads/${fileName}`;
      }
      
      const newContent = await storage.createContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(400).json({ message: 'Failed to create content', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put('/api/admin/content/:id', isAuthenticated, requireAdmin, upload.single('featuredImage'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contentData = updateContentSchema.parse({
        ...req.body,
        tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
      });
      
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.renameSync(req.file.path, filePath);
        contentData.featuredImage = `/uploads/${fileName}`;
      }
      
      const updatedContent = await storage.updateContent(id, contentData);
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(400).json({ message: 'Failed to update content', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete('/api/admin/content/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContent(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ message: 'Failed to delete content' });
    }
  });

  // Get all content for admin (including unpublished)
  app.get('/api/admin/content', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const contentList = await storage.getContent(); // No filters to get all content
      res.json(contentList);
    } catch (error) {
      console.error('Error fetching admin content:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
