// api/form.js
import { MongoClient } from "mongodb";

// Load environment variables in case not auto-loaded
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
      const db = client.db("Garamond"); // replace with your DB name
      const collection = db.collection("Appfeedback");

      const { name, thoughts } = req.body;

      if (!name || !thoughts) {
        return res.status(400).json({ message: "Missing fields" });
      }

      await collection.insertOne({ name, thoughts, createdAt: new Date() });

      res.status(200).json({ message: "Feedback submitted!" });
    } catch (err) {
      console.error("MongoDB insert error:", err);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
