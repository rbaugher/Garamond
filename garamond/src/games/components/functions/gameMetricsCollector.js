// src/games/components/functions/gameMetricsCollector.js

/**
 * Collects game metrics and sends them to the backend
 * @param {Object} params - Metrics parameters
 * @param {string} params.playerName - Player's nickname (unique identifier)
 * @param {string} params.opponentName - Name of opponent (O in singleplayer "Computer", or player name in multiplayer)
 * @param {string} params.gameType - Type of game (e.g., 'Tic Tac Toe Squared')
 * @param {string} params.outcome - Game outcome ('Win', 'Loss', 'Tie')
 * @param {number|null} params.difficulty - Difficulty level (0, 1, 2) or null for multiplayer
 * @param {string|null} params.winningCondition - How the game was won (e.g., 'row_0', 'column_1', 'diagonal_main', 'tie')
 * @param {Array} params.moveList - Array of all moves made
 * @param {number} params.gameDuration - Duration of game in seconds
 * @returns {Promise<Object>} Response from server
 */
import { getStoredUserName } from '../../../utils/session';

export async function recordGameMetrics({
  playerName = undefined,
  playerNickname = undefined,
  opponentName = "Computer",
  gameType = "Tic Tac Toe Squared",
  outcome,
  difficulty = null,
  winningCondition = null,
  moveList = [],
  gameDuration = 0,
  score = null,
  level = null,
  asteroidsDestroyed = null
}) {
  try {
    // Validate required fields
    if (!outcome) {
      throw new Error("Outcome is required");
    }

    // Always use nickname as playerName for metrics
    const storedNickname = getStoredUserName();
    const finalPlayerName = storedNickname || playerName || 'player';

    const payload = {
      playerName: finalPlayerName, // This is the nickname
      playerNickname: playerNickname || storedNickname || null,
      opponentName,
      gameType,
      outcome,
      difficulty,
      winningCondition,
      moveList,
      gameDuration,
      score,
      level,
      asteroidsDestroyed,
      timestamp: new Date().toISOString()
    };
    
    console.log("Sending game metrics payload:", JSON.stringify(payload, null, 2));
    console.log("Score value:", score, "Level value:", level, "Asteroids destroyed:", asteroidsDestroyed);
    
    const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';

    const response = await fetch(`${apiBase}/api/gameMetrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    let text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

    if (!response.ok) {
      throw new Error((data && data.message) || "Failed to record game metrics");
    }

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
