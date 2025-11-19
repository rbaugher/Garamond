// api/signUpUser.js
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
      const collection = db.collection("Users");

      const { name, email, avatar, preferredColor, favoriteBibleVerse, wouldYouRatherAnswer } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({ 
          message: "Missing required fields: name and email" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: "Invalid email format" 
        });
      }

      // Check if user already exists by name and email
      const existingUser = await collection.findOne({
        $or: [
          { email: email.toLowerCase() },
          { name: name.trim() }
        ]
      });

      if (existingUser) {
        let reason = "";
        if (existingUser.email === email.toLowerCase()) {
          reason = "An account with this email already exists";
        } else if (existingUser.name === name.trim()) {
          reason = "An account with this name already exists";
        }
        
        return res.status(409).json({ 
          message: `User already exists. ${reason}.`,
          existingUser: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email
          }
        });
      }

      // Create new user document
      const newUser = {
        name: name.trim(),
        email: email.toLowerCase(),
        avatar: avatar || "🧑",
        preferredColor: preferredColor || "#4ECDC4",
        favoriteBibleVerse: favoriteBibleVerse || null,
        wouldYouRatherAnswer: wouldYouRatherAnswer || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert the new user
      const result = await collection.insertOne(newUser);

      res.status(201).json({
        message: "User created successfully!",
        userId: result.insertedId,
        user: newUser
      });
    } catch (err) {
      console.error("MongoDB sign up error:", err);
      res.status(500).json({ 
        message: "Error creating user account" 
      });
    }
  } else if (req.method === "GET") {
    // Optional: Get user by email (for checking if exists)
    try {
      const client = await clientPromise;
      const db = client.db("Garamond");
      const collection = db.collection("Users");

      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ 
          message: "Email parameter required" 
        });
      }

      const user = await collection.findOne({ 
        email: email.toLowerCase() 
      });

      if (!user) {
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      res.status(200).json({
        exists: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredColor: user.preferredColor,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      console.error("MongoDB query error:", err);
      res.status(500).json({ 
        message: "Error querying user" 
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
