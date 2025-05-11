import { Router } from "express";
import passport from "../src/passport.js";
import jwt from "jsonwebtoken";
const router = Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  (req, res) => {
    const user = req.user;
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    // res.json({ token });
    const redirectUrl = new URL(process.env.CLIENT_URL + "/auth/callback");
    redirectUrl.searchParams.set("token", token);
    res.redirect(redirectUrl.toString());
  }
);
router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Authentication Failed" });
});

export default router;
