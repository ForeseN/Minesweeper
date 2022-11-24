"use strict"

// Elements
// const elContainer = document.querySelector('.container')

// const MINE = "💣"
const MINE = '<img src="img/mine3.png" alt="">'
const FLAG = "🚩"
const LIFE = "❤️"
const SMILEY_LOSER = "😢"
const SMILEY_WINNER = "🏆"
const SMILEY_REGULAR = "😃"
const DARK_THEME = "🌙"
const LIGHT_THEME = "☀️"

const BEGINNER_MINES_AMOUNT = 2
const MEDIUM_MINES_AMOUNT = 14
const EXPERT_MINES_AMOUNT = 32

const BEGINNER_SIZE = 4
const MEDIUM_SIZE = 8
const EXPERT_SIZE = 12

const EXTERMINATOR_AMOUNT = 3

var timerId
var gStartTime
var megaHintTimeoutId
var hintTimeoutId
var killMinesTimeoutId
var isMinesBlowingUp

var gBoard
var gBoardMoves = []

var isDark = true

var gLevel = {
    SIZE: MEDIUM_SIZE,
    MINES: MEDIUM_MINES_AMOUNT,
}

var megaHintFirstLoc

var gGame

function initGame() {
    // wait for mines to blow up
    if (isMinesBlowingUp) return

    if (timerId) {
        // restart
        clearInterval(timerId)
        timerId = null
    }
    gBoard = buildBoard()
    renderBoard(gBoard, ".board-container")
    clearSlate()
    gGame.isOn = true
}

function clearSlate() {
    const elBombsRemain = document.querySelector(".bombs-remaining")
    elBombsRemain.innerText = formatCounters(gLevel.MINES)
    document.querySelector(".container .timer").innerText = "000"
    document.querySelector(".smiley").innerText = SMILEY_REGULAR
    document.querySelector(".lives").innerText = `${LIFE}${LIFE}${LIFE}`
    clearTimeout(megaHintTimeoutId)
    clearTimeout(hintTimeoutId)
    clearTimeout(killMinesTimeoutId)

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        isHint: false,
        hints: 3,
        safeClick: 3,
        isKilled: false,
        isMegaHint: false,
        canUseMegaHint: true,
        isSevenBoom: false,
        isSandboxNow: false,
        isBuiltBySandbox: false,
    }

    // Recover buttons
    document.querySelector(".hint").disabled = false
    document.querySelector(".safe-click").disabled = false
    document.querySelector(".mega-hint").disabled = false
    document.querySelector(".kill-mines").disabled = false

    gMines = []
    megaHintFirstLoc = null
    gBoardMoves = []
    isMinesBlowingUp = false
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

function checkWin() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            // if mine and not marked NOT WIN!
            if (currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                return false
            }
            // if not mine and not shown NOT WIN!
            if (!currCell.isMine && !currCell.isShown) return false
        }
    }
    return true
}

function announceWin() {
    const elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SMILEY_WINNER
    clearInterval(timerId)
    gGame.isOn = false
}

function announceLose(i, j) {
    const elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SMILEY_LOSER
    const elCell = getCellElement(i, j)
    elCell.style.backgroundColor = "red"
    blowUpMines(gMines) // Using an async func
    clearInterval(timerId)
    gGame.isOn = false
}


const timer = ms => new Promise(res => setTimeout(res, ms))
// We need to wrap the loop into an async function
async function blowUpMines(gMines) {
    const gameCard = document.querySelector(".game-container")
    gameCard.classList.remove("shake")
    gameCard.classList.add("ending-shake")
    console.log(gameCard)
    isMinesBlowingUp = true
    for (var i = 0; i < gMines.length; i++) {
        const currMine = gMines[i]
        openCell(currMine.i, currMine.j)
        blowUpMine(currMine.i, currMine.j)
        await timer(100); // then the created Promise can be awaited
    }
    setTimeout(() => gameCard.classList.remove("ending-shake"), 500)

    isMinesBlowingUp = false
}
function blowUpMine(i, j) {
    getCellElement(i, j).classList.add("kill")
}

function startTimer() {
    const elTimer = document.querySelector(".container .timer")
    gStartTime = new Date().getTime()
    timerId = setInterval(() => {
        var now = new Date().getTime()
        var timePassed = (now - gStartTime) / 1000
        var timePassedStr = formatCounters(timePassed)
        gGame.secsPassed = timePassed
        elTimer.innerText = timePassedStr
    }, 500) // 500 just in case
}

function changeDifficulty(difficulty) {
    switch (difficulty) {
        case "beginner":
            gLevel.MINES = BEGINNER_MINES_AMOUNT
            gLevel.SIZE = BEGINNER_SIZE
            break
        case "medium":
            gLevel.MINES = MEDIUM_MINES_AMOUNT
            gLevel.SIZE = MEDIUM_SIZE
            break
        case "expert":
            gLevel.MINES = EXPERT_MINES_AMOUNT
            gLevel.SIZE = EXPERT_SIZE
            break

        default:
            console.log("Change difficulty is bugged!")
    }
    initGame()
}

