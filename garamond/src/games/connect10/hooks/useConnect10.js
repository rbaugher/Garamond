import { useEffect, useReducer, useRef } from 'react';
import { checkWinner } from '../functions/checkWinner';
import { recordGameMetrics, getWinningCondition } from '../../../utils/gameMetricsCollector';
import { getStoredUser } from '../../../utils/session';

const COLUMNS = 7;
const ROWS = 6;

const initialState = () => ({
  board: Array(COLUMNS * ROWS).fill(null).map(() => ({ value: null, player: null, isSpecial: false })),
  turn: 'red',
  winner: null,
  winningCells: [],
  completedLines: [], // Array of { player, cells, lineId } for completed 10s
  redScore: 0, // Number of completed lines for red
  yellowScore: 0, // Number of completed lines for yellow
  moveCount: 0,
  selectedDisc: { value: null, player: null, isSpecial: false, nodeType: null },
  droppingColumn: null,
  gameMessage: 'Welcome to Reactor Control! Select a node and drop it into a column to stabilize the grid.',
  showMessage: true,
  moveList: [],
  perMoveStats: [],
  lastMoveTimestamp: typeof window !== 'undefined' ? Date.now() : 0,
  isMobile: typeof window !== 'undefined' ? window.matchMedia('(max-width: 700px)').matches : false,
  
  // Player supplies (nodes remaining)
  redSupply: {
    1: 7,  // Power Node 1
    2: 5,  // Power Node 2
    3: 3,  // Power Node 3
    '-1': 1, // Coolant Node
    0: 1,  // Shutdown/Assassin Node
  },
  yellowSupply: {
    1: 7,
    2: 5,
    3: 3,
    '-1': 1,
    0: 1,
  },
  
  // Special ability tracking
  redPowerRerouteUnlocked: false,
  yellowPowerRerouteUnlocked: false,
  redPowerRerouteUsed: false,
  yellowPowerRerouteUsed: false,
  
  // UI state for Power Reroute mode
  powerRerouteMode: false, // true when player is selecting a node to reclaim
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_IS_MOBILE':
      return { ...state, isMobile: action.isMobile };

    case 'SELECT_DISC': {
      const { value, isSpecial, nodeType } = action;
      const player = state.turn;
      
      if (state.winner) return state;
      if (state.powerRerouteMode) {
        return {
          ...state,
          gameMessage: 'Exit Power Reroute mode first!',
          showMessage: true,
        };
      }

      // Check if player has this node in supply
      const supply = player === 'red' ? state.redSupply : state.yellowSupply;
      const valueKey = String(value);
      
      if (supply[valueKey] <= 0) {
        return {
          ...state,
          gameMessage: `No ${nodeType || 'nodes'} remaining!`,
          showMessage: true,
        };
      }

      return {
        ...state,
        selectedDisc: { value, player, isSpecial, nodeType },
        gameMessage: `${nodeType || `Node ${value}`} selected. Click a column header to drop.`,
        showMessage: true,
      };
    }

    case 'START_DROP': {
      const { column } = action;
      const sel = state.selectedDisc;
      if (!sel.value || sel.player !== state.turn || state.winner) {
        return state;
      }
      
      // Find lowest empty row
      let targetRow = -1;
      for (let row = ROWS - 1; row >= 0; row--) {
        const index = row * COLUMNS + column;
        if (state.board[index].value === null) {
          targetRow = row;
          break;
        }
      }

      if (targetRow === -1) {
        return {
          ...state,
          gameMessage: 'Column is full! Choose another column.',
          showMessage: true,
        };
      }

      return {
        ...state,
        droppingColumn: column,
        showMessage: false,
      };
    }

    case 'COMPLETE_DROP': {
      const { column, timeNow } = action;
      if (state.droppingColumn !== column) return state;

      const sel = state.selectedDisc;
      if (sel.value === null || sel.player !== state.turn) return state;

      let updatedBoard = [...state.board];
      let targetRow = -1;
      
      // Shutdown/Assassin Node (value 0) - special placement logic
      if (sel.value === 0) {
        // Find where the Shutdown node will land
        for (let row = ROWS - 1; row >= 0; row--) {
          const index = row * COLUMNS + column;
          if (updatedBoard[index].value === null) {
            targetRow = row;
            break;
          }
        }

        if (targetRow === -1) return state; // Column full

        // Remove all nodes below the Shutdown position (except those in completed lines)
        const completedCells = new Set(state.completedLines.flatMap(line => line.cells));
        
        for (let row = targetRow + 1; row < ROWS; row++) {
          const index = row * COLUMNS + column;
          // Don't remove if it's in a completed line or if it's a special node
          if (!completedCells.has(index) && !updatedBoard[index].isSpecial) {
            updatedBoard[index] = { value: null, player: null, isSpecial: false };
          } else if (completedCells.has(index)) {
            // Stop removing when we hit a completed line
            break;
          }
        }

        // Place the Shutdown node
        const targetIndex = targetRow * COLUMNS + column;
        updatedBoard[targetIndex] = { value: 0, player: sel.player, isSpecial: true };
        
        // Shutdown nodes cannot complete a 10 - skip scoring
        // Update supplies
        const supply = sel.player === 'red' ? 'redSupply' : 'yellowSupply';
        const updatedSupply = { ...state[supply], '0': state[supply]['0'] - 1 };
        
        const nextPlayer = state.turn === 'red' ? 'yellow' : 'red';
        return {
          ...state,
          board: updatedBoard,
          turn: nextPlayer,
          [supply]: updatedSupply,
          moveCount: state.moveCount + 1,
          selectedDisc: { value: null, player: null, isSpecial: false, nodeType: null },
          droppingColumn: null,
          gameMessage: `Shutdown activated! ${nextPlayer === 'red' ? 'Red' : 'Yellow'}'s turn.`,
          showMessage: true,
          lastMoveTimestamp: timeNow || state.lastMoveTimestamp,
        };
      }

      // Normal node placement (including Coolant -1)
      // Find lowest empty row
      for (let row = ROWS - 1; row >= 0; row--) {
        const index = row * COLUMNS + column;
        if (updatedBoard[index].value === null) {
          targetRow = row;
          break;
        }
      }

      if (targetRow === -1) return state; // Column full

      const targetIndex = targetRow * COLUMNS + column;
      const isSpecialNode = sel.value === -1;
      updatedBoard[targetIndex] = { 
        value: sel.value, 
        player: sel.player, 
        isSpecial: isSpecialNode 
      };

      // Update supply
      const supplyKey = sel.player === 'red' ? 'redSupply' : 'yellowSupply';
      const valueKey = String(sel.value);
      const updatedSupply = { ...state[supplyKey], [valueKey]: state[supplyKey][valueKey] - 1 };

      // Check for new completed lines
      const lastMove = { player: sel.player, column, row: targetRow };
      const newLines = checkWinner(updatedBoard, COLUMNS, ROWS, state.completedLines, lastMove);
      
      const allCompletedLines = [...state.completedLines, ...newLines];
      const completedCellSet = new Set(allCompletedLines.flatMap(line => line.cells));
      
      // Update scores
      let redScore = state.redScore;
      let yellowScore = state.yellowScore;
      let rerouteUnlockedRed = state.redPowerRerouteUnlocked;
      let rerouteUnlockedYellow = state.yellowPowerRerouteUnlocked;
      
      for (const line of newLines) {
        if (line.player === 'red') {
          redScore++;
          if (!rerouteUnlockedRed && redScore >= 1) rerouteUnlockedRed = true;
        } else if (line.player === 'yellow') {
          yellowScore++;
          if (!rerouteUnlockedYellow && yellowScore >= 1) rerouteUnlockedYellow = true;
        }
      }

      // Check for winner (first to 3 lines)
      let winner = null;
      let gameMessage = '';
      
      if (redScore >= 3) {
        winner = 'red';
        gameMessage = 'Red stabilizes the reactor and wins!';
      } else if (yellowScore >= 3) {
        winner = 'yellow';
        gameMessage = 'Yellow stabilizes the reactor and wins!';
      } else if (newLines.length > 0) {
        const scoreInfo = newLines.map(l => l.player === 'red' ? 'Red' : 'Yellow').join(', ');
        gameMessage = `Line${newLines.length > 1 ? 's' : ''} completed! ${scoreInfo} scored! (Red: ${redScore}/3, Yellow: ${yellowScore}/3)`;
      } else {
        const nextPlayer = state.turn === 'red' ? 'yellow' : 'red';
        gameMessage = `${nextPlayer === 'red' ? 'Red' : 'Yellow'}'s turn`;
      }

      const nextPlayer = state.turn === 'red' ? 'yellow' : 'red';
      
      return {
        ...state,
        board: updatedBoard,
        turn: winner ? state.turn : nextPlayer,
        winner,
        winningCells: Array.from(completedCellSet),
        completedLines: allCompletedLines,
        redScore,
        yellowScore,
        redPowerRerouteUnlocked: rerouteUnlockedRed,
        yellowPowerRerouteUnlocked: rerouteUnlockedYellow,
        [supplyKey]: updatedSupply,
        moveCount: state.moveCount + 1,
        selectedDisc: { value: null, player: null, isSpecial: false, nodeType: null },
        droppingColumn: null,
        gameMessage,
        showMessage: true,
        lastMoveTimestamp: timeNow || state.lastMoveTimestamp,
      };
    }

    case 'ACTIVATE_POWER_REROUTE': {
      const player = state.turn;
      const unlocked = player === 'red' ? state.redPowerRerouteUnlocked : state.yellowPowerRerouteUnlocked;
      const used = player === 'red' ? state.redPowerRerouteUsed : state.yellowPowerRerouteUsed;
      
      if (!unlocked || used || state.winner) {
        return state;
      }
      
      return {
        ...state,
        powerRerouteMode: true,
        gameMessage: 'Power Reroute: Click a non-special node (not in a completed line) to reclaim it.',
        showMessage: true,
      };
    }

    case 'CANCEL_POWER_REROUTE': {
      return {
        ...state,
        powerRerouteMode: false,
        gameMessage: `${state.turn === 'red' ? 'Red' : 'Yellow'}'s turn`,
        showMessage: true,
      };
    }

    case 'RECLAIM_NODE': {
      const { index } = action;
      
      if (!state.powerRerouteMode) return state;
      
      const cell = state.board[index];
      
      // Validate the reclaim
      if (cell.value === null || cell.isSpecial) {
        return {
          ...state,
          gameMessage: 'Cannot reclaim empty or special nodes!',
          showMessage: true,
        };
      }
      
      // Check if this cell is in a completed line
      const completedCells = new Set(state.completedLines.flatMap(line => line.cells));
      if (completedCells.has(index)) {
        return {
          ...state,
          gameMessage: 'Cannot reclaim nodes from completed lines!',
          showMessage: true,
        };
      }
      
      // Remove the node and return it to supply
      const updatedBoard = [...state.board];
      updatedBoard[index] = { value: null, player: null, isSpecial: false };
      
      const player = state.turn;
      const supplyKey = player === 'red' ? 'redSupply' : 'yellowSupply';
      const usedKey = player === 'red' ? 'redPowerRerouteUsed' : 'yellowPowerRerouteUsed';
      const valueKey = String(cell.value);
      
      const updatedSupply = { 
        ...state[supplyKey], 
        [valueKey]: state[supplyKey][valueKey] + 1 
      };
      
      const nextPlayer = player === 'red' ? 'yellow' : 'red';
      
      return {
        ...state,
        board: updatedBoard,
        [supplyKey]: updatedSupply,
        [usedKey]: true,
        powerRerouteMode: false,
        turn: nextPlayer,
        moveCount: state.moveCount + 1,
        gameMessage: `Node reclaimed! ${nextPlayer === 'red' ? 'Red' : 'Yellow'}'s turn.`,
        showMessage: true,
      };
    }

    case 'RESET': {
      const newState = initialState();
      return {
        ...newState,
        isMobile: state.isMobile,
      };
    }

    default:
      return state;
  }
}

