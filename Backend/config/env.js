import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

console.log("GOOGLE_CLIENT_ID in env.js:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET in env.js:", process.env.GOOGLE_CLIENT_SECRET);
console.log("MONGO_URI in env.js:", process.env.MONGO_URI); // Add this line

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in env.js");
}