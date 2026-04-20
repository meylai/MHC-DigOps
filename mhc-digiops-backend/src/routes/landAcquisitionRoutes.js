import express from "express";
import multer from "multer";
import { createLandAcquisition } from "../controllers/landAcquisitionController.js";
import { validateLandAcquisition } from "../middleware/validateLandAcquisition.js";

const router = express.Router();

//multer storage configuration (in-memory)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),

    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)

});

const upload = multer({ storage });

//route with file handling + validation
router.post(
    "/",
    upload.fields([
        { name: "nationalId", maxCount: 1 },
        { name: "ownershipProof", maxCount: 1 },
        { name: "landMap", maxCount: 1 },
        { name: "valuationReport", maxCount: 1 }

    ]),
    validateLandAcquisition,
    createLandAcquisition
);

export default router;