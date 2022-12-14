"use strict"

var gMines = []

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
    const neighbors = getNeighborsExclusive(rowIdx, colIdx)
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i].isMine) mines++
    }
    return mines
}

// gets i,j as a param to make sure it won't be a mine
// on first time click
function setRandomMines(i, j) {
    const emptyCells = findEmptyCells()
    removeNeighbors(i, j, emptyCells)
    for (let i = 0; i < gLevel.MINES; i++) {
        const randomIndex = getRandomIntInclusive(0, emptyCells.length - 1)
        const emptyCell = emptyCells[randomIndex]

        gBoard[emptyCell.i][emptyCell.j] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false,
        }
        emptyCells.splice(randomIndex, 1)

        gMines.push({ i: emptyCell.i, j: emptyCell.j })
    }
}

// removes neighbors so first click will be fully empty! (not even a number)
// gets called by "setRandomMines()"
function removeNeighbors(rowIdx, colIdx, emptyCells) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            // Find and remove it!
            for (var k = 0; k < emptyCells.length; k++) {
                if (emptyCells[k].i === i && emptyCells[k].j === j) {
                    emptyCells.splice(k, 1)
                }
            }
        }
    }
}
