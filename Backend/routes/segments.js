import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
import { buildMongoFilter } from "../utils/queryBuilderToMongo.js";

const router = Router();

// Preview: POST /api/segments/preview
router.post("/preview", requireAuth, async (req, res, next) => {
  try {
    const filter = buildMongoFilter(req.body);
    const count = await Customer.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Save: POST /api/segments
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const segment = await Segment.create({
      name: req.body.name,
      query: req.body.query,
      createdBy: req.user.id,
    });
    res.status(201).json(segment);
  } catch (err) {
    next(err);
  }
});

// List segments: GET /api/segments
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const segments = await Segment.find({ createdBy: req.user.id }).sort("-createdAt");
    res.json(segments);
  } catch (err) {
    next(err);
  }
});

export default router;
