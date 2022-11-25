"use strict"

function getCellValue(cell) {
    let value = ""
    if (cell.isMine) value = MINE
    else if (cell.minesAroundCount === 0) value = ""
    else value = cell.minesAroundCount
    return value
}

function onCellClickedLeft(i, j) {

    if (!gGame.isOn || gIsAnimating) return

    if (gGame.isSandboxNow) {
        handleSandbox(i, j)
        return
    }

    if (!timerId) {
        // Game init
        if (!gGame.isSevenBoom && !gGame.isBuiltBySandbox) {
            // Sevenboom & sandbox are already prepared
            setRandomMines(i, j)
            setMinesNegsCount(gBoard)
        }
        startTimer()
        gGameState.board.push(deepCopyMatrix(gBoard))
        gGameState.lives.push(gGame.lives)
        gGameState.gameProperties.push(deepCopyGameProperties())
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

    if (clickedCell.isMine) handleMine(i, j)
    else handleEmpty(i, j)

    // Update for undo!
    gGameState.board.push(deepCopyMatrix(gBoard))
    gGameState.lives.push(gGame.lives)
    gGameState.gameProperties.push(deepCopyGameProperties())

    if (checkWin()) announceWin()
}


function onCellClickedRight(i, j) {
    if (!gGame.isOn || gIsAnimating) return
    if (!timerId) {
        // Game init
        setRandomMines(i, j)
        setMinesNegsCount(gBoard)
        startTimer()
    }

    const cell = gBoard[i][j]
    if (cell.isShown) return

    handleMark(i, j)
    updateUI()

    // Update for undo!
    gGameState.board.push(deepCopyMatrix(gBoard))
    gGameState.lives.push(gGame.lives)
    gGameState.gameProperties.push(deepCopyGameProperties())

    if (checkWin()) announceWin()
}

function handleMark(i, j) {
    const elCell = getCellElement(i, j)
    if (elCell.classList.contains("marked")) {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        elCell.classList.remove("marked")
    } else {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.classList.add("marked")
    }
}


function handleEmpty(i, j) {
    const clickedCell = gBoard[i][j]

    if (clickedCell.minesAroundCount > 0) {
        // Clicked on Number
        clickedCell.isOpened = true
        clickedCell.isShown = true
    } else {
        // Clicked on Empty
        openNearbyCells(i, j)
    }
}

function handleMine(i, j) {
    document.querySelector('.game-container').classList.add("shake")
    setTimeout(() => {
        document.querySelector('.game-container').classList.remove("shake")
    }, 500)
    const elCell = getCellElement(i, j)
    // elCell.style.backgroundColor = "red"
    elCell.classList.add('red')
    gGame.lives--
    gGame.markedCount++
    updateUI()
    if (gGame.lives === 0) announceLose(i, j)
}

function openCell(i, j) {
    // Select the elCell and set the value
    const cell = gBoard[i][j]
    const elCell = getCellElement(i, j)
    elCell.classList.remove("unopened")
    elCell.classList.remove("marked")
    elCell.classList.remove("safe")
    elCell.classList.remove("roll-out-bottom")
    elCell.classList.add("opened")
    // if (!isDark) elCell.add("light")
    elCell.innerHTML = getCellValue(cell)
}

// Recursively opens cells nearby
function openNearbyCells(rowIdx, colIdx) {
    gBoard[rowIdx][colIdx].isOpened = true
    const neighbors = getNeighborsExclusive(rowIdx, colIdx, 1)
    for (let i = 0; i < neighbors.length; i++) {
        const neighborLoc = neighbors[i]
        const currCell = gBoard[neighborLoc.i][neighborLoc.j]
        if (!currCell.isMine && !currCell.isMarked) {
            // OPEN
            if (currCell.minesAroundCount === 0 && !currCell.isOpened) {
                openNearbyCells(neighborLoc.i, neighborLoc.j)
            }
            currCell.isShown = true
            openCell(neighborLoc.i, neighborLoc.j)
        }
    }
}

function hideCells(cells) {
    for (let i = 0; i < cells.length; i++) {
        const currCell = cells[i]
        flipCell(currCell.i, currCell.j)
        setTimeout(() => hideCell(currCell.i, currCell.j), 200)

    }
}

function hideCell(i, j) {
    const cell = gBoard[i][j]
    cell.isShown = false
    const elCell = getCellElement(i, j)
    elCell.classList.add("unopened")
    elCell.classList.remove("opened")
    elCell.classList.remove("kill")
    elCell.classList.remove("red")
    elCell.classList.remove("roll-out-bottom")
    if (cell.isMarked) elCell.classList.add("marked")
    elCell.innerText = ""
}



function deepCopyGameProperties() {
    const copiedGame = {
        isOn: gGame.isOn,
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        secsPassed: gGame.secsPassed,
        lives: gGame.lives,
        isHint: gGame.isHint,
        hints: gGame.hints,
        safeClick: gGame.safeClick,
        isKilled: gGame.isKilled,
        isMegaHint: gGame.isMegaHint,
        canUseMegaHint: gGame.canUseMegaHint,
        isSevenBoom: gGame.isSevenBoom,
        isSandboxNow: gGame.isSandboxNow,
        isBuiltBySandbox: gGame.isBuiltBySandbox,

    }

    return copiedGame
}

function getCellElement(i, j) {
    return document.querySelector(`.cell-${i}-${j}`)
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

// TODO
// 1. Clean JS
// 2. clean CSS & HTML
// 4. Disable buttons until we can play
// 5. fix active btns