import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import Controls from './Controls';
import { checkWinner } from './functions/checkWinner';
import { useGameMode } from './context/gamemodeContext';
import { getBotMove } from './functions/botMoves/botMove';
import { valuesMap } from './functions/pieceHelpers';
import { useDifficulty } from './context/DifficultyContext';
import { noPossibleMove,validMove } from './functions/Validator';
import { recordGameMetrics, getWinningCondition } from './functions/gameMetricsCollector';


export const TurnContext = createContext();
export const WinnerContext = createContext();
export const MoveCountContext = createContext();

function Board() {

  const { gamemode } = useGameMode();
  const { difficulty } = useDifficulty();
  const { turn, setTurn } = useContext(TurnContext); // Use context for turn
  const { winner, setWinner } = useContext(WinnerContext); // Use context for winner
  const { moveCount, setMoveCount } = useContext(MoveCountContext);
  // Player tile states
  const [queueO, setqueueO] = useState(Array(6).fill(false));
  const [deadO, setDeadO] = useState(Array(6).fill(false));
  const [queueX, setqueueX] = useState(Array(6).fill(false));
  const [deadX, setDeadX] = useState(Array(6).fill(false));
  const [WinningTiles, setWinningTiles] = useState([]);
  const [lastSelected, setLastSelected] = useState({ value: null, index: null, player: null });
  const [GameMessage, setGameMessage] = useState("Welcome to Tic Tac Toe Squared! Select a tile to begin.");
  const [showMessage, setShowMessage] = useState(true);
  const [botMove, setbotMove] = useState({ moveIdx: null, pieceIdx: null, value: null, player: 'O' }); // Track bot's chosen move
  const [moveList, setMoveList] = useState(Array(12).fill({index: null, value: null, player: null})); // Track all moves
  const botMoveTimeout = useRef(null); // Ref to store bot move timeout
  const gameStartTimeRef = useRef(Date.now()); // Track game start time

  let mainTiles = [1,2,3,4,5,6,7,8,9]; // Main Tile Indices
  const [board, setBoard] = useState(mainTiles.map((_, idx) => ({ value: null, player: null }))); //Track board state
  
  const botPlayer = 'O';
  const opponent = botPlayer === 'O' ? 'X' : 'O';

  // Track if any tile has been played
  const anyTilePlayed = moveCount > 0;
  // Detect mobile device (max-width: 600px)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches);

                                       {/*Player piece Selection*/}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleTileClick = (idx, val, player) => {
    if (player === 'O' && gamemode === 0) return; // Only enable O in multiplayer mode
    if (winner.player) return; // Disable if winner exists
    if (player === 'O') {setqueueO(prev => prev.map((u, i) => (i === idx && u != true ? true : i === idx && u == true ? false : u)))};
    if (player === 'X') {setqueueX(prev => prev.map((u, i) => (i === idx && u != true ? true : i === idx && u == true ? false : u)))};
    setLastSelected({ value: val, index: idx, player: player });
  }

                                    {/*SINGLE PLAYER MODE -- BOT MOVE*/}
  useEffect(() => {
    const deadOCount = deadO.filter(Boolean).length;
    const deadXCount = deadX.filter(Boolean).length;
    console.log("UseEffect Triggered - Gamemode:", gamemode, "Turn:", turn, "Winner:", winner.player, "Math Check:", Math.abs(deadOCount - deadXCount));
    if (gamemode === 0 && turn === 'O' && !winner.player && Math.abs(deadOCount - deadXCount) <= 1) {
      // Computer's turn in singleplayer mode
      console.log("Bot is calculating move...");
      const botMove = getBotMove(board, deadO, difficulty, deadX);
      console.log("Bot Move Calculated:", botMove);
      console.log("Bot Move Rationale: ", botMove.moveReason)
      if (botMove.moveIdx !== null) {
        console.log("Bot move: ", botMove.moveIdx)
        console.log("Bot index: ", botMove.pieceIdx)
        setLastSelected({ value: valuesMap[botMove.pieceIdx], index: botMove.pieceIdx, player: botPlayer })
        setbotMove({ moveIdx: botMove.moveIdx, pieceIdx: botMove.pieceIdx, value: valuesMap[botMove.pieceIdx], player: botPlayer });
      } 
    }
  }, [gamemode, turn]);

  // Execute bot move when botMove state updates
  useEffect(() => {
    if (turn === 'O' && lastSelected.value != null && lastSelected.player === 'O' && !winner.player && botMove.moveIdx !== null) {
      botMoveTimeout.current = setTimeout(() => {
        playerTilePlacement(botMove.moveIdx);
        botMoveTimeout.current = null;
      }, 2000);
    }
  }, [botMove]);

  
  // Handles player tile placement logic for the main board
function playerTilePlacement(tileIndex){
  if (winner.player) return;
  if (lastSelected.value != null && lastSelected.player === turn) {
    if (!validMove(board, tileIndex, lastSelected, setGameMessage)) {
      setShowMessage(true);
      return;
  } else {
      // Valid move, update board state
      const updatedBoard = board.map((b, i) => i === tileIndex ? { value: lastSelected.value, player: lastSelected.player } : { value: board[i].value, player: board[i].player });
      setBoard(updatedBoard);
      if(lastSelected.player==='O'){
        setDeadO(prev => prev.map((d, i) => (i === lastSelected.index ? true : d)));
      } 
      else if(lastSelected.player==='X'){
        setDeadX(prev => prev.map((d, i) => (i === lastSelected.index ? true : d)));
      }
      setMoveList(prev => prev.map((d, i) => (i === moveCount ? { index: tileIndex, value: lastSelected.value, player: lastSelected.player }: d)));
      setMoveCount(prev => prev + 1);
      setLastSelected({ value: null, index: null, player: null });
    }
  }
}

  // Clear pending bot move on reset
  const handleReset = () => {
    if (botMoveTimeout.current) {
      clearTimeout(botMoveTimeout.current);
      botMoveTimeout.current = null;
    }
    gameStartTimeRef.current = Date.now(); // Reset game start time
    setqueueO(Array(6).fill(false));
    setDeadO(Array(6).fill(false));
    setqueueX(Array(6).fill(false));
    setDeadX(Array(6).fill(false));
    setLastSelected({ value: null, index: null, player: null });
    setGameMessage("Welcome to Tic Tac Toe Squared! Select a tile to begin.");
    setShowMessage(true);
    setBoard(mainTiles.map((_, idx) => ({ value: null, player: null })));
    setWinner({player: null, winningTiles: []});
    setMoveCount(0);
    setTurn(Math.random() < 0.5 ? 'X' : 'O');
  };

  // Auto-hide game messages after 5 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [GameMessage, showMessage]);

  // Auto-reset winning tiles after 2 seconds
  useEffect(() => {
    setTimeout(() => setWinningTiles([]), 2000);
  }, [winner]);

  // Game Monitoring for Win or Tie
  useEffect(() => {
    const winResult = checkWinner(board);
    if (winResult) {
      setGameMessage(`Player ${winResult.player} wins!`);
      setWinner(winResult)
      setWinningTiles(winResult.winningTiles);
      
      // Record game metrics
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const winningCondition = getWinningCondition(winResult.winningTiles);
      // Player is always X, so if X won, it's a Win, otherwise it's a Loss
      const outcome = winResult.player === 'X' ? 'Win' : 'Loss';
      
      recordGameMetrics({
        playerName: gamemode === 0 ? "Player" : "Player X",
        opponentName: gamemode === 0 ? "Computer" : "Player O",
        gameType: "Tic Tac Toe Squared",
        outcome: outcome,
        difficulty: gamemode === 0 ? difficulty : null,
        winningCondition: winningCondition,
        moveList: moveList.filter(m => m.index !== null),
        gameDuration: gameDuration
      }).catch(err => console.error("Failed to record metrics:", err));
      
    } else if (noPossibleMove(board, deadO, deadX) && !winner.player) {
      setGameMessage("It's a tie!");
      setWinner({player: 'Tie'});
      
      // Record tie metrics
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      
      recordGameMetrics({
        playerName: gamemode === 0 ? "Player" : "Player X",
        opponentName: gamemode === 0 ? "Computer" : "Player O",
        gameType: "Tic Tac Toe Squared",
        outcome: "Tie",
        difficulty: gamemode === 0 ? difficulty : null,
        winningCondition: "tie",
        moveList: moveList.filter(m => m.index !== null),
        gameDuration: gameDuration
      }).catch(err => console.error("Failed to record metrics:", err));
      
    } else {
      setTurn(prev => prev === 'X' ? 'O' : 'X');
      return;
    }
      setShowMessage(true);
      setqueueO(Array(6).fill(true));
      setqueueX(Array(6).fill(true));
      setMoveList(Array(12).fill({index: null, value: null, player: null}));
  }, [board]);

  // Update isMobile state on window resize
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <>
    <section className={`gameboard${gamemode === 1 ? ' multiplayer' : ''}${turn === 'X' ? ' x-turn' : ' o-turn'}`}>
      <section className="container">
        {mainTiles.map((_,idx) => (
          <div 
            key={idx} 
            className={`tile${WinningTiles.includes(idx) ? ' glow' : ''}`} // Highlight winning tiles
            onClick={() => playerTilePlacement(idx)}
          >
            {board[idx].value !== null ? (
              <span
                className="inplaytile"
                style={{ background: board[idx].player === 'X' ? '#09C372' : board[idx].player === 'O' ? '#498AFB' : '#444' }}
              >
                {board[idx].value}
              </span>
            ) : null}
          </div>
        ))}
        
      </section>
      {/* Player banner for singleplayer mode (not mobile) */}
      {gamemode === 0 && !isMobile && (
        <div className="playerbanner" style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2em', marginBottom: '0.5em' }}>
          Player
        </div>
      )}
      {isMobile ? (
        /* Mobile Device */
        <div className="player-tiles-row">
          <section className={`OPlayertiles${winner.Player === 'O' ? ' winner-border' : ''}`}>
            {valuesMap.map((val, idx) => (
              <div
                key={idx}
                className={`o-tile commontile${queueO[idx] ? ' used' : ''}${deadO[idx] ? ' dead' : ''}${turn === 'O' ? '' : ' unselectable'}`}
                onClick={turn === 'O' ? () => handleTileClick(idx, val, turn) : undefined}
              >
                {val}
              </div>
            ))}
          </section>
          <section className={`XPlayertiles${winner.Player === 'X' ? ' winner-border' : ''}`}>
            {valuesMap.map((val, idx) => (
              <div
                key={idx}
                className={`x-tile commontile${queueX[idx] ? ' used' : ''}${deadX[idx] ? ' dead' : ''}${turn === 'X' ? '' : ' unselectable'}`}
                onClick={turn === 'X' ? () => handleTileClick(idx, val, turn) : undefined}
              >
                {val}
              </div>
            ))}
          </section>
        </div>
      ) : (
        <>
        {/* Not Mobile Device */}
          <section className={`OPlayertiles${winner.player === 'O' ? ' winner-border' : ''}`}>
            {valuesMap.map((val, idx) => (
              <div
                key={idx}
                className={`o-tile commontile${queueO[idx] ? ' used' : ''}${deadO[idx] ? ' dead' : ''}${turn === 'O' ? '' : ' unselectable'}`}
                onClick={turn === 'O' ? () => handleTileClick(idx, val, turn) : undefined}
              >
                {val}
              </div>
            ))}
          </section>
          <section className={`XPlayertiles${winner.player === 'X' ? ' winner-border' : ''}`}>
            {valuesMap.map((val, idx) => (
              <div
                key={idx}
                className={`x-tile commontile${queueX[idx] ? ' used' : ''}${deadX[idx] ? ' dead' : ''}${turn === 'X' ? '' : ' unselectable'}`}
                onClick={turn === 'X' ? () => handleTileClick(idx, val, turn) : undefined}
              >
                {val}
              </div>
            ))}
          </section>
        </>
      )}
      {/* Display message info */}
      <section style={{ textAlign: 'center', marginTop: '1em', color: 'white' }} />
    </section>
    
    <section style={{ textAlign: 'center', color: 'white' }}>
      <span className={`game-message${showMessage ? '' : ' fade-out'}`}>{GameMessage}</span>
      {anyTilePlayed && (
        <Controls 
          onClick={handleReset}
        />
      )}
    </section>
    </>
  );
}
export default Board;
