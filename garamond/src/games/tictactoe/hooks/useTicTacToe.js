import { useEffect, useReducer, useRef } from 'react';
import { checkWinner } from '../functions/helperFunctions/checkWinner';
import { noPossibleMove, validMove } from '../functions/helperFunctions/Validator';
import { valuesMap } from '../functions/helperFunctions/pieceHelpers';
import { getBotMove } from '../functions/botMoves/botMove';
import { recordGameMetrics, getWinningCondition } from '../../../utils/gameMetricsCollector';
import { getStoredUser } from '../../../utils/session';

const initialState = () => ({
  board: Array(9).fill(null).map(() => ({ value: null, player: null })),
  turn: Math.random() < 0.5 ? 'X' : 'O',
  winner: { player: null, winningTiles: [] },
  moveCount: 0,
  queueO: Array(6).fill(false),
  deadO: Array(6).fill(false),
  queueX: Array(6).fill(false),
  deadX: Array(6).fill(false),
  winningTiles: [],
  lastSelected: { value: null, index: null, player: null },
  gameMessage: 'Welcome to Tic Tac Toe Squared! Select a tile to begin.',
  showMessage: true,
  botMove: { moveIdx: null, pieceIdx: null, value: null, player: 'O' },
  moveList: Array(12).fill({ index: null, value: null, player: null }),
  perMoveStats: Array(12).fill({ turn: null, moveIdx: null, pieceValue: null, isTakeover: null, prevValue: null, prevOwner: null, moveTimeMs: null, createdThreats: 0, blockedThreat: false }),
  lastMoveTimestamp: typeof window !== 'undefined' ? Date.now() : 0,
  isMobile: typeof window !== 'undefined' ? window.matchMedia('(max-width: 700px)').matches : false,
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_IS_MOBILE':
      return { ...state, isMobile: action.isMobile };
    case 'SELECT_PIECE': {
      const { player, idx, value } = action;
      if (state.winner.player) return state;
      const queueKey = player === 'O' ? 'queueO' : 'queueX';
      const updatedQueue = state[queueKey].map((u, i) => (i === idx ? !u : u));
      return {
        ...state,
        [queueKey]: updatedQueue,
        lastSelected: { value, index: idx, player },
      };
    }
    case 'PLACE_PIECE': {
      const { tileIndex, timeNow } = action;
      if (state.winner.player) return state;
      const sel = state.lastSelected;
      if (sel.value == null || sel.player !== state.turn) return state;
      // validMove may set messages via callback
      let gameMessage = state.gameMessage;
      let showMessage = state.showMessage;
      const canMove = validMove(state.board, tileIndex, sel, (msg) => { gameMessage = msg; });
      if (!canMove) {
        showMessage = true;
        return { ...state, gameMessage, showMessage };
      }
      const prevTile = state.board[tileIndex];
      const updatedBoard = state.board.map((b, i) => (i === tileIndex ? { value: sel.value, player: sel.player } : b));
      const deadKey = sel.player === 'O' ? 'deadO' : 'deadX';
      const updatedDead = state[deadKey].map((d, i) => (i === sel.index ? true : d));
      const updatedMoveList = state.moveList.map((d, i) => (i === state.moveCount ? { index: tileIndex, value: sel.value, player: sel.player } : d));
      const isTakeover = prevTile.player !== null && prevTile.player !== sel.player;
      const winningConditions = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      let createdThreats = 0;
      let blockedThreat = false;
      for (let condition of winningConditions) {
        if (condition.includes(tileIndex)) {
          const preLine = condition.map(i => state.board[i]);
          const postLine = condition.map(i => updatedBoard[i]);
          const preOppCount = preLine.filter(t => t.player === (sel.player === 'X' ? 'O' : 'X')).length;
          const preEmptyCount = preLine.filter(t => t.value === null).length;
          if (preOppCount === 2 && preEmptyCount === 1) blockedThreat = true;
          const postBotCount = postLine.filter(t => t.player === sel.player).length;
          const postEmptyCount = postLine.filter(t => t.value === null).length;
          if (postBotCount === 2 && postEmptyCount === 1) createdThreats++;
        }
      }
      const moveTimeMs = timeNow != null ? Math.max(0, timeNow - state.lastMoveTimestamp) : null;
      const updatedPerMoveStats = state.perMoveStats.map((d, i) => (
        i === state.moveCount ? {
          turn: sel.player,
          moveIdx: tileIndex,
          pieceValue: sel.value,
          isTakeover,
          prevValue: prevTile.value,
          prevOwner: prevTile.player,
          moveTimeMs,
          createdThreats,
          blockedThreat
        } : d
      ));
      return {
        ...state,
        board: updatedBoard,
        [deadKey]: updatedDead,
        moveList: updatedMoveList,
        perMoveStats: updatedPerMoveStats,
        lastMoveTimestamp: timeNow != null ? timeNow : state.lastMoveTimestamp,
        moveCount: state.moveCount + 1,
        lastSelected: { value: null, index: null, player: null },
      };
    }
    case 'ADVANCE_TURN':
      return { ...state, turn: state.turn === 'X' ? 'O' : 'X' };
    case 'SET_WINNER':
      return { ...state, winner: action.winner, winningTiles: action.winningTiles ?? [] };
    case 'SET_MESSAGE':
      return { ...state, gameMessage: action.message, showMessage: action.show ?? true };
    case 'SET_BOT_MOVE':
      return { ...state, botMove: action.botMove, lastSelected: action.lastSelected ?? state.lastSelected };
    case 'END_GAME_FREEZE':
      return {
        ...state,
        showMessage: true,
        queueO: Array(6).fill(true),
        queueX: Array(6).fill(true),
        moveList: Array(12).fill({ index: null, value: null, player: null }),
        perMoveStats: Array(12).fill({ turn: null, moveIdx: null, pieceValue: null, isTakeover: null, prevValue: null, prevOwner: null, moveTimeMs: null, createdThreats: 0, blockedThreat: false }),
      };
    case 'RESET':
      return {
        ...initialState(),
        turn: Math.random() < 0.5 ? 'X' : 'O',
      };
    default:
      return state;
  }
}

