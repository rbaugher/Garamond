// api/signInUser.js
// Dedicated sign-in endpoint to validate a user's name + email pair
// Returns a normalized user document if both match, otherwise appropriate error codes.
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI environment variable is not defined');
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
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}export default async function handler(req, res) {
	console.log(`[signInUser] ${req.method} ${req.url}`);
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}
	try {
		const { name, email } = req.body || {};
		if (!name || !email) {
			return res.status(400).json({ message: 'Name and email are required' });
		}

		const nameNorm = name.trim();
		const emailNorm = email.toLowerCase();

		const client = await clientPromise;
		const db = client.db('Garamond');
		const users = db.collection('Users');

		// Find by email first for uniqueness
		const user = await users.findOne({ email: emailNorm });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Compare stored name (exact, case-insensitive allowed?)
		if (user.name.toLowerCase() !== nameNorm.toLowerCase()) {
			return res.status(401).json({ message: 'Name does not match email on file' });
		}

		// Success
		return res.status(200).json({
			message: 'Sign in success',
			user: {
				id: user._id,
				name: user.name,
				nickname: user.nickname,
				email: user.email,
				avatar: user.avatar,
				preferredColor: user.preferredColor,
				mailingList: user.mailingList || false,
				createdAt: user.createdAt
			}
		});
	} catch (err) {
		console.error('[signInUser] Error:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

