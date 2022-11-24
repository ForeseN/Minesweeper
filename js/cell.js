"use strict"

function getCellValue(cell) {
    let value = ""
    if (cell.isMine) value = MINE
    else if (cell.minesAroundCount === 0) value = ""
    else value = cell.minesAroundCount
    return value
}

function handleSandbox(i, j) {
    if (gBoard[i][j].isMine) gLevel.MINES--
    else gLevel.MINES++
    gBoard[i][j].isMine = !gBoard[i][j].isMine
    openCell(i, j)
    const elBombsRemain = document.querySelector(".bombs-remaining")
    elBombsRemain.innerText = formatCounters(gLevel.MINES)
}

function onCellClickedLeft(i, j) {

    if (!gGame.isOn) return

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

    gGameState.board.push(deepCopyMatrix(gBoard))
    gGameState.lives.push(gGame.lives)
    gGameState.gameProperties.push(deepCopyGameProperties())

    if (checkWin()) announceWin()
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
    elCell.classList.add("opened")
    // if (!isDark) elCell.add("light")
    elCell.innerHTML = getCellValue(cell)
}

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

    handleMark(i, j)
    updateUI()

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

function hideCells(cells) {
    for (let i = 0; i < cells.length; i++) {
        const currCell = cells[i]
        hideCell(currCell.i, currCell.j)
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
    if (cell.isMarked) elCell.classList.add("marked")
    elCell.innerText = ""
}
function addHoverEvent() {
    if (!gGame.isMegaHint) return

    const cellElements = document.querySelectorAll('.cell')
    for (let i = 0; i < cellElements.length; i++) {
        const cell = cellElements[i]
        cell.addEventListener("mouseover", hoverEvent)
    }
}

function hoverEvent(event) {
    const elCell = event.srcElement
    const tempCellIndex = elCell.classList[1].split("-")
    const indexI = tempCellIndex[1]
    const indexJ = tempCellIndex[2]
    // console.log(indexI, indexJ)
    showHover({ i: indexI, j: indexJ })
}

function showHover(location) {
    if (!gGame.isMegaHint) return

    const cellElements = document.querySelectorAll('.cell')
    cellElements.forEach(elCell => elCell.classList.remove("hover"))

    for (let i = megaHintFirstLoc.i; i <= location.i; i++) {
        for (let j = megaHintFirstLoc.j; j <= location.j; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMarked || currCell.isShown) continue
            const elCell = getCellElement(i, j)
            // if (elCell.classList.contains("marked")) continue
            elCell.classList.add('hover')
        }
    }
}

// TODO
// 2. clean CSS & HTML
// 3. Go over JS and see what can we fix
// 4. Add specials js folder to keep things organized
// 5. add local storage
// 6. make it even prettier!
