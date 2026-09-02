import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const client = new MongoClient(uri);
await client.connect();
const dbName = process.env.MONGODB_DB || new URL(uri).pathname.slice(1) || "smsflow";
const db = client.db(dbName);

const hashed = await bcrypt.hash("AGENT008", 10);
const result = await db
  .collection("users")
  .updateOne({ username: "admin" }, { $set: { password: hashed, updatedAt: new Date() } });

console.log("[v0] matched:", result.matchedCount, "modified:", result.modifiedCount);
await client.close();
process.exit(0);
