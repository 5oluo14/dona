/* ═══════════════════════
   LANGUAGE TOGGLE
═══════════════════════ */
let currentLang = 'en';
function toggleLang() {
    currentLang = currentLang === 'en' ? 'it' : 'en';
    document.querySelectorAll('.en').forEach(el => el.style.display = currentLang === 'en' ? '' : 'none');
    document.querySelectorAll('.it').forEach(el => el.style.display = currentLang === 'it' ? '' : 'none');
}

/* ═══════════════════════
   MUSIC TOGGLE 
═══════════════════════ */
const audio = new Audio("dona.mp3");
audio.loop = true;
audio.currentTime = 25;

let musicOn = false;
function toggleMusic(btn) {
    musicOn = !musicOn;
    if (musicOn) {
        audio.play();
    } else {
        audio.pause();
    }
    btn.textContent = musicOn ? '♬' : '♪';
    btn.style.background = musicOn ? 'rgba(139,26,26,1)' : 'rgba(139,26,26,0.85)';
}

/* ═══════════════════════
   CURTAIN OPEN
═══════════════════════ */
let curtainOpened = false;
function openCurtain() {
    if (curtainOpened) return;
    curtainOpened = true;
    document.getElementById('stage').classList.add('open');
    audio.play();
    musicOn = true;
    const btn = document.getElementById('music-btn');
    btn.textContent = '♬';
    btn.style.background = 'rgba(139,26,26,1)';
    document.getElementById('tap-prompt').style.display = 'none';
}

/* ═══════════════════════
   SCROLL FADE-UP
═══════════════════════ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ═══════════════════════
   SCRATCH COINS SYSTEM
═══════════════════════ */

const THRESHOLD = 0.60;
const coinsState = [false, false, false];

function initCoin(id, idx) {

    if (coinsState[idx]) return;

    const canvas = document.getElementById("coin" + id);
    const container = canvas.closest(".coin-container");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const size = rect.width;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    /* GOLD COVER */

    const grad = ctx.createRadialGradient(
        size * .35, size * .3, size * .02,
        size * .5, size * .5, size * .6
    );

    grad.addColorStop(0, "#F5E6A3");
    grad.addColorStop(.3, "#D4AF37");
    grad.addColorStop(.65, "#C9A84C");
    grad.addColorStop(.85, "#B8973A");
    grad.addColorStop(1, "#8B6914");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    /* SHINE */

    const shine = ctx.createRadialGradient(
        size * .3, size * .25, 0,
        size * .3, size * .25, size * .35
    );

    shine.addColorStop(0, "rgba(255,255,255,0.55)");
    shine.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    /* EDGE */

    ctx.strokeStyle = "rgba(139,105,20,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();

    /* TEXT */

    ctx.fillStyle = "rgba(100,70,10,0.6)";
    ctx.font = `bold ${size * .11}px Cinzel,serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("SCRATCH", size / 2, size / 2 - size * .06);
    ctx.fillText("HERE", size / 2, size / 2 + size * .1);

    ctx.globalCompositeOperation = "destination-out";

    /* SCRATCH STATE */

    let scratching = false;
    let scratched = 0;

    const brush = size * .12;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function scratch(e) {

        if (!scratching) return;

        const { x, y } = getPos(e);

        ctx.beginPath();
        ctx.arc(x, y, brush, 0, Math.PI * 2);
        ctx.fill();

        scratched++;

        if (scratched % 20 === 0) {
            checkProgress(ctx, canvas, idx);
        }
    }

    canvas.addEventListener("pointerdown", e => {
        scratching = true;
        scratch(e);
    });

    canvas.addEventListener("pointermove", scratch);

    window.addEventListener("pointerup", () => {
        scratching = false;
    });

}

function checkProgress(ctx, canvas, idx) {

    if (coinsState[idx]) return;

    const pixels = ctx.getImageData(
        0, 0,
        canvas.width,
        canvas.height
    ).data;

    let transparent = 0;
    let total = 0;

    for (let i = 3; i < pixels.length; i += 32) {

        if (pixels[i] < 50) transparent++;

        total++;
    }

    const percent = transparent / total;

    if (percent > THRESHOLD) {

        coinsState[idx] = true;

        canvas.style.transition = "opacity .6s";
        canvas.style.opacity = "0";

        setTimeout(() => {
            canvas.style.pointerEvents = "none";
        }, 600);

        if (coinsState.every(Boolean)) {
            allScratched();
        }
    }

}

function allScratched() {

    document
        .getElementById("reveal-msg")
        .classList
        .add("show");

    document
        .getElementById("to-countdown")
        .classList
        .add("show");

    launchConfetti();
}
/* ═══════════════════════
   COUNTDOWN TIMER
═══════════════════════ */
const weddingDate = new Date('2026-03-27T18:00:00');
function pad(n, len = 2) { return String(n).padStart(len, '0'); }
function updateTimer() {
    const now = new Date();
    let diff = weddingDate - now;
    if (diff <= 0) { diff = 0; }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('t-days').textContent = pad(days, 2);
    document.getElementById('t-hours').textContent = pad(hrs);
    document.getElementById('t-min').textContent = pad(mins);
    document.getElementById('t-sec').textContent = pad(secs);
}
updateTimer();
setInterval(updateTimer, 1000);

/* ═══════════════════════
   INIT COINS — lazy via IntersectionObserver
   so getBoundingClientRect() returns real size
═══════════════════════ */
let coinsInitialised = false;
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting && !coinsInitialised) {
            coinsInitialised = true;
            // rAF ensures layout is fully flushed before we read sizes
            requestAnimationFrame(() => {
                [0, 1, 2].forEach(i => initCoin(i, i));
            });
        }
    });
}, { threshold: 0.1 });
revealObserver.observe(document.getElementById('reveal'));

// Re-init on resize (AbortController cleans up old listeners)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        coinsInitialised = false; // allow re-init
        requestAnimationFrame(() => [0, 1, 2].forEach(i => initCoin(i, i)));
    }, 200);
});


function launchConfetti() {
    const container = document.getElementById("confetti-container");

    const colors = [
        "#5c2018",
        "#791d1dff",
    ];

    const confettiCount = 300;

    for (let i = 0; i < confettiCount; i++) {

        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        const size = Math.random() * 8 + 6;

        confetti.style.width = size + "px";
        confetti.style.height = size * 0.4 + "px";

        confetti.style.left = Math.random() * 100 + "vw";

        confetti.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        confetti.style.animationDuration =
            (Math.random() * 3 + 3) + "s";

        confetti.style.animationDelay =
            (Math.random() * 1) + "s";

        confetti.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        container.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 7000);
    }

}