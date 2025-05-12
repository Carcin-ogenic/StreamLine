import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
import { buildMongoFilter } from "../utils/queryBuilderToMongo.js";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

function extractJson(text) {
  let cleaned = text.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM response");
  }
  return cleaned.slice(start, end + 1);
}

router.post("/parse-nl", requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body;
    const prompt = `
You are a query builder translator. Fields: totalSpend (number), lastVisit (date), tags (string).
Operators: =, !=, <, <=, >, >=, contains, doesNotContain.
Convert this description into JSON: {"combinator": "...", "rules":[{…}]}
Description: "${text}"
Reply with only valid JSON.
`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    const json = completion.choices[0].message.content.trim();
    const jsonText = extractJson(json);
    const query = JSON.parse(jsonText);
    res.json({ query });
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
