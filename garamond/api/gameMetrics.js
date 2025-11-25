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

      console.log("Received game metrics request body:", JSON.stringify(req.body, null, 2));

      const {
        playerName,
        playerNickname,
        opponentName,
        gameType,
        outcome,
        difficulty,
        winningCondition,
        moveList,
        gameDuration,
        timestamp,
        score,
        level,
        asteroidsDestroyed
      } = req.body;

      console.log("Extracted values - score:", score, "level:", level, "asteroidsDestroyed:", asteroidsDestroyed);

      // Validate required fields
      if (!playerName || !gameType || !outcome) {
        return res.status(400).json({ message: "Missing required fields: playerName, gameType, outcome" });
      }

      // Create the metrics document
      const metricsDoc = {
        playerName,
        playerNickname: playerNickname || null,
        opponentName: opponentName || null,
        gameType,
        outcome, // 'Win', 'Loss', or 'Tie' (from player's perspective)
        difficulty: difficulty !== undefined ? difficulty : null, // null for multiplayer
        winningCondition: winningCondition || null, // e.g., 'diagonal', 'row', 'column', or 'tie'
        moveList: moveList || [],
        gameDuration: gameDuration || 0, // in seconds
        score: score !== undefined ? Number(score) : null, // For games like Asteroids (can be 0) - ensure it's a number
        level: level !== undefined ? Number(level) : null, // For games with levels (can be 1) - ensure it's a number
        asteroidsDestroyed: asteroidsDestroyed !== undefined ? Number(asteroidsDestroyed) : null, // For Asteroids game (can be 0) - ensure it's a number
        timestamp: timestamp || new Date(),
        createdAt: new Date()
      };

      console.log("Inserting metrics document to MongoDB:", metricsDoc);

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
