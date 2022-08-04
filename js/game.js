// i have use JQ
const cards = document.querySelectorAll(".cards");

let firstCard = null, secondCard = null;
let boardLock = false;
let running = false;
let time = 30;  // 設定 網頁載入時時間顯示，遊戲開始的剩餘時間至 gameInit 去設定。
let score = 0;
let IntervalID = 0;

let degree = "4x3";
let totalPair = 6;
let pair = 0;

/* ~~~~~ 方便測試 Start~~~~~ */

/* ~~~~~ 方便測試 End~~~~~ */

window.onload = function () {
    $("#gameStatus").text("待機");
    $("#time").text(`${time}`);
    $("#score").text(`${score}`);
    $(".gameBtn").on("click", gameStart);
    $(".degreeBtn").on("click", degreeChange);
};


function gameInit() {
    $(".cards").each((index, elem) => {
        elem.classList.remove('flip')
    });
    [firstCard, secondCard] = [null, null];

    boardLock = false;

    if (degree == "4x3") time = 30;
    else if (degree == "6x6") time = 100;

    score = 0;
    IntervalID = 0;
    pair = 0;
    shuffle();
    $('#time').text(`${time}`);
    $('#score').text(`${score}`);
}
function degreeChange() {
    if (running) return; //遊戲進行中不能改
    if (degree == `${this.dataset.degree}`) return; // 不能重複點同一個難易度

    $(".degreeBtn").removeClass("active");
    $(this).addClass("active");

    degree = `${this.dataset.degree}`;
    if (degree == "6x6") {
        $("#gameboard_4x3").css({ "display": "none" });
        $("#gameboard_6x6").css({ "display": "grid" });
        $(".cards").css({
            width: "100px",
            height: "100px"
        })
        totalPair = 18;
        gameInit();
    }
    else if (degree == "4x3") {
        $("#gameboard_4x3").css({ "display": "grid" });
        $("#gameboard_6x6").css({ "display": "none" });
        $(".cards").css({
            width: "175px",
            height: "175px"
        });
        totalPair = 6;
        gameInit();
    }
}

function gameStart() {
    gameInit();
    running = true;

    $('.gameBtn').off("click", gameStart);
    gameBtnChanged("放棄遊戲");

    $('.cards').on("click", flipCard);

    $('#gameStatus').text(`進行中`)
    IntervalID = setInterval(timeCountDown, 1000);
}
/* ====== 時間倒數 ====== */
function timeCountDown() {
    time -= 1;
    $('#time').text(`${time}`)
    if (time == 0) timeUp();
}
function timeUp() {
    clearInterval(IntervalID);
    running = false;
    $('.cards').off("click", flipCard);

    gameBtnChanged("重新開始");
    $('#gameStatus').text(`遊戲結束`)
}
/* ====== 翻牌判斷====== */
function flipCard() {
    if (!running) return;
    if (boardLock) return; // 鎖定牌面，避免再判定前 繼續翻牌
    if (this === firstCard) return;

    this.classList.add('flip');

    if (firstCard == null) {
        firstCard = this;
        return;
    }
    secondCard = this;
    boardLock = true;
    checkMatch();
}
function checkMatch() {
    let isMatch = firstCard.dataset.pokemon_index == secondCard.dataset.pokemon_index;
    isMatch ? matchSuccess() : matchFail();
}
function matchSuccess() {
    score += 5;
    pair += 1;
    $('#score').text(`${score}`);
    // 移除監聽事件，釋放記憶體
    $(firstCard).off("click", flipCard);
    $(secondCard).off("click", flipCard);
    boardReset();
    if (pair == totalPair) gmaePassed();
}
function matchFail() {
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        boardReset();
    }, 1500)
}
function boardReset() {
    boardLock = false;
    [firstCard, secondCard] = [null, null];
}
/* ====== 洗牌 ====== */
function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * 36);
        card.style.order = randomPos
    })
}
/* ====== 過關 & 放棄 ====== */
function gmaePassed() {
    running = false;
    clearInterval(IntervalID);
    $('#gameStatus').text(`過關`)
    gameBtnChanged("新的一局");
}
function giveUp() {
    running = false;
    clearInterval(IntervalID);
    $('#gameStatus').text(`放棄`);
    $(".cards").off("click", flipCard);
    gameBtnChanged("重新開始");
}
function gameBtnChanged(text) {
    $('.gameBtn').text(`${text}`);
    if (text == "放棄遊戲") {
        $('.gameBtn').text("放棄遊戲");
        $('.gameBtn').attr('id', 'giveUpBtn');
        $('.gameBtn').on("click", giveUp);
    }
    else if (text == "重新開始") {
        $('.gameBtn').off("click", giveUp);
        $('.gameBtn').text("重新開始");
        $('.gameBtn').attr('id', 'restartBtn');
        $('.gameBtn').on("click", gameStart);
    }
    else if (text == "新的一局") {
        $('.gameBtn').text("新的一局");
        $('.gameBtn').attr('id', 'newGameBtn');
        $('.gameBtn').on("click", gameStart);
    }

}