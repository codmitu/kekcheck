
let backgroundsArray = ["wheat", "tileable_wood_texture_@2X", "robots_@2X", "moroccan-flower-dark", "folk-pattern-black", "dark_mosaic", "bo_play_pattern_@2X", "burried", "carbon_fibre_@2X", "christmas-colour", "circle-blues", "connectwork", "dark_wood", "dark-paths", "diagonal_striped_brick_@2X", "diagonal-squares", "doodles", "ep_naturalblack", "escheresque_ste_@2X", "fancy-cushion", "grey_wash_wall", "greyfloral", "herringbone", "more-leaves-on-green", "morocco-blue", "oriental-tiles", "pool_table", "pow-star", "prism", "purty_wood", "retina_wood", "sakura", "soft_kill_@2X", "tex2res4", "vaio_hard_edge_@2X", "wood_pattern", "wormz", "woven_@2X"];
let emotesArray = ["4Head", "ArgieB8", "BabyRage", "BibleThump", "BrokeBack", "cmonBruh", "CoolStoryBob", "CrreamAwk", "DxCat", "EleGiggle", "FailFish", "FBPass", "FootYellow", "Jebaited", "Kappa", "KonCha", "LUL", "NotLikeThis", "PogChamp", "PunOko", "ResidentSleeper", "RlyTho", "SeemsGood", "StinkyGlitch", "SwiftRage", "TheIlluminati", "TriHard", "WutFace"];
const url = "https://kekcheck-d237d-default-rtdb.europe-west1.firebasedatabase.app/";

var doc = window.document;
var docEl = doc.documentElement;
var body = document.body;

doc.addEventListener("contextmenu", e => {
    e.preventDefault();
})



const chessboard = document.querySelector("#chessboard");
const squares = document.querySelector(".squares");

const form = document.querySelector("form");
let submited = false;
const streamerInput = document.querySelector("#twitch-channel-input");

// Streamer last 3 moves container
const streamerMoves = document.querySelector("#streamer-last-moves");
const chatMoves = document.querySelector("#chat-last-moves");
let streamerMovesArray = [];
let chatMovesArray = [];
let legalMovesArray = [];
let scoresData = [];
let position = -1;

const startBtn = document.querySelector("#start-btn");
let timeInt;
const modal = document.querySelector("#modal");
const menu = document.querySelector("menu");
const menuBtns = document.querySelectorAll("menu button");
const about = document.querySelector(".about");
const leaderboard = document.querySelector(".leaderboard");
const showMenuBtn = document.querySelector(".show-menu-btn");
const hideMenuBtn = document.querySelector(".hide-menu-btn");
const scoreBoard = document.querySelector("#tbody");
let joinersArray = [];
let puppetsArray = [];
let vip = false;
let sub = false;
let startGame = false;
let checkmate = false;

let pieceSound;
let incheckSound;
let victorySound;
let drawSound;
let stealPieceSound;
let startSound;

var statusElement = document.querySelector("#game-info");
const streamerScore = document.querySelector("#streamer-score");
const chatScore = document.querySelector("#chat-score");
const chatSide = document.querySelector("#chat");
const chatBubble = document.querySelector(".chat-bubble");
const spectatorsContainer = document.querySelector("#spectators");
const nrSpectators = document.querySelector("#number-of-spectators");
const checkboxes = document.querySelectorAll(".selection");
const vipBtn = document.querySelector(".vip");
const subBtn = document.querySelector(".sub");
const timeBtns = document.querySelectorAll(".seconds-btns-container button");
let seconds = document.querySelector("#time-remaining");
let defaultSeconds = 60;
let timeRemaining;
const arrow = document.querySelector("#arrows");
const promoDiv = document.querySelector(".promotion-div");


let votedMovesArray = [];
let votedMove = "";
let oldMove = "";

var abChess = {};
var options = {
    animated: true,
    animationSpeed: 5,
    clickable: true,
    draggable: true,
    markLegalSquares: false,
    width: 700
};
abChess = new AbChess("chessboard", options);
abChess.setFEN();


