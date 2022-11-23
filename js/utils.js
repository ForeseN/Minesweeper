'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const type = cell.isMine ? "Mine" : ""
            const condition = cell.isShown ? "opened" : "unopened"
            const className = `cell cell-${i}-${j} ${type} ${condition}`
            let value = getCellValue(cell)

            strHTML += `<td class="${className}">${value}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function showElement(elem) {
    elem.classList.remove('hidden')
}
function hideElement(elem) {
    elem.classList.add('hidden')
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
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
    return cell === EMPTY
}

