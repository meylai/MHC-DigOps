import express from "express";
import { getHousesForMap } from "../controllers/houseController.js";
import { getHouseDetails } from "../controllers/houseController.js";

const router = express.Router();

router.get("/map", getHousesForMap);
router.get("/id/details", getHouseDetails);

export default router;