// src/games/components/functions/gameMetricsCollector.js

/**
 * Collects game metrics and sends them to the backend
 * @param {Object} params - Metrics parameters
 * @param {string} params.playerName - Name of the player (X)
 * @param {string} params.opponentName - Name of opponent (O in singleplayer "Computer", or player name in multiplayer)
 * @param {string} params.gameType - Type of game (e.g., 'Tic Tac Toe Squared')
 * @param {string} params.outcome - Game outcome ('Win', 'Loss', 'Tie')
 * @param {number|null} params.difficulty - Difficulty level (0, 1, 2) or null for multiplayer
 * @param {string|null} params.winningCondition - How the game was won (e.g., 'row_0', 'column_1', 'diagonal_main', 'tie')
 * @param {Array} params.moveList - Array of all moves made
 * @param {number} params.gameDuration - Duration of game in seconds
 * @returns {Promise<Object>} Response from server
 */
export async function recordGameMetrics({
  playerName = "Player",
  opponentName = "Computer",
  gameType = "Tic Tac Toe Squared",
  outcome,
  difficulty = null,
  winningCondition = null,
  moveList = [],
  gameDuration = 0
}) {
  try {
    // Validate required fields
    if (!outcome) {
      throw new Error("Outcome is required");
    }

    const payload = {
      playerName,
      opponentName,
      gameType,
      outcome,
      difficulty,
      winningCondition,
      moveList,
      gameDuration,
      timestamp: new Date().toISOString()
    };

    const response = await fetch("/api/gameMetrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to record game metrics");
    }

    const data = await response.json();
    console.log("Game metrics recorded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error recording game metrics:", error);
    throw error;
  }
}

/**
 * Determines the winning condition based on winning tiles
 * @param {Array<number>} winningTiles - Array of tile indices that form the winning line
 * @returns {string} Description of the winning condition
 */
export function getWinningCondition(winningTiles) {
  if (!winningTiles || winningTiles.length === 0) {
    return null;
  }

  // Winning combinations for Tic Tac Toe (3x3 board)
  const winningConditions = [
    { indices: [0, 1, 2], type: 'row_0' },
    { indices: [3, 4, 5], type: 'row_1' },
    { indices: [6, 7, 8], type: 'row_2' },
    { indices: [0, 3, 6], type: 'column_0' },
    { indices: [1, 4, 7], type: 'column_1' },
    { indices: [2, 5, 8], type: 'column_2' },
    { indices: [0, 4, 8], type: 'diagonal_main' },
    { indices: [2, 4, 6], type: 'diagonal_anti' }
  ];

  // Sort both arrays for comparison
  const sortedWinning = [...winningTiles].sort();

  for (const condition of winningConditions) {
    const sortedCondition = [...condition.indices].sort();
    if (JSON.stringify(sortedWinning) === JSON.stringify(sortedCondition)) {
      return condition.type;
    }
  }

  return 'unknown';
}
