const svg = document.getElementById("spiralSVG");
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

let dots = [];
let totalDots = 1800;
let dotRadius = 2;
let isTextMode = false;
let SIZE, CENTER, MAX_RADIUS;
let textPositions = [];

function initSpiral() {
    svg.innerHTML = "";
    dots = [];
    textPositions = [];

    SIZE = Math.min(window.innerWidth, window.innerHeight);
    CENTER = SIZE / 2;
    MAX_RADIUS = CENTER - 40;

    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    for (let i = 0; i < totalDots; i++) {
        const idx = i + 0.5;
        const frac = idx / totalDots;
        const r = Math.sqrt(frac) * MAX_RADIUS;
        const theta = idx * GOLDEN_ANGLE;
        const x = CENTER + r * Math.cos(theta);
        const y = CENTER + r * Math.sin(theta);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", dotRadius);
        circle.setAttribute("fill", "#00ff88");

        svg.appendChild(circle);

        dots.push({
            el: circle,
            spiralX: x,
            spiralY: y,
            x: x,
            y: y
        });
    }

    generateText();
}

function generateText() {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${SIZE / 6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PORTFOLIO", CENTER, CENTER);

    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

    for (let y = 0; y < SIZE; y += 4) {
        for (let x = 0; x < SIZE; x += 4) {
            const index = (y * SIZE + x) * 4;
            if (data[index + 3] > 150) {
                textPositions.push({ x, y });
            }
        }
    }

    textPositions.sort(() => Math.random() - 0.5);
}

function animate() {
    dots.forEach((dot, i) => {
        let target;

        if (isTextMode && textPositions[i]) {
            target = textPositions[i];
            dot.el.setAttribute("fill", "#00ffaa");
        } else {
            target = { x: dot.spiralX, y: dot.spiralY };
            dot.el.setAttribute("fill", "#00ff88");
        }

        dot.x += (target.x - dot.x) * 0.08;
        dot.y += (target.y - dot.y) * 0.08;

        dot.el.setAttribute("cx", dot.x);
        dot.el.setAttribute("cy", dot.y);
    });

    requestAnimationFrame(animate);
}

svg.addEventListener("mouseenter", () => {
    isTextMode = true;
});

svg.addEventListener("mouseleave", () => {
    isTextMode = false;
});

window.addEventListener("resize", initSpiral);

initSpiral();
animate();

const timeline = document.getElementById("timeline");
const fillPath = document.getElementById("fillPath");
const pathLength = fillPath.getTotalLength();

fillPath.style.strokeDasharray = pathLength;
fillPath.style.strokeDashoffset = pathLength;

function updatePath() {
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    let progress = 0;

    if (rect.top <= 0 && rect.bottom >= windowHeight) {
        progress = Math.abs(rect.top) / (rect.height - windowHeight);
    }
    else if (rect.top > 0) {
        progress = 0;
    }
    else if (rect.bottom < windowHeight) {
        progress = 1;
    }

    progress = Math.max(0, Math.min(1, progress));

    fillPath.style.strokeDashoffset = pathLength * (1 - progress);
}

window.addEventListener("scroll", updatePath);
window.addEventListener("resize", updatePath);
updatePath();

// Reveal animation
const elements = document.querySelectorAll(".timeline-card, .timeline-image");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }
    });
}, { threshold: 0.2 });

elements.forEach(el => observer.observe(el));


const track = document.getElementById("xenorArcTrack");
const stage = document.getElementById("xenorArcStage");
const cards = document.querySelectorAll(".xenor-arc-card");
const prevBtn = document.querySelector(".xenor-prev");
const nextBtn = document.querySelector(".xenor-next");
const pagination = document.getElementById("xenorPagination");

let currentIndex = 0;
let velocity = 0;
let isDragging = false;
let startX = 0;

const radius = 500;
const total = cards.length;

function positionCards() {
    cards.forEach((card, i) => {
        const offset = i - currentIndex;
        const angle = offset * 30;
        const rad = angle * Math.PI / 180;

        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius - radius;

        card.style.transform =
            `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg)`;

        card.style.opacity = Math.abs(offset) > 3 ? 0 : 1;
    });

    updatePagination();
}

function updatePagination() {
    document.querySelectorAll(".xenor-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
    });
}

function goTo(index) {
    currentIndex = (index + total) % total;
    positionCards();
}

prevBtn.onclick = () => goTo(currentIndex - 1);
nextBtn.onclick = () => goTo(currentIndex + 1);

stage.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
    stage.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    stage.style.cursor = "grab";
    if (velocity > 50) goTo(currentIndex - 1);
    else if (velocity < -50) goTo(currentIndex + 1);
    velocity = 0;
});

window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    velocity = e.clientX - startX;
});

stage.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

stage.addEventListener("touchmove", e => {
    velocity = e.touches[0].clientX - startX;
});

stage.addEventListener("touchend", () => {
    if (velocity > 50) goTo(currentIndex - 1);
    else if (velocity < -50) goTo(currentIndex + 1);
    velocity = 0;
});

// Autoplay
let autoPlay = setInterval(() => {
    goTo(currentIndex + 1);
}, 4000);

// Pause on hover
stage.addEventListener("mouseenter", () => clearInterval(autoPlay));
stage.addEventListener("mouseleave", () => {
    autoPlay = setInterval(() => {
        goTo(currentIndex + 1);
    }, 4000);
});

// Pagination
for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.className = "xenor-dot";
    dot.onclick = () => goTo(i);
    pagination.appendChild(dot);
}

positionCards();





const interactivePanels = document.querySelectorAll(".fdp-interactive-panel");

const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("fdp-visible");
        }
    });
}, { threshold: 0.2 });

interactivePanels.forEach(panel => {
    visibilityObserver.observe(panel);

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    function smoothAnimation() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        panel.style.transform =
            `rotateX(${currentX}deg) rotateY(${currentY}deg)`;

        requestAnimationFrame(smoothAnimation);
    }
    smoothAnimation();

    panel.addEventListener("mousemove", e => {
        const bounds = panel.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        targetY = (x - centerX) / 18;
        targetX = -(y - centerY) / 18;
    });

    panel.addEventListener("mouseleave", () => {
        targetX = 0;
        targetY = 0;
    });

    const magneticButton = panel.querySelector(".fdp-magnetic-button");

    panel.addEventListener("mousemove", e => {
        const rect = magneticButton.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);

        magneticButton.style.transform =
            `translate(${dx * 0.15}px, ${dy * 0.15}px) translateZ(80px)`;
    });

    panel.addEventListener("mouseleave", () => {
        magneticButton.style.transform =
            "translate(0,0) translateZ(80px)";
    });
});

// Accessibility
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    interactivePanels.forEach(panel => {
        panel.style.transition = "none";
    });
}
