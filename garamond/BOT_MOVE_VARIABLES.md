# Bot Move Logic Variables by File

| File | Variable | Scope | Type | Description |
|------|----------|-------|------|-------------|
| **botMove.js** | `board` | Parameter | Array | 9-tile game state `{ value, player }` |
| | `deadO` | Parameter | Array | Boolean array of used bot pieces |
| | `difficulty` | Parameter | Number | 0–3 (easy, medium, hard, AI) |
| | `deadX` | Parameter | Array | Boolean array of used opponent pieces |
| | `botPlayer` | Constant | String | `'O'` |
| | `opponent` | Constant | String | `'X'` |
| | `availablePieceIndices()` | Function | Closure | Returns unused bot piece indices |
| | `availableOpponentPieceIndices()` | Function | Closure | Returns unused opponent piece indices |
| | `availableMoves()` | Function | Closure | Combines empty + takeover indices |
| | `maxAvailable` | Computed | Number | Highest bot piece value |
| | `emptyIndices` | Computed | Array | Board positions with no piece |
| | `takeoverIndices` | Computed | Array | Opponent positions bot can overtake |
| | `context` | Object | Object | Bundle of helpers and state |
| **botmovelogic.js** | `WINNING_CONDITIONS` | Export | Array | 8 win patterns `[a, b, c]` |
| | `CORNERS` | Export | Array | `[0, 2, 6, 8]` |
| | `SIDES` | Export | Array | `[1, 3, 5, 7]` |
| | `CENTER` | Export | Number | `4` |
| | `findWinningMove()` | Export | Function | Finds immediate win opportunity |
| | `findBlockingMove()` | Export | Function | Finds blocking move |
| | `findSetupMove()` | Export | Function | Finds 2-in-a-row setup |
| | `findForkMove()` | Export | Function | Detects fork opportunities |
| | `findBlockForkMove()` | Export | Function | Blocks opponent fork |
| | `findOppositeCornerMove()` | Export | Function | Strategic corner play |
| | `findEmptySideMove()` | Export | Function | Finds available side |
| | `findTakeoverMove()` | Export | Function | Evaluates overtake moves |
| **pieceHelpers.js** | `valuesMap` | Export | Array | `[1, 1, 2, 2, 3, 3]` |
| | `getAvailablePieceIndices()` | Export | Function | Returns available piece indices |
| | `getAvailablePieceValues()` | Export | Function | Returns available piece values |
| | `getMaxAvailablePieceValue()` | Export | Function | Returns max available piece |
| | `getFirstAvailablePieceIndex()` | Export | Function | Returns first available index |
| **easyMode.js** | `VERBOSE` | Local | Boolean | Debug logging flag |
| | `moves` | Local | Array | Valid move list |
| | `moveIdx` | Local | Number | Randomly selected board position |
| | `pieceIdxCandidates` | Local | Array | Available pieces |
| | `takeoverValue` | Local | Number | Opponent piece value at target |
| | `pieceIdx` | Local | Number | Randomly selected piece index |
| **mediumMode.js** | `VERBOSE` | Local | Boolean | Debug flag |
| | `moves` | Local | Array | Valid moves |
| | `oppPieceCounts` | Local | Object | `{ 1: count, 2: count, 3: count }` |
| | `maxOppValue` | Local | Number | Highest opponent piece |
| | `playerUsed3s` | Local | Number | Opponent 3-pieces used |
| | `botUsed3s` | Local | Number | Bot 3-pieces used |
| | `totalPiecesUsed` | Local | Number | All pieces placed (per-check) |
| | `openingMoves` | Local | Array | `[4, 0, 2, 6, 8]` |
| | `botPiecesUsed` | Local | Number | In `canUse3()` |
| | `playerPiecesUsed` | Local | Number | In `canUse3()` |
| | `getPositionValue()` | Function | Local | Strategic position value |
| | `canOpponentOvertake()` | Function | Local | Boolean check |
| | `choosePieceForPosition()` | Function | Local | Selects piece for position |
| | `evaluateMove()` | Function | Local | Scores move |
| | `canUse3()` | Function | Local | Boolean check |
| | `getValidPiecesForMove()` | Function | Local | Valid pieces for position |
| | `winIdx` | Local | Object | Winning move result |
| | `blockObj` | Local | Object | Blocking move result |
| | `candidatePieces` | Local | Array | Piece selections |
| | `non3Pieces` | Local | Array | Non-3 pieces |
| | `bestIdx` | Local | Number | Selected piece index |
| | `validPieces` | Local | Array | Pieces valid for move |
| | `threes` | Local | Array | Available 3-value pieces |
| | `bestMove` | Local | Object | Best move found |
| | `bestScore` | Local | Number | Best score |
| | `fallback` | Local | Object | Easy mode fallback |
| | `pieceValue` | evaluateMove | Number | Value of candidate piece |
| | `simBoard` | evaluateMove | Array | Simulated board |
| | `score` | evaluateMove | Number | Accumulated evaluation score |
| | `winAfter` | evaluateMove | Object | Win scenario |
| | `threats` | evaluateMove | Number | Count of 2-in-a-row |
| | `secureThreats` | evaluateMove | Number | Threats that can't be overtaken |
| | `botPiecesInLine` | evaluateMove | Array | Bot's pieces in threat line |
| | `allSecure` | evaluateMove | Boolean | Whether threats are secure |
| | `posValue` | evaluateMove | Number | Strategic position value |
| | `blockedThreats` | evaluateMove | Number | Opponent threats blocked |
| **hardMode.js** | *(stub; delegates to easyMode)* | — | — | — |
| **aiMode.js** | `playerName` | Local | String | Stored user identifier |
| | `profile` | Local | Object | Cached player model |
| | `biases` | Local | Object | Profile object with weights |
| | `basePosValue()` | Function | Local | Position value scoring |
| | `scoreMove()` | Function | Local | Scores move with bias |
| | `moves` | Local | Array | Valid move list |
| | `best` | Local | Object | Best move tracker |
| | `winObj` | Local | Object | Winning move result |
| | `blockObj` | Local | Object | Blocking move result |
| | `candidatePieces` | Local | Array | Pieces for win |
| | `bestIdx` | Local | Number | Selected piece |
| | `validPieces` | Local | Array | Valid pieces for position |
| | `score` | Local | Number | Move score |
| | `pieceValue` | scoreMove | Number | Value of piece |
| | `pw` | scoreMove | Number | Position weight bias |
| | `pp` | scoreMove | Number | Piece preference bias |
| | `tr` | scoreMove | Number | Takeover rate bias |
