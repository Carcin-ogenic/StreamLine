/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: OAuth2 and authentication endpoints
 */

import { Router } from "express";
import passport from "../src/passport.js";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Redirect user to Google OAuth2 consent page
 *     tags:
 *       - Auth
 *     responses:
 *       "302":
 *         description: Redirect to Google OAuth2
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback endpoint
 *     tags:
 *       - Auth
 *     responses:
 *       "302":
 *         description: Redirect client to application with JWT token in query param
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL to client auth callback including token
 *       "401":
 *         description: Redirected here on failed authentication
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
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

    // Construct redirect URL back to client with token
    const redirectUrl = new URL(process.env.CLIENT_URL + "/auth/callback");
    redirectUrl.searchParams.set("token", token);
    res.redirect(redirectUrl.toString());
  }
);

/**
 * @openapi
 * /auth/failure:
 *   get:
 *     summary: Authentication failure handler
 *     tags:
 *       - Auth
 *     responses:
 *       "401":
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication Failed
 */
router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Authentication Failed" });
});

export default router;
