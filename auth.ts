import { storage } from "./storage";
import type { RequestHandler } from "express";

// Simple session-based authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).adminId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export const loginAdmin = async (username: string, password: string) => {
  return await storage.verifyAdmin(username, password);
};