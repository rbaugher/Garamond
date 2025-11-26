// api/signUpUser.js
import { MongoClient } from "mongodb";

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

if (process.env.NODE_ENV === "development") {
  // In development: keep connection in global to prevent hot reload exhaustion
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel): create a new client per function (but still reuse if possible)
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  console.log(`[signUpUser] ${req.method} ${req.url}`);
  try {
    if (req.method === "POST") {
      console.log('[signUpUser] POST body:', JSON.stringify(req.body));
    } else if (req.method === 'GET') {
      console.log('[signUpUser] GET query:', JSON.stringify(req.query));
    } else if (req.method === 'PATCH') {
      console.log('[signUpUser] PATCH body:', JSON.stringify(req.body));
    }
  } catch (e) {
    // ignore logging errors
  }
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("Garamond");
      const collection = db.collection("Users");


      const { name, nickname, email, avatar, preferredColor, favoriteBibleVerse, wouldYouRatherAnswer } = req.body;

      // Validate required fields
      if (!name || !nickname || !email || !avatar) {
        return res.status(400).json({ 
          message: "Missing required fields: name, nickname, email, and avatar are required" 
        });
      }

      // Validate nickname (alphanumeric, 3-16 chars)
      const nicknamePattern = /^[a-zA-Z0-9_]{3,16}$/;
      if (!nicknamePattern.test(nickname)) {
        return res.status(400).json({ 
          message: "Nickname must be 3-16 characters, letters, numbers, or underscores only." 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: "Invalid email format" 
        });
      }


      // Normalize values for comparison
      const emailNorm = email.toLowerCase();
      const nameNorm = name.trim();
      const nicknameNorm = nickname.trim().toLowerCase();

      // Build a case-insensitive regex for nickname so uniqueness check is case-insensitive
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nicknameRegex = new RegExp(`^${escapeRegex(nickname.trim())}$`, 'i');

      // Check if user already exists by email, name, or nickname (nickname comparison is case-insensitive)
      const existingUser = await collection.findOne({
        $or: [
          { email: emailNorm },
          { name: nameNorm },
          { nickname: nicknameRegex }
        ]
      });

      if (existingUser) {
        let reason = "";
        if (existingUser.email === emailNorm) {
          reason = "An account with this email already exists";
        } else if (existingUser.name === nameNorm) {
          reason = "An account with this name already exists";
        } else if (existingUser.nickname && existingUser.nickname.toLowerCase() === nicknameNorm) {
          reason = "An account with this nickname already exists";
        }
        return res.status(409).json({ 
          message: `User already exists. ${reason}.`,
          existingUser: {
            id: existingUser._id,
            name: existingUser.name,
            nickname: existingUser.nickname,
            email: existingUser.email
          }
        });
      }


      // Create new user document (store nickname normalized to lowercase)
      const newUser = {
        name: nameNorm,
        nickname: nicknameNorm,
        email: emailNorm,
        avatar: avatar,
        preferredColor: preferredColor || "#4ECDC4",
        favoriteBibleVerse: favoriteBibleVerse || null,
        wouldYouRatherAnswer: wouldYouRatherAnswer || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert the new user
      const result = await collection.insertOne(newUser);
      console.log('[signUpUser] Created user:', result.insertedId.toString());

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
  } else if (req.method === "PATCH") {
    // Update user profile (avatar, preferredColor, etc.)
    try {
      const client = await clientPromise;
      const db = client.db("Garamond");
      const collection = db.collection("Users");

      const { email, avatar, preferredColor } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required to update user" });
      }

      const updateFields = {};
      if (avatar) updateFields.avatar = avatar;
      if (preferredColor) updateFields.preferredColor = preferredColor;
      updateFields.updatedAt = new Date();

      console.log('[signUpUser] Updating user', email.toLowerCase(), 'fields:', Object.keys(updateFields));

      const result = await collection.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        console.log('[signUpUser] Update failed: user not found', email.toLowerCase());
        return res.status(404).json({ message: "User not found" });
      }

      console.log('[signUpUser] Update success for', email.toLowerCase());
      res.status(200).json({
        message: "User updated successfully!",
        user: result.value
      });
    } catch (err) {
      console.error("MongoDB update error:", err);
      res.status(500).json({ message: "Error updating user" });
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

      console.log('[signUpUser] GET user by email:', email.toLowerCase());

      const user = await collection.findOne({ 
        email: email.toLowerCase() 
      });

      if (!user) {
        console.log('[signUpUser] GET user not found for', email.toLowerCase());
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      console.log('[signUpUser] GET user found:', user._id.toString());
      res.status(200).json({
        exists: true,
        user: {
          id: user._id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
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
