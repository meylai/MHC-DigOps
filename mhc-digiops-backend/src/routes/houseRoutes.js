import express from "express";
import { getHousesForMap } from "../controllers/houseController";
import { getHouseDetails } from "../controllers/houseController";

const router = express.Router();

router.get("/map", getHousesForMap);
router.get("/id/details", getHouseDetails);

export default router;