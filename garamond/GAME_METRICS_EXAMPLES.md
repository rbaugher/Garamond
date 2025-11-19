// Example Game Metrics Records for MongoDB
// These show what data will be stored in the "Game Metrics" collection

// Example 1: Player wins on Easy difficulty (single player vs Computer)
{
  "_id": ObjectId("..."),
  "playerName": "Player",
  "opponentName": "Computer",
  "gameType": "Tic Tac Toe Squared",
  "outcome": "Win",
  "difficulty": 0,
  "winningCondition": "row_0",
  "moveList": [
    { "index": 4, "value": 3, "player": "X" },
    { "index": 0, "value": 1, "player": "O" },
    { "index": 1, "value": 4, "player": "X" },
    { "index": 3, "value": 2, "player": "O" },
    { "index": 2, "value": 5, "player": "X" }
  ],
  "gameDuration": 32,
  "timestamp": "2025-11-18T21:10:45.123Z",
  "createdAt": ISODate("2025-11-18T21:10:45.123Z")
}

// Example 2: Computer (O) wins on Hard difficulty
{
  "_id": ObjectId("..."),
  "playerName": "Player",
  "opponentName": "Computer",
  "gameType": "Tic Tac Toe Squared",
  "outcome": "Loss",
  "difficulty": 2,
  "winningCondition": "diagonal_main",
  "moveList": [
    { "index": 4, "value": 3, "player": "X" },
    { "index": 0, "value": 1, "player": "O" },
    { "index": 3, "value": 4, "player": "X" },
    { "index": 4, "value": 6, "player": "O" },
    { "index": 8, "value": 5, "player": "X" },
    { "index": 8, "value": 6, "player": "O" }
  ],
  "gameDuration": 58,
  "timestamp": "2025-11-18T21:12:15.456Z",
  "createdAt": ISODate("2025-11-18T21:12:15.456Z")
}

// Example 3: Tie game
{
  "_id": ObjectId("..."),
  "playerName": "Player",
  "opponentName": "Computer",
  "gameType": "Tic Tac Toe Squared",
  "outcome": "Tie",
  "difficulty": 1,
  "winningCondition": "tie",
  "moveList": [
    { "index": 4, "value": 3, "player": "X" },
    { "index": 0, "value": 1, "player": "O" },
    { "index": 2, "value": 4, "player": "X" },
    { "index": 1, "value": 2, "player": "O" },
    { "index": 3, "value": 5, "player": "X" },
    { "index": 5, "value": 6, "player": "O" },
    { "index": 6, "value": 4, "player": "X" },
    { "index": 7, "value": 3, "player": "O" },
    { "index": 8, "value": 5, "player": "X" }
  ],
  "gameDuration": 87,
  "timestamp": "2025-11-18T21:15:30.789Z",
  "createdAt": ISODate("2025-11-18T21:15:30.789Z")
}

// Example 4: Multiplayer game (Player X vs Player O)
{
  "_id": ObjectId("..."),
  "playerName": "Player X",
  "opponentName": "Player O",
  "gameType": "Tic Tac Toe Squared",
  "outcome": "Win",
  "difficulty": null,
  "winningCondition": "column_1",
  "moveList": [
    { "index": 4, "value": 3, "player": "X" },
    { "index": 0, "value": 1, "player": "O" },
    { "index": 1, "value": 4, "player": "X" },
    { "index": 3, "value": 2, "player": "O" },
    { "index": 7, "value": 5, "player": "X" }
  ],
  "gameDuration": 45,
  "timestamp": "2025-11-18T21:20:10.321Z",
  "createdAt": ISODate("2025-11-18T21:20:10.321Z")
}

// Winning Conditions Reference:
// ==============================
// - 'row_0': Top row (indices 0, 1, 2)
// - 'row_1': Middle row (indices 3, 4, 5)
// - 'row_2': Bottom row (indices 6, 7, 8)
// - 'column_0': Left column (indices 0, 3, 6)
// - 'column_1': Middle column (indices 1, 4, 7)
// - 'column_2': Right column (indices 2, 5, 8)
// - 'diagonal_main': Top-left to bottom-right (indices 0, 4, 8)
// - 'diagonal_anti': Top-right to bottom-left (indices 2, 4, 6)
// - 'tie': No winner, all tiles filled or no more moves possible

// MongoDB Query Examples:
// =======================

// Get all games where player won
// db.getCollection("Game Metrics").find({ outcome: "Win" })

// Get all games where player lost
// db.getCollection("Game Metrics").find({ outcome: "Loss" })

// Get all tie games
// db.getCollection("Game Metrics").find({ outcome: "Tie" })

// Get all Hard difficulty games
// db.getCollection("Game Metrics").find({ difficulty: 2 })

// Get average game duration
// db.getCollection("Game Metrics").aggregate([
//   { $group: { _id: null, avgDuration: { $avg: "$gameDuration" } } }
// ])

// Get games by difficulty
// db.getCollection("Game Metrics").aggregate([
//   { $group: { _id: "$difficulty", count: { $sum: 1 } } }
// ])

// Get win/loss/tie statistics
// db.getCollection("Game Metrics").aggregate([
//   { $group: { _id: "$outcome", count: { $sum: 1 } } }
// ])

// Get win rate by difficulty
// db.getCollection("Game Metrics").aggregate([
//   { $match: { difficulty: { $ne: null } } },
//   { $group: { 
//       _id: "$difficulty", 
//       wins: { $sum: { $cond: [{ $eq: ["$outcome", "Win"] }, 1, 0] } },
//       losses: { $sum: { $cond: [{ $eq: ["$outcome", "Loss"] }, 1, 0] } },
//       ties: { $sum: { $cond: [{ $eq: ["$outcome", "Tie"] }, 1, 0] } }
//     } 
//   }
// ])