async function ajax(url, method, body) {
    const res = await fetch(url + ".json", {
        method: method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
}

// on page load
async function getScores() {
    scoresData = await ajax(url);
    if (scoresData === null) {
        scoresData = [];
    }
}



// displays the results in the leaderboard
function displayLeaderboard() {
    let tableRow = "";
    for (let i = 0; i < scoresData.length; i++) {
        tableRow += `
        <tr>
            <td>${scoresData[i].name}</td>
            <td>${scoresData[i].streamerMP}</td>
            <td>${scoresData[i].chatMP}</td>
            <td>Chat</td>
        </tr>
        `
    }
    scoreBoard.innerHTML = tableRow;
}


// create new scoreboard to database on form submit if its a new channel
async function addScore() {
    await ajax(url + scoresData.length, "PUT", {
        "name": streamerInput.value,
        "streamerMP": 0,
        "streamerGP": 0,
        "chatMP": 0,
        "chatGP": 0,
        "cover": false
    });
    await getScores();
}


async function extraPointFalse() {
    await ajax(url + position, "PATCH", {
        "cover": false
    });
    await getScores();
}
async function extraPointTrue() {
    await ajax(url + position, "PATCH", {
        "cover": true
    });
    await getScores();
}
async function updateChatGP() {
    await ajax(url + position, "PATCH", {
        "chatGP": scoresData[position].chatGP + 1
    });
    await getScores();
}



// updates game score data on win
async function updateScoreData() {
    await ajax(url + position, "PATCH", {
        "streamerGP": Number(streamerScore.innerText),
        "chatGP": Number(chatScore.innerText)
    });
    await getScores();
}



//updates match score data on match point
async function updateStreamerMP() {
    await ajax(url + position, "PATCH", {
        "streamerMP": scoresData[position].streamerMP + 1,
        "streamerGP": 0,
        "chatGP": 0
    });
    await getScores();
}
async function updateChatMP() {
    await ajax(url + position, "PATCH", {
        "chatMP": scoresData[position].chatMP + 1,
        "chatGP": 0,
        "streamerGP": 0
    });
    await getScores();
}

async function updateScoreUI() {
    streamerScore.innerText = await scoresData[position].streamerGP;
    chatScore.innerText = await scoresData[position].chatGP;
}

form.addEventListener("submit", e => {
    e.preventDefault();
    if (streamerInput.value === "") {
        return;
    }
    getScores();
    streamerScore.innerText = "";
    chatScore.innerText = "";
    if (streamerInput.value.toLowerCase() !== "wolfabelle") {
        alert("Only works with Wolfabelle channel while in testing.");
        return;
    }
    ComfyJS.Init(streamerInput.value);
    submited = true;
    if (scoresData && scoresData.some(n => n.name === streamerInput.value)) {
        position = scoresData.findIndex(s => s.name === streamerInput.value);
    }
})




ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (flags.broadcaster) {
        return;
    }
    if (vip && !flags.vip) {
        return;
    }
    if (sub && !flags.subscriber) {
        return;
    }
    if (puppetsArray.some(u => u.username === user)) {
        return;
    }
    if (command === "join") {
        if (joinersArray.length >= 300 || joinersArray.some(u => u.username === user)) {
            return;
        }
        // ADD CHAT AS SPECTATORS on !join command 
        const el = document.createElement("span");
        el.classList.add("spectator");
        el.innerText = `${user}`;
        el.style.color = `${extra.userColor}`;

        // SPREAD THEM RANDOMLY
        el.style.left = Math.floor(Math.random() * 480) + "px";
        el.style.top = Math.floor(Math.random() * 580) + "px";
        spectatorsContainer.appendChild(el);

        // PLACE THEM IN AN ARRAY, MAX 300 (32 WILL JOIN THE CHESSBOARD ON START)
        joinersArray.push({
            username: `${user}`,
            colorname: `${extra.userColor}`
        });
        nrSpectators.innerText = joinersArray.length;
    }
}

let timeToMove;
let timer = null;

let promoArray = ["q", "r", "b", "k"];
let randomPromo = Math.floor(Math.random() * promoArray.length);

let puppetEmote;
// GET VOTED MOVES FROM CHAT AND PUSH IT TO ARRAY`
ComfyJS.onChat = (user, message, flags, self, extra) => {
    if (flags.broadcaster) {
        return;
    }
    if (vip && !flags.vip) {
        return;
    }
    if (sub && !flags.subscriber) {
        return;
    }
    if (puppetsArray.some(u => u.username === user) && emotesArray.includes(message)) {
        puppetEmote = document.querySelector(`.${user}`);
        puppetEmote.style.background = `url("./images/emotes/${message}.png") no-repeat 20% 0%/contain`;
        setTimeout(() => {
            puppetEmote.style.background = "";
        }, 2000);
        return;
    }
    else if (legalMovesArray.indexOf(message) > -1) {
        votedMovesArray.push(message)
        oldMove = votedMove;
        votedMove = mostOccuredValue(votedMovesArray);
        timeToMove = seconds.innerText;
        if (votedMove !== undefined) {
            chatBubble.classList.add("show-bubble");
            chatBubble.innerText = votedMove;
        }
        if (oldMove !== votedMove) {
            clearTimeout(timer)
            timeToMove = 5;
            if (timeToMove > seconds.innerText) {
                timeToMove = seconds.innerText - 1;
            }
            timer = setTimeout(() => {
                abChess.play(votedMove[0] + votedMove[1], votedMove[2] + votedMove[3], promoArray[randomPromo])
            }, timeToMove * 1000);
        }
    }
}




// ADD PUPPETS TO CHESS BOARD
// let addPuppets = setInterval(addSpectatorsToChessboard, 500);
function addSpectatorsToChessboard() {
    for (let i = 0; i < 32; i++) {
        const randomNr = Math.floor(Math.random() * joinersArray.length);
        puppetsArray.push(joinersArray[randomNr]);
        spectatorsContainer.removeChild(spectatorsContainer.childNodes[randomNr]);
        joinersArray.splice(randomNr, 1);
    }
    resetChess();
    extraPointTrue();
}

function resetChess() {
    abChess.reset();
    abChess.setFEN("8/8/8/8/8/8/8/8 w - - 0 1");
    abChess.setFEN();

    statusElement.innerText = '';
    streamerMoves.innerHTML = '';
    chatMoves.innerHTML = '';
    legalMovesArray = [];
    movesCount = 0;
    setTimeout(() => {
        updateScoreUI();
    }, 1000);
}

var movesCount = 1;
var turn;
abChess.onMovePlayed(updateStatus);
function updateStatus() {
    pieceSound.play();
    // max nr to display last moves
    const maxDisplayedMoves = 3;
    var status = " to move.";
    turn = `${streamerInput.value}`;
    movesCount += 1;

    legalMovesArray = [];
    let legalMoves = abChess.getLegalMoves(movesCount);
    legalMoves.forEach(mov => {
        legalMovesArray.push(mov.start + mov.end);
    });

    let movedFrom = abChess.getInfo("movedFrom");
    let movedTo = abChess.getInfo("movedTo");
    let piece = abChess.getInfo("Piece");
    let puppet = abChess.getInfo("Puppet");

    if (piece === "n") {
        piece = "Knight";
    } else if (piece === "p") {
        piece = "Pawn";
    } else if (piece === "b") {
        piece = "Bishop";
    } else if (piece === "r") {
        piece = "Rook";
    } else if (piece === "q") {
        piece = "Queen";
    } else {
        piece = "King";
    }

    let lastMove = `${puppet}(${piece}) from ${movedFrom} to ${movedTo}`
    if (abChess.getActiveColor(movesCount) === "w") {
        const lastMoveChat = document.createElement("p");
        lastMoveChat.innerText = lastMove;
        chatMoves.insertBefore(lastMoveChat, chatMoves.firstChild);
        if (chatMoves.childNodes.length > maxDisplayedMoves) {
            chatMoves.removeChild(chatMoves.lastChild);
        }
        arrow.classList.remove("switch-arrow");
        chatBubble.classList.remove("show-bubble");
    } else {
        turn = "Chat";
        const lastMoveStreamer = document.createElement("p");
        lastMoveStreamer.innerText = lastMove;
        streamerMoves.insertBefore(lastMoveStreamer, streamerMoves.firstChild);
        if (streamerMoves.childNodes.length > maxDisplayedMoves) {
            streamerMoves.removeChild(streamerMoves.lastChild);
        }
        arrow.classList.add("switch-arrow");
    }

    if (abChess.isInsufficientMaterial(movesCount) || abChess.isStalemate(movesCount) || abChess.is50Moves(movesCount)) {
        startGame = false;
    } else if (abChess.isCheckmate(movesCount)) {
        startGame = false;
        checkmate = true;
    } else if (abChess.isCheck(movesCount)) {
        status = " is in check.";
        incheckSound.play();
    }
    statusElement.innerText = turn + status;
    votedMovesArray = [];
    clearTimeout(timer);
    resetTime();
}







// START BUTTON 
// RESET Button
startBtn.addEventListener("click", e => {
    if (streamerInput.value === "" || !submited) {
        statusElement.innerText = "← Add a twitch channel and press Enter then START ↘ when ready";
        return;
    }
    if (e.target.classList.contains("reset-btn")) {
        modal.classList.add("unhidden");
    } else {
        if (joinersArray.length < 32 && !startGame) {
            statusElement.innerText = "Wait for people to join (min 32) by typing !join";
            return;
        } else if (position === -1) {
            addScore(); //create new match if new streamer
            streamerScore.innerText = 0;
            chatScore.innerText = 0;
            position = scoresData.length;
        } else if (scoresData && scoresData[position].cover === true) {
            if (scoresData[position].chatGP === 2) {
                updateChatMP();
            } else {
                updateChatGP();
            }
        }
        startGame = true;
        checkmate = false;
        timeInt = setInterval(ticktock, 1000);
        addSpectatorsToChessboard();
        e.target.classList.add("reset-btn");
        statusElement.innerText = `${streamerInput.value} to move`;
        timeBtns.forEach(btn => btn.classList.add("disabled"));
        subBtn.classList.add("disabled");
        vipBtn.classList.add("disabled");
        streamerInput.setAttribute("readonly", true);
        nrSpectators.innerText = joinersArray.length;
        let legalMoves = abChess.getLegalMoves(movesCount);
        legalMoves.forEach(mov => {
            legalMovesArray.push(mov.start + mov.end);
        });
        pieceSound = new sound("./sounds/piece-moved.aac");
        incheckSound = new sound("./sounds/piece-in-check.aac");
        victorySound = new sound("./sounds/applause.mp3");
        drawSound = new sound("./sounds/fart.aac");
        stealPieceSound = new sound("./sounds/piece-attack.mp3");
        startSound = new sound("./sounds/start-game.mp3");
        startSound.play();
    }
})





// CLOSE POPUP
// RESET GAME
modal.addEventListener("click", e => {
    if (e.target.nodeName === "BUTTON") {
        modal.classList.remove("unhidden");
        if (e.target.id === "modal-yes") {
            startGame = false;
            timeBtns.forEach(btn => btn.classList.remove("disabled"));
            subBtn.classList.remove("disabled");
            vipBtn.classList.remove("disabled");
            streamerInput.removeAttribute("readonly");
            resetChess();
            clearInterval(timeInt);
            arrow.classList.remove("switch-arrow");
            startBtn.classList.remove("reset-btn");
            setTime();
            puppetsArray = [];
            if (streamerScore.innerText == 3) {
                streamerScore.innerText = 0;
            } else if (chatScore.innerText == 3) {
                chatScore.innerText = 0;
            }
        }
    }
})









//GET TIME-REMAINING FOR TURN IN SECONDS
seconds.innerText = defaultSeconds;
timeBtns.forEach(btn => {
    btn.addEventListener("click", e => {
        if (e.target.innerText === "+") {
            if (defaultSeconds === 120) {
                return;
            }
            defaultSeconds += 10;
        } else {
            if (defaultSeconds === 10) {
                return;
            }
            defaultSeconds -= 10;
        }
        seconds.innerText = defaultSeconds;
        timeRemaining = defaultSeconds;
    })
})




// let timeInt = setInterval(ticktock, 1000);
// check for wins and draws and update scores, UI and database
function ticktock() {
    seconds.innerText = seconds.innerText - 1;
    if (!startGame || seconds.innerText == 0) {
        if (seconds.innerText == 0) {
            if (arrow.classList.contains("switch-arrow")) {
                statusElement.innerText = `${streamerInput.value} won!!!🏆`;
                streamerScore.innerText++;
            } else {
                statusElement.innerText = `Chat won!!! ez clap`;
                chatScore.innerText++;
            }
            victorySound.play();
        } else if (checkmate) {
            if (arrow.classList.contains("switch-arrow")) {
                statusElement.innerText = `Chat is checkmate, ${streamerInput.value} won!!!🏆`;
                streamerScore.innerText++;
            } else {
                statusElement.innerText = `${streamerInput.value} is checkmate, Chat won!!! ez clap`;
                chatScore.innerText++;
            }
            victorySound.play();

        } else {
            statusElement.innerText = `It's a draw`;
            drawSound.play();
        }
        if (chatScore.innerText == 3) {
            updateChatMP();
        } else if (streamerScore.innerText == 3) {
            updateStreamerMP();
        } else {
            updateScoreData();
        }
        extraPointFalse();
        clearInterval(timeInt);
        startGame = false;
    }
}



function resetTime() {
    clearInterval(timeInt);
    setTime();
    timeInt = setInterval(ticktock, 1000);
}

// check to set the default time or the new time if it was changed
function setTime() {
    if (timeRemaining === undefined) {
        seconds.innerText = defaultSeconds;
    } else {
        seconds.innerText = timeRemaining;
    }
}












// Select checkboxes VIP SUB ALL
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', e => {
        e.currentTarget.classList.toggle("marked");
        if (vipBtn.classList.contains("marked")) {
            vip = true;
        } else {
            vip = false;
        }
        if (subBtn.classList.contains("marked")) {
            sub = true;
        } else {
            sub = false;
        }
    })
});





