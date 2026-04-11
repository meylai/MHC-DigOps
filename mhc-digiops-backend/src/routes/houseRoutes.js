import express from "express";
import { getHousesForMap } from "../controllers/houseController";

const router = express.Router();

router.get("/map", getHousesForMap);

export default router;