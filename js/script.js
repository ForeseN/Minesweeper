'use strict'

// Elements
// const elContainer = document.querySelector('.container')

const MINE = "💣"
const FLAG = "🚩"

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
    setRandomMines()
    renderBoard(gBoard, '.board-container')
    setMinesNegsCount(gBoard)
    console.log(gMines)
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

function onCellClickedLeft(i, j) {
    const clickedCell = gBoard[i][j]
    clickedCell.isShown = true
    renderCell(i, j)
    if (clickedCell.isMine) { // Clicked on Mine

    } else { // Clicked on Empty
        openNearbyCells(i, j)
    }

    if (checkWin()) announceWin()



}

function renderCell(i, j) {
    // Select the elCell and set the value
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove('unopened')
    elCell.classList.remove('marked') // Removing mark just in case
    elCell.innerText = getCellValue(cell)
}

function openNearbyCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            const currCell = gBoard[i][j]
            const elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            if (!currCell.isMine && !elCurrCell.classList.contains('marked')) { // OPEN
                currCell.isShown = true
                renderCell(i, j)
            }
            // if (currCell.minesAroundCount === 0) {
            //     openNearbyCells(i, j)
            // }
        }
    }
}

function onCellClickedRight(i, j) {
    const cell = gBoard[i][j]
    if (cell.isShown) return

    gBoard[i][j].isMarked = true
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    cell.isMarked = true
    elCell.classList.toggle('marked')

    if (checkWin()) announceWin()
}

function checkWin() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            // if mine and not marked NOT WIN!
            if (currCell.isMine && !currCell.isMarked) return false
            // if not mine and not shown NOT WIN!
            if (!currCell.isMine && !currCell.isShown) return false
        }
    }
    return true
}

function announceWin() {

}

function announceLose() {

}