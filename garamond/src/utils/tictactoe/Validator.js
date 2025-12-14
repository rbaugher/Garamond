export function validMove(board, tileIndex, lastSelected, setGameMessage) {
    // Check if the move is valid
    console.log("Validating move at index:", tileIndex, "with last selected tile:", lastSelected);
    if (board[tileIndex].value !== null && board[tileIndex].value >= lastSelected.value) {
        setGameMessage("Invalid move! You must place a higher value tile.");
        return false;
    }
    if (lastSelected.value === null) {
        setGameMessage("No tile selected! Please select a tile to place.");
        return false;
    }
    if (board[tileIndex].player === lastSelected.player){
        setGameMessage("Invalid move! You cannot place on your own tile.");
        return false;
    }
    console.log("Move is valid");
    return true;
}

export function noPossibleMove(board, deadO, deadX) {
    // Validate inputs
    if (!Array.isArray(board) || !Array.isArray(deadO) || !Array.isArray(deadX)) {
        console.error("Invalid inputs to noPossibleMove function");
        return true; // Assume no moves are possible if inputs are invalid
    }

    // Define a mapping for tile values based on their indices
    const tileValueMap = [1, 1, 2, 2, 3, 3];

    // Check if there are any possible moves left for either player
    for (let i = 0; i < board.length; i++) {
        if (board[i].value === null) {
            // Ensure there are still tiles to be played
            if (deadO.includes(false) || deadX.includes(false)) {
                console.log("Empty spot found at index", i, "with available tiles");
                return false; // Found an empty spot and tiles are available
            }
        }
        if (board[i].player === 'O') {
            // Check if 'X' can place a higher tile here
            for (let j = 0; j < deadX.length; j++) {
                if (!deadX[j] && tileValueMap[j] > board[i].value) {
                    console.log("X can place a higher tile at index", i);
                    return false; // 'X' can place a higher tile
                }
            }
        } else if (board[i].player === 'X') {
            // Check if 'O' can place a higher tile here   
            for (let j = 0; j < deadO.length; j++) {
                if (!deadO[j] && tileValueMap[j] > board[i].value) {
                    console.log("O can place a higher tile at index", i);
                    return false; // 'O' can place a higher tile
                }
            } 
        }
    }

    // No moves are possible
    return true;
}
