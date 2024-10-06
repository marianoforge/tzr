import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize, parse } from "cookie";

// Generate a CSRF token and set it in a cookie
export function setCsrfCookie(res: NextApiResponse) {
  const token = nanoid(); // Generate a random token
  const csrfCookie = serialize("csrfToken", token, {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: "strict", // Prevent CSRF attacks
    path: "/", // Make the cookie accessible across the site
  });
  res.setHeader("Set-Cookie", csrfCookie); // Set the CSRF token in the response cookies
  return token;
}

// Validate the CSRF token
export function validateCsrfToken(req: NextApiRequest) {
  const cookies = parse(req.headers.cookie || ""); // Parse cookies from the request
  const csrfTokenFromCookie = cookies["csrfToken"];
  const csrfTokenFromHeader = req.headers["csrf-token"];

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    return false;
  }

  return csrfTokenFromCookie === csrfTokenFromHeader; // Compare cookie and header tokens
}