function updateUI() {
    // Updates lives
    const elLives = document.querySelector(".lives")
    switch (gGame.lives) {
        case 3:
            elLives.innerText = `${LIFE}${LIFE}${LIFE}`
            break
        case 2:
            elLives.innerText = `${LIFE}${LIFE}`
            break
        case 1:
            elLives.innerText = `${LIFE}`
            break
        case 0:
            elLives.innerText = ``
            break

        default:
            console.log("Problem with updateUI!")
            break
    }

    // Updates mines amount
    const elBombsRemain = document.querySelector(".bombs-remaining")
    var BombsRemain = gLevel.MINES - gGame.markedCount
    var BombsRemainStr = formatCounters(BombsRemain)
    elBombsRemain.innerText = BombsRemainStr
}

function onHint() {
    if (gGame.hints > 0) gGame.isHint = true
}

function useHint(rowIdx, colIdx) {
    gGame.hints--
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

    hintTimeoutId = setTimeout(() => {
        hideCells(hideAfterHintCells)
        if (gGame.hints === 0) {
            // DISABLE BUTTON (Here for smoothness of gameplay)
            document.querySelector(".hint").disabled = true
        }
    }, 1000)
    gGame.isHint = false
}

function onSafeClick() {
    if (gGame.safeClick <= 0) return

    const safeClicks = getSafeClicks()

    if (safeClicks.length === 0) return // NO EMPTY CELLS!

    const randomIndex = getRandomIntInclusive(0, safeClicks.length - 1)
    const randCell = safeClicks[randomIndex]
    const elCell = getCellElement(randCell.i, randCell.j)
    elCell.classList.add("safe")

    gGame.safeClick--
    if (gGame.safeClick === 0) {
        // Disable button
        document.querySelector(".safe-click").disabled = true
    }
}

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

function onKillMines() {
    if (gGame.isKilled || gMines.length === 0) return
    gGame.isKilled = true
    document.querySelector(".kill-mines").disabled = true
    const unmarkedMines = getUnmarkedMines()
    const unmarkedMinesLength = unmarkedMines.length // static length

    for (let i = 0; i < EXTERMINATOR_AMOUNT && i < unmarkedMinesLength; i++) {
        if (gMines.length === 0) return // happens in easy mode

        const randomIndex = getRandomIntInclusive(0, unmarkedMines.length - 1)
        const randCell = unmarkedMines[randomIndex]
        console.log(randCell)
        gBoard[randCell.i][randCell.j].isShown = true
        openCell(randCell.i, randCell.j)
        const elCell = getCellElement(randCell.i, randCell.j)
        elCell.classList.add("kill")
        killMinesTimeoutId = setTimeout(() => {
            console.log(randCell.i, randCell.j)
            elCell.classList.remove("kill")
            gBoard[randCell.i][randCell.j].isMine = false
            openCell(randCell.i, randCell.j)
            setMinesNegsCount(gBoard)
            updateNeighbors(randCell.i, randCell.j)
        }, 3000)
        unmarkedMines.splice(unmarkedMines.indexOf(randCell), 1)
    }
}

function getUnmarkedMines() {
    const unmarkedMines = []
    for (let i = 0; i < gMines.length; i++) {
        const currMine = gMines[i]
        if (!gBoard[currMine.i][currMine.j].isMarked) {
            unmarkedMines.push(currMine)
        }
    }
    return unmarkedMines
}

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

function onMegaHint() {
    if (!gGame.canUseMegaHint) return // it means we already used it!
    gGame.isMegaHint = true
    gGame.canUseMegaHint = false
}

function useMegaHint(i, j) {
    if (!megaHintFirstLoc) {
        megaHintFirstLoc = { i, j }
        return // we need to choose another one
    }
    const megaHintSecondLoc = { i, j }
    for (let i = megaHintFirstLoc.i; i < megaHintSecondLoc.i + 1; i++) {
        for (let j = megaHintFirstLoc.j; j < megaHintSecondLoc.j + 1; j++) {
            if (gBoard[i][j].isShown) continue
            openCell(i, j)
            megaHintTimeoutId = setTimeout(() => {
                hideCell(i, j)
            }, 2000)
        }
    }

    document.querySelector(".mega-hint").disabled = true
    gGame.isMegaHint = false
}

function onSevenBoom() {
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

function isSevenBoom(num) {
    if (num % 7 === 0) return true
    if ((num + "").indexOf("7") > -1) return true
    return false
}

function onSandbox() {
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

function onUndo() {
    if (gBoardMoves.length === 1) return
    console.log(gBoardMoves)
    gBoardMoves.pop()
    // gBoard = gBoardMoves[gBoardMoves.length - 1]
    gBoard = deepCopyMatrix(gBoardMoves[gBoardMoves.length - 1])
    renderBoardCellByCell()
}

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
    var btns = document.querySelectorAll(".utilities button")
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("light")
    }
    // var unopenedElements = document.querySelectorAll(".unopened")
    // for (let i = 0; i < unopenedElements.length; i++) {
    //     unopenedElements[i].classList.toggle("light")
    // }
    // var openedElements = document.querySelectorAll(".opened")
    // for (let i = 0; i < openedElements.length; i++) {
    //     openedElements[i].classList.toggle("light")
    // }
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
