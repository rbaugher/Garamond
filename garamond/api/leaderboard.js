// api/leaderboard.js
import { MongoClient } from "mongodb";
import 'dotenv/config';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

// MongoDB client options for serverless environment
const clientOptions = {
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 120000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, clientOptions);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// GET /api/leaderboard?gameType=Tic Tac Toe Squared&difficulty=easy
// GET /api/leaderboard?gameType=Asteroids (for high score leaderboard)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const client = await clientPromise;
    const db = client.db("Garamond");
    const collection = db.collection("Game Metrics");

    const { gameType = "Tic Tac Toe Squared", difficulty = "easy", limit = 10 } = req.query;

    // Handle Asteroids leaderboard (high scores)
    if (gameType === "Asteroids") {
      const pipeline = [
        { $match: { gameType: "Asteroids", score: { $exists: true, $ne: null } } },
        { $sort: { score: -1 } },
        { $limit: parseInt(limit) },
        { $project: {
            playerName: 1,
            score: 1,
            level: 1,
            _id: 0
          }
        }
      ];

      const results = await collection.aggregate(pipeline).toArray();
      console.log("Asteroids leaderboard query results:", results);
      
      const leaderboard = results.map((entry, idx) => ({
        rank: idx + 1,
        player: entry.playerName,
        score: entry.score || 0,
        level: entry.level || 1
      }));

      return res.status(200).json({ leaderboard });
    }

    // Support both string and numeric difficulty for backward compatibility
    const difficultyMap = {
      easy: ["easy", 0, "0"],
      medium: ["medium", 1, "1"],
      hard: ["hard", 2, "2"]
    };
    const allowedDifficulties = difficultyMap[difficulty] || [difficulty];

    // Aggregate leaderboard by nickname, count wins, and calculate win rate
    const pipeline = [
      { $match: { gameType, difficulty: { $in: allowedDifficulties }, outcome: "Win" } },
      { $group: {
          _id: "$playerName",
          wins: { $sum: 1 },
        }
      },
      { $sort: { wins: -1 } },
      { $limit: parseInt(limit) },
    ];

    const winResults = await collection.aggregate(pipeline).toArray();

    // For win rate, need total games played per player
    const totalGamesPipeline = [
      { $match: { gameType, difficulty: { $in: allowedDifficulties } } },
      { $group: {
          _id: "$playerName",
          total: { $sum: 1 },
        }
      }
    ];
    const totalResults = await collection.aggregate(totalGamesPipeline).toArray();
    const totalMap = Object.fromEntries(totalResults.map(r => [r._id, r.total]));

    // Merge win count and win rate
    const leaderboard = winResults.map((entry, idx) => ({
      rank: idx + 1,
      player: entry._id,
      wins: entry.wins,
      winRate: totalMap[entry._id] ? Math.round(100 * entry.wins / totalMap[entry._id]) + "%" : "-"
    }));

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}
