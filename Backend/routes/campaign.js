// backend/src/routes/campaigns.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Segment from "../models/Segment.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import { buildMongoFilter } from "../utils/queryBuilderToMongo.js";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractJson(text) {
  let cleaned = text.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM response");
  }
  return cleaned.slice(start, end + 1);
}

router.post("/suggest", requireAuth, async (req, res, next) => {
  try {
    const { goal } = req.body;
    const prompt = `
You are a marketing assistant. Given the campaign goal, generate 3 concise email message variants.
Goal: "${goal}"
Return JSON: { "suggestions": ["…", "…", "…"] }
`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    const text = completion.choices[0].message.content.trim();
    const jsonText = extractJson(text);
    const { suggestions } = JSON.parse(jsonText);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, segmentId, message } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ message: "Segment not found" });

    const filter = buildMongoFilter(segment.query);
    const customers = await Customer.find(filter).select("_id");

    const campaign = await Campaign.create({
      name,
      segmentId,
      appliedTo: customers.map((c) => c._id),
      createdBy: req.user.id,
      message,
    });
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id }).populate("segmentId", "name").sort("-createdAt");
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("segmentId", "name")
      .populate("appliedTo", "name email");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

export default router;
