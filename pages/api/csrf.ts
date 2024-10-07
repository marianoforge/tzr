// lib/csrf.ts
import nextConnect from "next-connect"; // Ensure this import is correct
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { NextApiRequest, NextApiResponse } from "next";

// Initialize CSRF protection using cookies
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use only over HTTPS in production
    sameSite: "strict", // CSRF protection
  },
});

// Create a handler with next-connect
const csrfMiddleware = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cookieParser())
  .use(csrfProtection);

export default csrfMiddleware;
