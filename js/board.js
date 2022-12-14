'use strict'

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

function renderBoardCellsAnimated() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            const oldBoardCell = gTempBoardForUndoEffects[i][j]
            if (currCell.isShown) {
                openCell(i, j)
            } else if (oldBoardCell.isShown) { // Animate
                // IF IN THE oldBoardCell (BEFORE UNDO) IT WAS SHOWN
                // BUT NOT SHOWN NOW (DIDN'T GET INTO THE FIRST IF)
                // HIDE IT BY FLIPPING
                flipCell(i, j)
                if (oldBoardCell.isMine) {
                    gGame.markedCount--
                }
            } else if (oldBoardCell.isMarked && !currCell.isMarked) {
                const elCurrCell = getCellElement(i, j)
                flipCell(i, j)
                setTimeout(() => elCurrCell.classList.remove("marked"), 200)
                gGame.markedCount--
            } else {
                hideCell(i, j)
            }
        }
    }
}
// gets i,j , time to close & close param
// if close is 0 then close, if 1 then open!
function flipCell(i, j, time = 250, close = 0) {
    const elCurrCell = getCellElement(i, j)
    elCurrCell.classList.add("flip-horizontal-bottom")
    if (close === 0) setTimeout(() => hideCell(i, j), time)
    else setTimeout(() => openCell(i, j), time)
    setTimeout(() => elCurrCell.classList.remove("flip-horizontal-bottom"), time + 50)
}

async function rollInBoardAfterLose() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            const oldBoardCell = gTempBoardForUndoEffects[i][j]
            const elCurrCell = getCellElement(i, j)
            if (elCurrCell.classList.contains("roll-out-bottom") ||
                elCurrCell.classList.contains("kill")) {
                elCurrCell.classList.remove("roll-out-bottom")
                elCurrCell.classList.add("scale-in-center")
                elCurrCell.classList.remove("kill")
                setTimeout(() => elCurrCell.classList.remove("scale-in-center"), 400)
            }
            if (currCell.isShown && !oldBoardCell.isShown && currCell.isMine) { // exploding mines
                elCurrCell.classList.add("flip-horizontal-bottom")
                setTimeout(() => hideCell(i, j), 250)
                setTimeout(() => elCurrCell.classList.remove("flip-horizontal-bottom"), 300)
            } if (currCell.isShown) {
                openCell(i, j)
            } else {
                hideCell(i, j)
            }
            await timer(10);
        }
    }
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
                isMarked: false,
                isOpened: false,
            }
        }
    }
    return board
}