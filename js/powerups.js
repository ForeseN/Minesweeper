'use strict'

// happens when the hint button gets clicked
function onHint() {
    if (gIsAnimating) return

    if (gGame.hints > 0) gGame.isHint = true
}

// Uses hint
function useHint(rowIdx, colIdx) {
    gGame.hints--
    document.querySelector(".hint").dataset.title = `Hints: ${gGame.hints}`
    const hideAfterHintCells = []
    const neighbors = getNeighborsInclusive(rowIdx, colIdx, 1)
    for (let i = 0; i < neighbors.length; i++) {
        const neighborLoc = neighbors[i]
        const currCell = gBoard[neighborLoc.i][neighborLoc.j]
        if (currCell.isShown) continue
        // show cell for hint
        currCell.isShown = true
        openCell(neighborLoc.i, neighborLoc.j)
        hideAfterHintCells.push({ i: neighborLoc.i, j: neighborLoc.j })
    }
    hintTimeoutId = setTimeout(() => { hideCells(hideAfterHintCells) }, 1000)
    if (gGame.hints === 0) {
        document.querySelector(".hint").disabled = true
    }
    gGame.isHint = false
}

// searches for an empty cell by using "getSafeClicks()" and then picks a random one
// and adds the safe class to show the user by CSS animation
function onSafeClick() {
    if (gIsAnimating) return

    if (gGame.safeClick <= 0) return

    const safeClicks = getSafeClicks()

    if (safeClicks.length === 0) return // NO EMPTY CELLS!

    const randomIndex = getRandomIntInclusive(0, safeClicks.length - 1)
    const randCell = safeClicks[randomIndex]
    const elCell = getCellElement(randCell.i, randCell.j)
    elCell.classList.add("safe")

    gGame.safeClick--
    document.querySelector(".safe-click").dataset.title = `Safe Clicks: ${gGame.safeClick}`
    if (gGame.safeClick === 0) {
        // Disable button
        document.querySelector(".safe-click").disabled = true
    }
}

// returns safe clicks (non-mine cells)
// gets called by "onSafeClick()"
function getSafeClicks() {
    const safeClicks = []
    for (let i = 0; i < gLevel.SIZE; i++) {
        for (let j = 0; j < gLevel.SIZE; j++) {
            const currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown) safeClicks.push({ i, j })
        }
    }
    return safeClicks
}
// gets "EXTERMINATOR_AMOUNT" of mines and blows them up
// updates neighbor cells as well
function onKillMines() {
    if (gIsAnimating) return

    if (gGame.isKilled || gMines.length === 0) return
    gGame.isKilled = true
    const killMinesBtn = document.querySelector(".kill-mines")
    killMinesBtn.dataset.title = `Exterminator: 0`
    killMinesBtn.disabled = true
    const unmarkedMines = getUnmarkedMines()
    const unmarkedMinesLength = unmarkedMines.length // static length
    for (let i = 0; i < EXTERMINATOR_AMOUNT && i < unmarkedMinesLength; i++) {
        if (gMines.length === 0) return // happens in easy mode

        gGame.markedCount++
        const randomIndex = getRandomIntInclusive(0, unmarkedMines.length - 1)
        const randCell = unmarkedMines[randomIndex]
        gBoard[randCell.i][randCell.j].isShown = true
        flipCell(randCell.i, randCell.j, 250, 1) // 1 to open, 0 to close
        const elCell = getCellElement(randCell.i, randCell.j)
        elCell.classList.add("kill")
        killMinesTimeoutId = setTimeout(() => {
            elCell.classList.remove("kill")
            elCell.classList.remove("red")
            gBoard[randCell.i][randCell.j].isMine = false
            openCell(randCell.i, randCell.j)
            setMinesNegsCount(gBoard)
            updateNeighbors(randCell.i, randCell.j)
            updateUI()
        }, 2500)
        unmarkedMines.splice(unmarkedMines.indexOf(randCell), 1)
    }
}

// gets called by "onKillMines()", retrieves cells which are mines that are not marked or shwon
function getUnmarkedMines() {
    const unmarkedMines = []
    for (let i = 0; i < gMines.length; i++) {
        const currMine = gMines[i]
        if (!gBoard[currMine.i][currMine.j].isMarked && !gBoard[currMine.i][currMine.j].isShown) {
            unmarkedMines.push(currMine)
        }
    }
    return unmarkedMines
}