export function useTicTacToe({ gamemode, difficulty }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const botMoveTimeout = useRef(null);
  const gameStartTimeRef = useRef(Date.now());

  const user = getStoredUser();
  const playerNickname = user?.nickname || 'Player';
  const anyTilePlayed = state.moveCount > 0;

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const handler = (e) => dispatch({ type: 'SET_IS_MOBILE', isMobile: e.matches });
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Bot decision
  useEffect(() => {
    // Only run this effect when it's the bot's turn
    if (gamemode !== 0 || state.turn !== 'O' || state.winner.player) {
      return;
    }
    
    const deadOCount = state.deadO.filter(Boolean).length;
    const deadXCount = state.deadX.filter(Boolean).length;
    const effectiveDifficulty = user ? difficulty : Math.min(difficulty ?? 1, 2);
    
    if (Math.abs(deadOCount - deadXCount) <= 1) {
      const bm = getBotMove(state.board, state.deadO, effectiveDifficulty, state.deadX);
      if (bm.moveIdx !== null) {
        dispatch({
          type: 'SET_BOT_MOVE',
          botMove: { moveIdx: bm.moveIdx, pieceIdx: bm.pieceIdx, value: valuesMap[bm.pieceIdx], player: 'O' },
          lastSelected: { value: valuesMap[bm.pieceIdx], index: bm.pieceIdx, player: 'O' },
        });
      }
    }
  }, [gamemode, state.turn, state.winner.player, difficulty, user]);

  // Execute bot move after delay
  useEffect(() => {
    if (state.turn === 'O' && state.lastSelected.value != null && state.lastSelected.player === 'O' && !state.winner.player && state.botMove.moveIdx !== null) {
      botMoveTimeout.current = setTimeout(() => {
        actions.placePiece(state.botMove.moveIdx);
        botMoveTimeout.current = null;
      }, 2000);
    }
    return () => {
      if (botMoveTimeout.current) {
        clearTimeout(botMoveTimeout.current);
        botMoveTimeout.current = null;
      }
    };
  }, [state.botMove, state.turn, state.lastSelected, state.winner.player]);

  // Auto-hide game messages after 5 seconds
  useEffect(() => {
    if (state.showMessage) {
      const timer = setTimeout(() => actions.setMessage(state.gameMessage, false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.gameMessage, state.showMessage]);

  // Auto-reset winning tiles after 2 seconds
  useEffect(() => {
    if (state.winner.player) {
      const t = setTimeout(() => {
        // Clear highlight only; preserve winner
        // Using SET_WINNER with same winner but empty winningTiles
        dispatch({ type: 'SET_WINNER', winner: state.winner, winningTiles: [] });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state.winner]);

  // Win/Tie detection and metrics
  useEffect(() => {
    const winResult = checkWinner(state.board);
    if (winResult) {
      dispatch({ type: 'SET_MESSAGE', message: `Player ${winResult.player} wins!` });
      dispatch({ type: 'SET_WINNER', winner: winResult, winningTiles: winResult.winningTiles });
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const winningCondition = getWinningCondition(winResult.winningTiles);
      const outcome = winResult.player === 'X' ? 'Win' : 'Loss';
      const perMoveStats = state.perMoveStats.filter((m) => m.moveIdx !== null);
      const openingX = state.moveList.find((m) => m.player === 'X' && m.index !== null);
      const openingStats = openingX ? { firstMoveIdx: openingX.index, firstPieceValue: openingX.value } : null;
      if (user) {
      recordGameMetrics({
        playerName: gamemode === 0 ? playerNickname : `${playerNickname} (X)`,
        opponentName: gamemode === 0 ? 'Computer' : 'Player O',
        gameType: 'Tic Tac Toe Squared',
        outcome,
        difficulty: gamemode === 0 ? difficulty : null,
        winningCondition,
        moveList: state.moveList.filter((m) => m.index !== null),
        gameDuration,
        perMoveStats,
        openingStats,
      }).catch((err) => console.error('Failed to record metrics:', err));
      }
      dispatch({ type: 'END_GAME_FREEZE' });
    } else if (noPossibleMove(state.board, state.deadO, state.deadX) && !state.winner.player) {
      dispatch({ type: 'SET_MESSAGE', message: "It's a tie!" });
      dispatch({ type: 'SET_WINNER', winner: { player: 'Tie', winningTiles: [] }, winningTiles: [] });
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const perMoveStats = state.perMoveStats.filter((m) => m.moveIdx !== null);
      const openingX = state.moveList.find((m) => m.player === 'X' && m.index !== null);
      const openingStats = openingX ? { firstMoveIdx: openingX.index, firstPieceValue: openingX.value } : null;
      if (user) {
      recordGameMetrics({
        playerName: gamemode === 0 ? playerNickname : `${playerNickname} (X)`,
        opponentName: gamemode === 0 ? 'Computer' : 'Player O',
        gameType: 'Tic Tac Toe Squared',
        outcome: 'Tie',
        difficulty: gamemode === 0 ? difficulty : null,
        winningCondition: 'tie',
        moveList: state.moveList.filter((m) => m.index !== null),
        gameDuration,
        perMoveStats,
        openingStats,
      }).catch((err) => console.error('Failed to record metrics:', err));
      }
      dispatch({ type: 'END_GAME_FREEZE' });
    } else {
      dispatch({ type: 'ADVANCE_TURN' });
    }
  }, [state.board]);

  const actions = {
    selectPiece(player, idx, value) {
      dispatch({ type: 'SELECT_PIECE', player, idx, value });
    },
    placePiece(tileIndex) {
      dispatch({ type: 'PLACE_PIECE', tileIndex, timeNow: Date.now() });
    },
    reset() {
      if (botMoveTimeout.current) {
        clearTimeout(botMoveTimeout.current);
        botMoveTimeout.current = null;
      }
      gameStartTimeRef.current = Date.now();
      dispatch({ type: 'RESET' });
    },
    setMessage(message, show = true) {
      dispatch({ type: 'SET_MESSAGE', message, show });
    },
  };

  // Prefetch player model for AI difficulty and cache it
  useEffect(() => {
    async function fetchModel() {
      try {
        const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
        const res = await fetch(`${apiBase}/api/playerModel?playerName=${encodeURIComponent(playerNickname)}`);
        const data = await res.json();
        try { localStorage.setItem(`playerModel:${playerNickname}`, JSON.stringify(data)); } catch {}
      } catch (e) {
        // ignore
      }
    }
    if (gamemode === 0 && difficulty === 3 && user && playerNickname) {
      fetchModel();
    }
  }, [gamemode, difficulty, playerNickname]);

  // Reset game when difficulty or gamemode changes (only if game has started)
  useEffect(() => {
    if (anyTilePlayed) {
      actions.reset();
    }
  }, [difficulty, gamemode]);

  return { state, actions, anyTilePlayed, playerNickname };
}
