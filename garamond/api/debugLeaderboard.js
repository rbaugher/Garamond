// api/debugLeaderboard.js
import { MongoClient } from "mongodb";
import 'dotenv/config';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// GET /api/debugLeaderboard?gameType=Tic Tac Toe Squared&difficulty=medium
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const client = await clientPromise;
    const db = client.db("Garamond");
    const collection = db.collection("Game Metrics");

    const { gameType = "Tic Tac Toe Squared", difficulty = 1 } = req.query;
    const docs = await collection.find({ gameType, difficulty }).toArray();
    res.status(200).json({ count: docs.length, docs });
  } catch (err) {
    console.error("Debug Leaderboard error:", err);
    res.status(500).json({ message: "Error fetching debug leaderboard" });
  }
}
