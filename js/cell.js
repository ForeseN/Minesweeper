"use strict"

function getCellValue(cell) {
    let value = ""
    if (cell.isMine) value = MINE
    else if (cell.minesAroundCount === 0) value = ""
    else value = cell.minesAroundCount
    return value
}

function onCellClickedLeft(i, j) {
    if (!gGame.isOn) return
    if (gGame.isSandboxNow) {
        if (gBoard[i][j].isMine) gLevel.MINES--
        else gLevel.MINES++
        gBoard[i][j].isMine = !gBoard[i][j].isMine
        openCell(i, j)
        const elBombsRemain = document.querySelector(".bombs-remaining")
        elBombsRemain.innerText = formatCounters(gLevel.MINES)
        return
    }
    if (!timerId) {
        // Game init
        if (!gGame.isSevenBoom && !gGame.isBuiltBySandbox) {
            // Sevenboom does it automatically
            setRandomMines(i, j)
            setMinesNegsCount(gBoard)
            gBoardMoves.push(deepCopyMatrix(gBoard))
        }
        startTimer()
    }

    if (gGame.isHint) {
        useHint(i, j)
        return
    }

    if (gGame.isMegaHint) {
        useMegaHint(i, j)
        return
    }

    const clickedCell = gBoard[i][j]
    if (clickedCell.isMarked || clickedCell.isShown) return
    clickedCell.isShown = true
    openCell(i, j)
    if (clickedCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.style.backgroundColor = "red"
        // Clicked on Mine
        gGame.lives--
        renderLives()
        if (gGame.lives === 0) {
            // LOST
            announceLose(i, j)
        } else {
            // KEEP PLAYING
        }
    } else {
        // Clicked on Number
        if (clickedCell.minesAroundCount > 0) {
            clickedCell.isOpened = true
            clickedCell.isShown = true
        } else {
            // Clicked on Empty
            openNearbyCells(i, j)
        }
    }
    gBoardMoves.push(deepCopyMatrix(gBoard))
    console.log(gBoardMoves)
    if (checkWin()) announceWin()
}

function openCell(i, j) {
    // Select the elCell and set the value
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove("unopened")
    elCell.classList.remove("marked") // Removing mark just in case
    elCell.classList.remove("safe")
    elCell.classList.add("opened")
    // if (!isDark) elCell.add("light")
    elCell.innerHTML = getCellValue(cell)
}

function openNearbyCells(rowIdx, colIdx) {
    gBoard[rowIdx][colIdx].isOpened = true
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            const currCell = gBoard[i][j]
            // if (!currCell.isMine && !elCurrCell.classList.contains("marked")) {
            if (!currCell.isMine && !currCell.isMarked) {
                // OPEN
                if (currCell.minesAroundCount === 0 && !currCell.isOpened) {
                    openNearbyCells(i, j)
                }
                currCell.isShown = true
                openCell(i, j)
            }
        }
    }
}

function onCellClickedRight(i, j) {
    if (!gGame.isOn) return
    if (!timerId) {
        // Game init
        setRandomMines(i, j)
        setMinesNegsCount(gBoard)
        startTimer()
    }

    const cell = gBoard[i][j]
    if (cell.isShown) return

    const elCell = document.querySelector(`.cell-${i}-${j}`)
    cell.isMarked = true
    if (elCell.classList.contains("marked")) {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        elCell.classList.remove("marked")
    } else {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.classList.add("marked")
    }

    const elBombsRemain = document.querySelector(".bombs-remaining")
    var BombsRemain = gLevel.MINES - gGame.markedCount
    var BombsRemainStr = formatCounters(BombsRemain)
    elBombsRemain.innerText = BombsRemainStr

    if (checkWin()) announceWin()
}

function hideCells(cells) {
    for (let i = 0; i < cells.length; i++) {
        const currCell = cells[i]
        hideCell(currCell.i, currCell.j)
    }
}

function hideCell(i, j) {
    const cell = gBoard[i][j]
    cell.isShown = false
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.add("unopened")
    elCell.classList.remove("opened")
    elCell.innerText = ""
}

// TODO
// 1. Fix light mode bugs when using 7boom or sandbox
// 2. clean CSS & HTML
// 3. Go over JS and see what can we fix
// 4. Add specials js folder to keep things organized
// 5. add local storage
// 6. make it even prettier!