// SHOW ABOUT AND LEADERBOARD SECTION
menuBtns.forEach(btn => {
    btn.addEventListener("click", e => {
        if (e.target.id === "about") {
            about.classList.toggle("show");
            leaderboard.classList.remove("show");
        } else if (e.target.id === "leaderboard") {
            leaderboard.classList.toggle("show");
            about.classList.remove("show");
        }
    })
})
showMenuBtn.addEventListener("click", () => {
    showMenuBtn.classList.remove("show");
    hideMenuBtn.classList.add("show");
    menu.classList.add("display-menu");
})
hideMenuBtn.addEventListener("click", () => {
    showMenuBtn.classList.add("show");
    hideMenuBtn.classList.remove("show");
    menu.classList.remove("display-menu");
    about.classList.remove("show");
    leaderboard.classList.remove("show");
})





// Change Background image
let bgCounter = 0;
const bgBtns = document.querySelectorAll(".change-bg-buttons button");
bgBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        if (e.target.classList.contains("prev")) {
            --bgCounter;
            if (bgCounter < 0) {
                bgCounter = backgroundsArray.length - 1;
            }
        } else if (e.target.classList.contains("next")) {
            bgCounter++;
            if (bgCounter > backgroundsArray.length - 1) {
                bgCounter = 0;
            }
        } else {
            return;
        }
        body.style.background = `url("./images/backgrounds/${backgroundsArray[bgCounter]}.png")`;
    })
})
// Add random background image
function randomBackground() {
    const randomImage = Math.floor(Math.random() * backgroundsArray.length);
    body.style.background = `url("./images/backgrounds/${backgroundsArray[randomImage]}.png")`;
    bgCounter = randomImage;
}
randomBackground();