// Updates Neighbors mines count after killing mines by "onKillMines()"
function updateNeighbors(rowIdx, colIdx) {
    const neighbors = getNeighborsInclusive(rowIdx, colIdx, 1)
    for (let i = 0; i < neighbors.length; i++) {
        const neighborLoc = neighbors[i]
        const currCell = gBoard[neighborLoc.i][neighborLoc.j]
        if (currCell.isMine || currCell.isMarked || !currCell.isShown) {
            continue
        }
        openCell(neighborLoc.i, neighborLoc.j)
    }
}

// When the mega hint button is clicked
function onMegaHint() {
    if (gIsAnimating) return

    if (!gGame.canUseMegaHint) return // it means we already used it!
    gGame.isMegaHint = true
    gGame.canUseMegaHint = false
}

// Gets run twice
// First when we get the first location for the mega hint
// Second when we get the second location and then shows the player the cells
function useMegaHint(i, j) {
    if (!megaHintFirstLoc) {
        megaHintFirstLoc = { i, j }
        addHoverEvent()
        return // we need to choose another one
    }
    removeHover()
    const megaHintSecondLoc = { i, j }
    const megaHintBiggerLoc = {
        i: Math.max(megaHintFirstLoc.i, megaHintSecondLoc.i),
        j: Math.max(megaHintFirstLoc.j, megaHintSecondLoc.j)
    }
    const megaHintSmallerLoc = {
        i: Math.min(megaHintFirstLoc.i, megaHintSecondLoc.i),
        j: Math.min(megaHintFirstLoc.j, megaHintSecondLoc.j)
    }
    for (let i = megaHintSmallerLoc.i; i < megaHintBiggerLoc.i + 1; i++) {
        for (let j = megaHintSmallerLoc.j; j < megaHintBiggerLoc.j + 1; j++) {
            if (gBoard[i][j].isShown) continue
            openCell(i, j)

            megaHintTimeoutId = setTimeout(() => {
                flipCell(i, j)
                setTimeout(() => hideCell(i, j), 200)
            }, 2000)
        }
    }
    const megaHintBtn = document.querySelector(".mega-hint")
    megaHintBtn.dataset.title = `Mega Hint: 0`
    megaHintBtn.disabled = true
    gGame.isMegaHint = false
}

// plants mines according to the seven boom game
function onSevenBoom() {
    if (gIsAnimating) return

    initGame()
    gGame.isSevenBoom = true
    var cellIndex = 1
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (isSevenBoom(cellIndex)) {
                cell.isMine = true
                gMines.push({ i, j })
            }
            cellIndex++
        }
    }
    setMinesNegsCount(gBoard)
}

// helper function for seven boom, returns whether a specific cell is a seven boom applicable
function isSevenBoom(num) {
    if (num % 7 === 0) return true
    if ((num + "").indexOf("7") > -1) return true
    return false
}

// gets called by pressing the sandbox button
// gets called twice
// first, clears the board and opens the cells
// second, hides the cells after player has put mines
function onSandbox() {
    if (gIsAnimating) return

    if (gGame.isSandboxNow) {
        // we need to start game!
        gGame.isSandboxNow = false
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[i].length; j++) {
                const currCell = gBoard[i][j]
                currCell.isShown = false
                hideCell(i, j)
            }
        }
        setMinesNegsCount(gBoard)
        return
    }
    // Starting sandbox mode!
    initGame()
    gGame.isSandboxNow = true
    gGame.isBuiltBySandbox = true
    gLevel.MINES = 0
    const elBombsRemain = document.querySelector(".bombs-remaining")
    elBombsRemain.innerText = formatCounters(gLevel.MINES)
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            currCell.isShown = true
            openCell(i, j)
        }
    }
}

// handles the sandbox each click
function handleSandbox(i, j) {
    if (gBoard[i][j].isMine) {
        gLevel.MINES--
        for (let i = 0; i < gMines.length; i++) {
            const currMine = gMines[i]
            if (currMine.i === i && currMine.j === j) {
                gMines.splice(i, 1)
                break
            }
        }
    }
    else {
        gMines.push({ i, j })
        gLevel.MINES++
    }
    gBoard[i][j].isMine = !gBoard[i][j].isMine
    openCell(i, j)
    const elBombsRemain = document.querySelector(".bombs-remaining")
    elBombsRemain.innerText = formatCounters(gLevel.MINES)
}

