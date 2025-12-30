import { useEffect, useReducer, useRef } from 'react';
import { checkWinner } from '../functions/checkWinner';
import { recordGameMetrics, getWinningCondition } from '../../../utils/gameMetricsCollector';
import { getStoredUser } from '../../../utils/session';

const COLUMNS = 7;
const ROWS = 6;

const initialState = () => ({
  board: Array(COLUMNS * ROWS).fill(null).map(() => ({ value: null, player: null })),
  turn: 'red',
  winner: null,
  winningCells: [],
  moveCount: 0,
  selectedDisc: { value: null, player: null },
  droppingColumn: null,
  gameMessage: 'Welcome to Connect 7! Select a disc (1, 2, or 3), then click a column to drop.',
  showMessage: true,
  moveList: [],
  perMoveStats: [],
  lastMoveTimestamp: typeof window !== 'undefined' ? Date.now() : 0,
  isMobile: typeof window !== 'undefined' ? window.matchMedia('(max-width: 700px)').matches : false,
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_IS_MOBILE':
      return { ...state, isMobile: action.isMobile };

    case 'SELECT_DISC': {
      const { player, value } = action;
      if (state.winner) return state;
      if (player !== state.turn) {
        return {
          ...state,
          gameMessage: `It's ${state.turn === 'red' ? 'Red' : 'Yellow'}'s turn!`,
          showMessage: true,
        };
      }
      return {
        ...state,
        selectedDisc: { value, player },
        gameMessage: `Disc ${value} selected. Click a column header to drop.`,
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
      if (!sel.value || sel.player !== state.turn) return state;

      // Find lowest empty row
      let targetRow = -1;
      for (let row = ROWS - 1; row >= 0; row--) {
        const index = row * COLUMNS + column;
        if (state.board[index].value === null) {
          targetRow = row;
          break;
        }
      }

      if (targetRow === -1) return state;

      const targetIndex = targetRow * COLUMNS + column;
      const updatedBoard = state.board.map((cell, i) => 
        i === targetIndex ? { value: sel.value, player: sel.player } : cell
      );

      const moveTimeMs = timeNow != null ? Math.max(0, timeNow - state.lastMoveTimestamp) : null;
      const updatedMoveList = [...state.moveList, { column, row: targetRow, player: state.turn, value: sel.value }];
      const updatedPerMoveStats = [...state.perMoveStats, {
        turn: state.turn,
        column,
        row: targetRow,
        value: sel.value,
        moveTimeMs,
      }];

      // Check for winner
      const winResult = checkWinner(updatedBoard, COLUMNS, ROWS);
      
      if (winResult.winner) {
        return {
          ...state,
          board: updatedBoard,
          winner: winResult.winner,
          winningCells: winResult.winningCells,
          moveCount: state.moveCount + 1,
          selectedDisc: { value: null, player: null },
          droppingColumn: null,
          gameMessage: `${winResult.winner === 'red' ? 'Red' : 'Yellow'} wins!`,
          showMessage: true,
          moveList: updatedMoveList,
          perMoveStats: updatedPerMoveStats,
          lastMoveTimestamp: timeNow || state.lastMoveTimestamp,
        };
      }

      // Check for tie
      const isTie = updatedBoard.every(cell => cell.value !== null);
      if (isTie) {
        return {
          ...state,
          board: updatedBoard,
          winner: 'tie',
          moveCount: state.moveCount + 1,
          selectedDisc: { value: null, player: null },
          droppingColumn: null,
          gameMessage: "It's a tie!",
          showMessage: true,
          moveList: updatedMoveList,
          perMoveStats: updatedPerMoveStats,
          lastMoveTimestamp: timeNow || state.lastMoveTimestamp,
        };
      }

      // Switch turns
      const nextPlayer = state.turn === 'red' ? 'yellow' : 'red';
      return {
        ...state,
        board: updatedBoard,
        turn: nextPlayer,
        moveCount: state.moveCount + 1,
        selectedDisc: { value: null, player: null },
        droppingColumn: null,
        gameMessage: `${nextPlayer === 'red' ? 'Red' : 'Yellow'}'s turn`,
        showMessage: true,
        moveList: updatedMoveList,
        perMoveStats: updatedPerMoveStats,
        lastMoveTimestamp: timeNow || state.lastMoveTimestamp,
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

export function useConnect7({ gamemode = 0, difficulty = 1 }) {
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
        gameType: 'Connect7',
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
    selectDisc: (player, value) => {
      dispatch({ type: 'SELECT_DISC', player, value });
    },
    
    dropDisc: (column) => {
      dispatch({ type: 'START_DROP', column });
      
      // Complete drop after animation (500ms)
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_DROP', column, timeNow: Date.now() });
      }, 500);
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