// CHANGE SIZE OF THE CHESS BOARD
const sizeBtns = document.querySelectorAll(".change-size-buttons button");
const chessBoard = document.querySelector("#chess-container");
const incBtn = document.querySelector(".increase");
const decBtn = document.querySelector(".decrease");

let size = 1;
sizeBtns.forEach(btn => {
    btn.addEventListener("click", e => {
        if (e.target.classList.contains("increase")) {
            decBtn.classList.remove("disabled");
            if (size < 1.3) {
                size += 0.2;
                chessBoard.style.transform = `scale(${size})`;
                if (size > 1.3) {
                    incBtn.classList.add("disabled");
                    return;
                }
            }
        } else if (e.target.classList.contains("decrease")) {
            incBtn.classList.remove("disabled");
            if (size > 0.75) {
                size -= 0.2;
                chessBoard.style.transform = `scale(${size})`;
                if (size < 0.75) {
                    decBtn.classList.add("disabled");
                    return;
                }
            }
        } else {
            return;
        }
    })
})



// Enter FullScreen
const fsBtn = document.querySelector("#full-screen");
function openFullscreen() {
    if (!doc.fullscreenElement) {
        docEl.requestFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
    } else {
        doc.exitFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-expand-arrows-alt">';
    }
}



// GET A UNIQUE VALUE FROM AN ARRAY
function mostOccuredValue(array) {
    let frqNr = 1;
    let nr = 0;
    let unique;
    for (let i = 0; i < array.length; i++) {
        for (let j = i; j < array.length; j++) {
            if (array[i] === array[j]) {
                nr++;
                if (nr > frqNr) {
                    frqNr = nr;
                    unique = array[i];
                }
            }
        }
        nr = 0;
    }
    return unique;
}



// PRELOAD SOUND
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.display = "none";
    body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}
