import express from "express";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
} from "../controllers/applicationController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 CREATE
router.post("/applications", authenticate, createApplication);

// 🔥 READ
router.get("/applications", authenticate, getAllApplications);
router.get("/applications/:id", authenticate, getApplicationById);

// 🔥 UPDATE
router.put("/applications/:id", authenticate, updateApplication);

// 🔥 DELETE
router.delete("/applications/:id", authenticate, deleteApplication);

export default router;