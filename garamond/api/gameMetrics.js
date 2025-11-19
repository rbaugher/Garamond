// api/gameMetrics.js
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

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("Garamond");
      const collection = db.collection("Game Metrics");

      const {
        playerName,
        opponentName,
        gameType,
        outcome,
        difficulty,
        winningCondition,
        moveList,
        gameDuration,
        timestamp
      } = req.body;

      // Validate required fields
      if (!playerName || !gameType || !outcome) {
        return res.status(400).json({ message: "Missing required fields: playerName, gameType, outcome" });
      }

      // Create the metrics document
      const metricsDoc = {
        playerName,
        opponentName: opponentName || null,
        gameType,
        outcome, // 'Win', 'Loss', or 'Tie' (from player's perspective)
        difficulty: difficulty || null, // null for multiplayer
        winningCondition: winningCondition || null, // e.g., 'diagonal', 'row', 'column', or 'tie'
        moveList: moveList || [],
        gameDuration: gameDuration || 0, // in seconds
        timestamp: timestamp || new Date(),
        createdAt: new Date()
      };

      const result = await collection.insertOne(metricsDoc);

      res.status(200).json({
        message: "Game metrics recorded!",
        id: result.insertedId
      });
    } catch (err) {
      console.error("MongoDB insert error:", err);
      res.status(500).json({ message: "Error recording game metrics" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
