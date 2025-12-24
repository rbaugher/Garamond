// api/playerModel.js
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const playerName = req.query.playerName;
  if (!playerName) {
    return res.status(400).json({ message: 'Missing playerName' });
  }
  try {
    const client = await clientPromise;
    const db = client.db('Garamond');
    const collection = db.collection('Game Metrics');

    const docs = await collection.find({ playerName, gameType: 'Tic Tac Toe Squared' }).toArray();
    if (!docs || docs.length === 0) {
      return res.status(200).json({ playerName, version: 1, updatedAt: new Date(), profile: { games: 0 }, modelParams: {} });
    }

    // Aggregate simple tendencies
    const posCounts = Array(9).fill(0);
    const pieceCounts = { 1: 0, 2: 0, 3: 0 };
    let takeovers = 0, totalMoves = 0;
    let earlyThrees = 0;

    for (const doc of docs) {
      const perMoveStats = Array.isArray(doc.perMoveStats) ? doc.perMoveStats : [];
      for (let i = 0; i < perMoveStats.length; i++) {
        const m = perMoveStats[i];
        if (!m || m.turn !== 'X' || typeof m.moveIdx !== 'number') continue;
        posCounts[m.moveIdx] += 1;
        if (m.pieceValue) pieceCounts[m.pieceValue] += 1;
        if (m.isTakeover) takeovers += 1;
        totalMoves += 1;
        if (m.pieceValue === 3 && i <= 3) earlyThrees += 1; // first 4 moves
      }
    }

    const posWeights = posCounts.map(c => c / Math.max(1, totalMoves));
    const piecePrefs = {
      1: pieceCounts[1] / Math.max(1, (pieceCounts[1] + pieceCounts[2] + pieceCounts[3])),
      2: pieceCounts[2] / Math.max(1, (pieceCounts[1] + pieceCounts[2] + pieceCounts[3])),
      3: pieceCounts[3] / Math.max(1, (pieceCounts[1] + pieceCounts[2] + pieceCounts[3]))
    };
    const takeoverRate = takeovers / Math.max(1, totalMoves);
    const earlyThreeRate = earlyThrees / Math.max(1, totalMoves);

    const profile = {
      games: docs.length,
      posWeights,
      piecePrefs,
      takeoverRate,
      earlyThreeRate
    };

    return res.status(200).json({ playerName, version: 1, updatedAt: new Date(), profile, modelParams: {} });
  } catch (err) {
    console.error('playerModel error:', err);
    return res.status(500).json({ message: 'Error building player model' });
  }
}
