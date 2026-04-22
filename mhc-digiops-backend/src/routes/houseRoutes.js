import express from "express";
import { getHousesForMap } from "../controllers/houseController.js";
import { getHouseDetails, getAvailableHouses } from "../controllers/houseController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHousesForMap);
router.get("/map", getHousesForMap);
router.get("/:id/details", authenticateToken, getHouseDetails);
router.get("/houses/available", authenticateToken, getAvailableHouses);

export default router;