function getCellValue(cell) {
    let value = ""
    if (cell.isMine) value = MINE
    else if (cell.minesAroundCount === 0) value = ""
    else value = cell.minesAroundCount
    return value
}

function onCellClickedLeft(i, j) {
    if (!gGame.isOn) return
    if (!timerId) {
        // Game init
        setRandomMines(i, j)
        setMinesNegsCount(gBoard)
        startTimer()
    }

    if (gGame.isHint) {
        useHint(i, j)
        return
    }

    const clickedCell = gBoard[i][j]
    if (clickedCell.isMarked || clickedCell.isShown) return
    clickedCell.isShown = true
    openCell(i, j)
    if (clickedCell.isMine) {
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

    if (checkWin()) announceWin()
}

function openCell(i, j) {
    // Select the elCell and set the value
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove("unopened")
    elCell.classList.remove("marked") // Removing mark just in case
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
