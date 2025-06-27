import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, loginAdmin } from "./auth";
import session from "express-session";
import MemoryStore from "memorystore";
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

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Admin authentication routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await loginAdmin(username, password);
      
      if (admin) {
        (req.session as any).adminId = admin.id;
        (req.session as any).adminUsername = admin.username;
        res.json({ success: true, admin: { id: admin.id, username: admin.username, name: admin.name } });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/admin/status', (req, res) => {
    const session = req.session as any;
    if (session.adminId) {
      res.json({ 
        isLoggedIn: true, 
        admin: { 
          id: session.adminId, 
          username: session.adminUsername 
        } 
      });
    } else {
      res.json({ isLoggedIn: false });
    }
  });

  // Setup route - creates first admin
  app.post('/api/admin/setup', async (req, res) => {
    try {
      const existingAdmin = await storage.getAdminByUsername('admin');
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const { username, password, name, email } = req.body;
      await storage.createAdmin({
        username: username || 'admin',
        password: password || 'admin123',
        name: name || 'Administrator',
        email: email || 'admin@example.com'
      });

      res.json({ success: true, message: "Admin created successfully" });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ message: "Setup failed" });
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
