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
var gGameState = {
    board: [],
    lives: [],
    gameProperties: []
}

var isDark = true

var gLevel = {
    SIZE: MEDIUM_SIZE,
    MINES: MEDIUM_MINES_AMOUNT,
    DIFFICULTY: 'medium'
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
    // use default mines amount
    if (gLevel.SIZE === BEGINNER_SIZE) gLevel.MINES = BEGINNER_MINES_AMOUNT
    if (gLevel.SIZE === MEDIUM_SIZE) gLevel.MINES = MEDIUM_MINES_AMOUNT
    if (gLevel.SIZE === EXPERT_SIZE) gLevel.MINES = EXPERT_MINES_AMOUNT

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
    gGameState = []
    isMinesBlowingUp = false

    gGameState = {
        board: [],
        lives: [],
        gameProperties: []
    }

    setHighScore()
}

function handleButtons() {
    if (gGame.canUseMegaHint) {
        document.querySelector(".mega-hint").disabled = false
    }
    if (gGame.hints > 0) {
        document.querySelector(".hint").disabled = false
    } if (gGame.safeClick > 0) {
        document.querySelector(".safe-click").disabled = false
    } if (!gGame.isKilled) {
        document.querySelector(".kill-mines").disabled = false
    }
}

function disableButtons() {
    document.querySelector(".hint").disabled = true
    document.querySelector(".safe-click").disabled = true
    document.querySelector(".mega-hint").disabled = true
    document.querySelector(".kill-mines").disabled = true
}

function enableButtons() {
    document.querySelector(".hint").disabled = false
    document.querySelector(".safe-click").disabled = false
    document.querySelector(".mega-hint").disabled = false
    document.querySelector(".kill-mines").disabled = false
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

function setHighScore() {
    const elHighScore = document.querySelector('.info-container-2 .high-score')
    elHighScore.innerText = formatCounters(localStorage.getItem(`${gLevel.DIFFICULTY}HighScore`))
}

function updateStorageHighScore() {
    if (typeof (Storage) === "undefined") return
    const score = gGame.secsPassed

    const lastHighScore = localStorage.getItem(`${gLevel.DIFFICULTY}HighScore`)
    if (lastHighScore > score || lastHighScore == null) {
        localStorage.setItem(`${gLevel.DIFFICULTY}HighScore`, score)
    }
    setHighScore()
}

function announceWin() {
    const elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SMILEY_WINNER
    clearInterval(timerId)

    if (!gGame.isSevenBoom && !gGame.isBuiltBySandbox) {
        updateStorageHighScore()
    }
    gGame.isOn = false
}

function announceLose(i, j) {
    disableButtons()
    const elSmiley = document.querySelector(".smiley")
    elSmiley.innerText = SMILEY_LOSER
    const elCell = getCellElement(i, j)
    elCell.style.backgroundColor = "red"
    blowUpMines(gMines) // Using an async func
    rollOutBoard()  // Using an async func
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
        setTimeout(() => getCellElement(currMine.i, currMine.j).innerText = "💥", 100)
    }
    setTimeout(() => gameCard.classList.remove("ending-shake"), 500)

    isMinesBlowingUp = false
}

async function rollOutBoard() {
    const cellElements = document.querySelectorAll(".cell")
    for (var i = 0; i < cellElements.length; i++) {
        const currCell = cellElements[i]
        console.log('YES')
        if (Math.random() > 0.4) {
            console.log('EVEN MORE YES')
            currCell.classList.add("roll-out-bottom")
        }
        await timer(25); // then the created Promise can be awaited
    }
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
            gLevel.DIFFICULTY = 'beginner'
            break
        case "medium":
            gLevel.MINES = MEDIUM_MINES_AMOUNT
            gLevel.SIZE = MEDIUM_SIZE
            gLevel.DIFFICULTY = 'medium'
            break
        case "expert":
            gLevel.MINES = EXPERT_MINES_AMOUNT
            gLevel.SIZE = EXPERT_SIZE
            gLevel.DIFFICULTY = 'expert'
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
