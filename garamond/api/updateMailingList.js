// api/updateMailingList.js
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI environment variable is not defined');
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

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  console.log(`[updateMailingList] ${req.method} ${req.url}`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, subscribe } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (typeof subscribe !== 'boolean') {
      return res.status(400).json({ message: 'subscribe must be a boolean' });
    }

    const client = await clientPromise;
    const db = client.db('Garamond');
    const users = db.collection('Users');

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { mailingList: subscribe, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: subscribe 
        ? 'Successfully subscribed to the mailing list!' 
        : 'Successfully unsubscribed from the mailing list!',
      success: true,
      isSubscribed: subscribe
    });
  } catch (error) {
    console.error('[updateMailingList] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
