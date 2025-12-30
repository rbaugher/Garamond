// api/playerStats.js
import { MongoClient } from "mongodb";
import 'dotenv/config';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

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

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { playerName, gameType } = req.query;

      if (!playerName || !gameType) {
        return res.status(400).json({ message: "Missing required parameters: playerName, gameType" });
      }

      const client = await clientPromise;
      const db = client.db("Garamond");
      const collection = db.collection("Game Metrics");

      // Query for all games by this player for this game type
      const games = await collection.find({
        playerName: playerName,
        gameType: gameType,
        difficulty: { $ne: null } // Only single-player games with difficulty
      }).toArray();

      // Calculate statistics by difficulty
      const statsByDifficulty = {
        0: { totalGames: 0, wins: 0, losses: 0, ties: 0 }, // Easy
        1: { totalGames: 0, wins: 0, losses: 0, ties: 0 }, // Medium
        2: { totalGames: 0, wins: 0, losses: 0, ties: 0 }, // Hard
        3: { totalGames: 0, wins: 0, losses: 0, ties: 0 }, // AI
      };

      games.forEach(game => {
        const diff = game.difficulty;
        if (diff !== null && diff !== undefined && statsByDifficulty[diff]) {
          statsByDifficulty[diff].totalGames++;
          if (game.outcome === 'Win') {
            statsByDifficulty[diff].wins++;
          } else if (game.outcome === 'Loss') {
            statsByDifficulty[diff].losses++;
          } else if (game.outcome === 'Tie') {
            statsByDifficulty[diff].ties++;
          }
        }
      });

      // Calculate overall stats
      const totalGames = games.length;
      const totalWins = games.filter(g => g.outcome === 'Win').length;
      const totalLosses = games.filter(g => g.outcome === 'Loss').length;
      const totalTies = games.filter(g => g.outcome === 'Tie').length;

      res.status(200).json({
        playerName,
        gameType,
        overall: {
          totalGames,
          wins: totalWins,
          losses: totalLosses,
          ties: totalTies,
          winRate: totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0
        },
        byDifficulty: statsByDifficulty
      });
    } catch (err) {
      console.error("Error fetching player stats:", err);
      res.status(500).json({ message: "Error fetching player statistics" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
