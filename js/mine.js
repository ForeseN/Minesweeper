'use strict'

const BEGINNER_MINES_AMOUNT = 2
const MEDIUM_MINES_AMOUNT = 14
const EXPERT_MINES_AMOUNT = 32
const gMines = []

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

function setRandomMines() {
    const emptyCells = findEmptyCells()
    for (let i = 0; i < gLevel.MINES; i++) {
        const randomIndex = getRandomIntInclusive(0, emptyCells.length - 1)
        const emptyCell = emptyCells[randomIndex]

        gBoard[emptyCell.i][emptyCell.j] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        }
        emptyCells.splice(randomIndex, 1)

        gMines.push({ i: emptyCell.j, j: emptyCell.i })
    }


}