export function useConnect10({ gamemode = 0, difficulty = 1 }) {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const gamemodeRef = useRef(gamemode);
  const difficultyRef = useRef(difficulty);
  const gameEndRecordedRef = useRef(false);

  // Handle mobile resize
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const handler = (e) => dispatch({ type: 'SET_IS_MOBILE', isMobile: e.matches });
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Record game metrics when game ends
  useEffect(() => {
    if (state.winner && !gameEndRecordedRef.current) {
      gameEndRecordedRef.current = true;
      const user = getStoredUser();
      const playerName = user?.username || 'Guest';
      
      recordGameMetrics({
        playerName,
        opponentName: gamemode === 0 ? 'Computer' : 'Player 2',
        gameType: 'ReactorControl',
        outcome: state.winner === 'tie' ? 'tie' : (state.winner === 'red' ? 'win' : 'loss'),
        difficulty: gamemode === 0 ? ['Easy', 'Medium', 'Hard'][difficulty] : 'N/A',
        winningCondition: state.winner === 'tie' ? null : getWinningCondition(state.winningCells),
        moveList: state.moveList,
        gameDuration: state.perMoveStats.reduce((sum, stat) => sum + (stat.moveTimeMs || 0), 0),
        perMoveStats: state.perMoveStats,
      });
    }
  }, [state.winner, gamemode, difficulty]);

  // Reset game when difficulty or gamemode changes (if game has started)
  useEffect(() => {
    if (gamemode !== gamemodeRef.current || difficulty !== difficultyRef.current) {
      if (state.moveCount > 0) {
        dispatch({ type: 'RESET' });
      }
      gamemodeRef.current = gamemode;
      difficultyRef.current = difficulty;
    }
  }, [gamemode, difficulty, state.moveCount]);

  const actions = {
    selectDisc: (value, isSpecial = false, nodeType = null) => {
      dispatch({ type: 'SELECT_DISC', value, isSpecial, nodeType });
    },
    
    dropDisc: (column) => {
      dispatch({ type: 'START_DROP', column });
      
      // Complete drop after animation (500ms)
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_DROP', column, timeNow: Date.now() });
      }, 500);
    },
    
    activatePowerReroute: () => {
      dispatch({ type: 'ACTIVATE_POWER_REROUTE' });
    },
    
    cancelPowerReroute: () => {
      dispatch({ type: 'CANCEL_POWER_REROUTE' });
    },
    
    reclaimNode: (index) => {
      dispatch({ type: 'RECLAIM_NODE', index });
    },
    
    reset: () => {
      gameEndRecordedRef.current = false;
      dispatch({ type: 'RESET' });
    },
  };

  const anyDiscPlayed = state.moveCount > 0;
  const playerNickname = getStoredUser()?.username || 'Guest';

  return {
    state,
    actions,
    anyDiscPlayed,
    playerNickname,
  };
}
