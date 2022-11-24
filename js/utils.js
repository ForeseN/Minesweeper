"use strict"

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += "<tr>"
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            const type = cell.isMine ? "Mine" : ""
            const condition = cell.isShown ? "opened" : "unopened"
            const theme = isDark ? "" : "light"
            const className = `cell cell-${i}-${j} ${type} ${condition} ${theme}`
            // let value = getCellValue(cell)

            strHTML += `<td class="${className}" onclick="onCellClickedLeft(${i},${j})" oncontextmenu="onCellClickedRight(${i},${j})";></td>`
        }
        strHTML += "</tr>"
    }
    strHTML += "</tbody></table>"

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function showElement(elem) {
    elem.classList.remove("hidden")
}
function hideElement(elem) {
    elem.classList.add("hidden")
}

function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16)
}

function findEmptyCells() {
    const res = []
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (isEmptyCell(currCell)) res.push({ i, j })
        }
    }
    return res
}

function isEmptyCell(cell) {
    return !cell.isMine
}

// gets num like 5 and returns 005
function formatCounters(num) {
    if (num >= 0 || num <= -10) {
        return (Math.floor(num) + "").padStart(3, "0")
    }

    // num < 0
    if (num > -10) {
        return "-" + "0" + Math.floor(Math.abs(num))
    }
}

function deepCopyMatrix(mat) {
    const res = []
    for (let i = 0; i < mat.length; i++) {
        res[i] = []
        for (let j = 0; j < mat[0].length; j++) {
            const currCell = mat[i][j]
            res[i][j] = {
                minesAroundCount: currCell.minesAroundCount,
                isShown: currCell.isShown,
                isMine: currCell.isMine,
                isMarked: currCell.isMarked,
                isOpened: currCell.isOpened,
            }
        }
    }
    return res
}

function renderBoardCellByCell() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isShown) openCell(i, j)
            else hideCell(i, j)
        }
    }
}

function getCellElement(i, j) {
    return document.querySelector(`.cell-${i}-${j}`)
}

// if param is 1 then we send the location of each neighbor
// else we send the actual cell
function getNeighborsInclusive(rowIdx, colIdx, param = 0) {
    const neighbors = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (param === 1) {
                neighbors.push({ i, j })
            } else {
                neighbors.push(gBoard[i][j])
            }
        }
    }
    return neighbors
}

// if param is 1 then we send the location of each neighbor
// else we send the actual cell
function getNeighborsExclusive(rowIdx, colIdx, param = 0) {
    const neighbors = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (param === 1) {
                neighbors.push({ i, j })
            } else {
                neighbors.push(gBoard[i][j])
            }
        }
    }
    return neighbors
}
