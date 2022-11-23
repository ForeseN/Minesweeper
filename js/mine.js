'use strict'

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            cell.minesAroundCount = getMineNegsCount(board, i, j)
        }
    }

}

function getMineNegsCount(board, rowIdx, colIdx) {
    var mines = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            const currCell = board[i][j]
            if (currCell.isMine) mines++
        }
    }
    return mines
}