// gets called on undo
// many CSS animations are here you've been warned
function onUndo() {
    if (gIsAnimating) return
    if (gGameState.board.length === 1 || gGame.isSandboxNow) return

    if (!gGame.isOn) { // UNDO from lose \ win
        const elSmiley = document.querySelector(".smiley")
        elSmiley.innerText = SMILEY_REGULAR
        gGame.isOn = true
        handleButtons()
        gIsAnimating = true  // different animation
        setTimeout(() => gIsAnimating = false, 2000)
    }

    gGameState.board.pop() // old board
    gGameState.lives.pop() // old life count
    gGameState.gameProperties.pop() // old game state
    gGame.lives = gGameState.lives[gGameState.lives.length - 1] // update to new lives
    gTempBoardForUndoEffects = deepCopyMatrix(gBoard) // temp board of before undo for effects
    gBoard = deepCopyMatrix(gGameState.board[gGameState.board.length - 1]) // update to new lives

    if (gIsAnimating) rollInBoardAfterLose() // if we lost or won, we go here to cool animations
    else renderBoardCellsAnimated() // render board to DOM with CSS flip animations
    updateUI()

}

// toggles light class to important elements
function onToggleTheme() {
    isDark = !isDark
    const elToggleBtn = document.querySelector(".utilities .toggle-theme")
    if (elToggleBtn.innerText === LIGHT_THEME) {
        elToggleBtn.innerText = DARK_THEME
    } else {
        elToggleBtn.innerText = LIGHT_THEME
    }

    document.querySelector("body").classList.toggle("light")
    document.querySelector("h1").classList.toggle("text-black")
    document.querySelector(".footer").classList.toggle("text-black")
    document.querySelector(".game-card").classList.toggle("light")
    document.querySelector(".info-container-2 span").classList.toggle("light")
    var btns = document.querySelectorAll(".utilities button")
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("light")
    }
    var cellElements = document.querySelectorAll(".cell")
    for (let i = 0; i < cellElements.length; i++) {
        cellElements[i].classList.toggle("light")
    }
    btns = document.querySelectorAll(".difficulty-container button")
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("light")
    }
    var misc = document.querySelectorAll(".info-container >*")
    for (let i = 0; i < misc.length; i++) {
        misc[i].classList.toggle("light")
    }
    misc = document.querySelectorAll(".info-container-2 >*")
    for (let i = 0; i < misc.length; i++) {
        misc[i].classList.toggle("light")
    }
}

// adds event listeners for hover event when using mega hint
function addHoverEvent() {
    if (!gGame.isMegaHint) return

    const cellElements = document.querySelectorAll('.cell')
    for (let i = 0; i < cellElements.length; i++) {
        const cell = cellElements[i]
        cell.addEventListener("mouseover", hoverEvent)
    }
}

// gets the indexes and sends them to showHover which actually adds the hover class
function hoverEvent(event) {
    const elCell = event.srcElement
    const tempCellIndex = elCell.classList[1].split("-")
    const indexI = tempCellIndex[1]
    const indexJ = tempCellIndex[2]
    showHover({ i: indexI, j: indexJ })
}

// calculates which cells need to get the hover effect and adds them the effect
function showHover(location) {
    if (!gGame.isMegaHint) return

    const cellElements = document.querySelectorAll('.cell')
    cellElements.forEach(elCell => elCell.classList.remove("hover"))
    const megaHintBiggerLoc = {
        i: Math.max(megaHintFirstLoc.i, location.i),
        j: Math.max(megaHintFirstLoc.j, location.j)
    }
    const megaHintSmallerLoc = {
        i: Math.min(megaHintFirstLoc.i, location.i),
        j: Math.min(megaHintFirstLoc.j, location.j)
    }
    for (let i = megaHintSmallerLoc.i; i <= megaHintBiggerLoc.i; i++) {
        for (let j = megaHintSmallerLoc.j; j <= megaHintBiggerLoc.j; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMarked || currCell.isShown) continue
            const elCell = getCellElement(i, j)
            elCell.classList.add('hover')
        }
    }
}
