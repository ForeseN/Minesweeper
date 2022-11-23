'use strict'

// Elements
// const elContainer = document.querySelector('.container')

const MINE = "💣"

var gBoard
// var gBoard = {
//     minesAroundCount: 4,
//     isShown: false,
//     isMine: false,
//     isMarked: true
// }

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    console.log(gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    setRandomMines()
    renderBoard(gBoard, '.board-container')
    setMinesNegsCount(gBoard)
}

function buildBoard() {
    const board = []
    for (let i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (let j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function getCellValue(cell) {
    let value = ""
    if (cell.isShown) {
        if (cell.isMine) value = MINE
        else if (cell.minesAroundCount === 0) value = ""
        else value = cell.minesAroundCount
    }
    return value
}

function cellClicked(i, j) {
    gBoard[i][j].isShown = true
    renderCell(i, j)
}

function renderCell(i, j) {
    // Select the elCell and set the value
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove('unopened')
    elCell.innerText = getCellValue(cell)
}