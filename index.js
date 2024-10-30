class City {
    constructor(coordX, coordY, type) {
        this.imageUrl;
        this.coordX = coordX;
        this.coordY = coordY;
        this.type = type;
        this.occupiedMatrix = [];
        this.uuid = generateUUID();

        switch (this.type) {
            case "purple":
                this.imageUrl = "purpleCity.webp";
                break;
            case "green":
                this.imageUrl = "greenCity.webp";
                break;
            case "yellow":
                this.imageUrl = "yellowCity.webp";
                break;
        }

        // Mátrix ami tartalmazza a pontokat
        for (let i = this.coordY; i < this.coordY + 100; i++) {
            for (let j = this.coordX; j < this.coordX + 100; j++) {
                this.occupiedMatrix.push([j, i]);
            }
        }

        switch (this.type) {
            case "purple":
                purpleCounter++;
                document.getElementById("purpleNumber").innerHTML = purpleCounter;
                break;
            case "green":
                greenCounter++;
                document.getElementById("greenNumber").innerHTML = greenCounter;
                break;
            case "yellow":
                yellowCounter++;
                document.getElementById("yellowNumber").innerHTML = yellowCounter;
                break;
        }

    }
}

class Workshop {
    constructor(coordX, coordY, type) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.type = type;
        this.occupiedMatrix = [];

        for (let i = this.coordY; i < this.coordY + 100; i++) {
            for (let j = this.coordX; j < this.coordX + 100; j++) {
                this.occupiedMatrix.push([j, i]);
            }
        }
    }
}

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

let workshops = new Array();

//place workshops
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = Math.round(event.clientX - rect.left);
    const mouseY = Math.round(event.clientY - rect.top);

    if (selectedWorkshop != null) {
        workshops.push(new Workshop(mouseX - 50, mouseY - 50, selectedWorkshop));
    }
    else {
        alert("Válassz műhely típust!");
    }

    function getCityMatrices() {
        let cityMatrices = [];
        cities.forEach(city => cityMatrices.push(city.occupiedMatrix));
        return cityMatrices;
    }

    function getWorkshopMatrices() {
        let workshopMatrices = [];
        workshops.forEach(workshop => workshopMatrices.push(workshop.occupiedMatrix));
        return workshopMatrices;
    }

    let cityMatrices = getCityMatrices();
    let workshopMatrices = getWorkshopMatrices();


    //helytelen lépés keresés
    let flag = true;
    for (let cityMatrix of cityMatrices) {
        for (let workshopMatrix of workshopMatrices) {
            if (matricesShareElement(cityMatrix, workshopMatrix)) {
                flag = false;
                break;
            }
        }
    }
    for (let workshop of workshops) {
        for (let currentWorkshop of workshops) {
            if ((matricesShareElement(workshop.occupiedMatrix, currentWorkshop.occupiedMatrix) && (workshop != currentWorkshop)) || ((mouseX < 50 || mouseX > 1230) || (mouseY < 50 || mouseY > 680))) {
                flag = false;
                break;
            }
        }
    }

    // 
    if (flag) drawWorkshop(mouseX, mouseY, workshops.slice(-1)[0].type);
    else {
        alert("Helytelen lépés");
        workshops.pop();
    }

    function matricesShareElement(matrix1, matrix2) {
        const citySet = new Set(matrix1.map(arr => arr.toString()));

        for (const arr of matrix2) {
            if (citySet.has(arr.toString())) {
                return true;
            }
        }
        return false;
    }

});


let frameStartTime = 0;
const frameDuration = 1000 / 60; // 60 FPS

let citiesDrawn = false;
let gameStarted = false;
function drawFrame(currentTime) {
    let deltaTime = currentTime - frameStartTime;

    if (deltaTime >= frameDuration) {
        frameStartTime = currentTime;

        // Clear canvas
        if (!gameStarted) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameStarted = true;
        }

        // Draw border
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        // Draw cities
        if (!citiesDrawn) {
            citiesDrawn = true;
            populateCities();
        }
    }

    requestAnimationFrame(drawFrame);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; // Generate random number
        const v = c === 'x' ? r : (r & 0x3 | 0x8); // Ensure UUID version and variant
        return v.toString(16); // Convert to hexadecimal
    });
}

function generateRandomPositions(minDistance, count) {
    const positions = [];
    const borderMargin = 110;

    function getRandomPosition() {
        return {
            x: Math.floor(Math.random() * (1280 - 2 * borderMargin)) + borderMargin,
            y: Math.floor(Math.random() * (720 - 2 * borderMargin)) + borderMargin
        };
    }

    function isFarEnough(newPos) {
        return positions.every(pos => {
            const dx = pos.x - newPos.x;
            const dy = pos.y - newPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance >= minDistance;
        });
    }

    while (positions.length < count) {
        const newPos = getRandomPosition();
        if (isFarEnough(newPos)) {
            positions.push(newPos);
        }
    }

    return positions;
}

let cities = new Array();
let colors = ["purple", "green", "yellow"];
let currentColor = null;
function populateCities() {
    generateRandomPositions(200, 6).forEach(pos => {
        currentColor = colors[Math.floor(Math.random() * (2 - 0 + 1)) + 0];
        cities.push(new City(pos.x, pos.y, currentColor));
    });

    cities.forEach(city => {
        drawCity(city);
    });
    showButtons();
}

function drawCity(city) {
    const width = 100;
    const height = 100;

    const image = new Image();
    image.src = city.imageUrl;

    image.onload = () => {
        ctx.drawImage(image, city.coordX, city.coordY, width, height);
    }
}

let purpleCounter = 0;
let greenCounter = 0;
let yellowCounter = 0;

let storedUuids = [];

function calculateDistances() {
    workshops.forEach(workshop => {
        currentDistance = 0;

        cities.forEach(city => {
            currentDistance = Math.sqrt((workshop.coordX - city.coordX) ** 2 + (workshop.coordY - city.coordY) ** 2);

            if (currentDistance <= 260 && city.type == workshop.type && !storedUuids.includes(city.uuid)) {
                switch (city.type) {
                    case "purple":
                        purpleCounter--;
                        storedUuids.push(city.uuid);
                        break;
                    case "green":
                        greenCounter--;
                        storedUuids.push(city.uuid);
                        break;
                    case "yellow":
                        yellowCounter--;
                        storedUuids.push(city.uuid);
                        break;
                }
            }
        });
    });

    document.getElementById("purpleNumber").innerHTML = purpleCounter;
    document.getElementById("greenNumber").innerHTML = greenCounter;
    document.getElementById("yellowNumber").innerHTML = yellowCounter;
}

let stepsTaken = 0;
let isWin = false;

function drawWorkshop(coordX, coordY, type) {
    if (isWin) {
        return;
    }

    const width = 100;
    const height = 100;

    const image = new Image();
    image.src = "workshop.webp";

    image.onload = () => {
        ctx.drawImage(image, coordX - width / 2, coordY - height / 2, width, height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        switch (type) {
            case "purple":
                ctx.strokeStyle = "rgba(255, 0, 255, 1)";
                ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
                break;
            case "green":
                ctx.strokeStyle = "rgba(0, 128, 0, 1)";
                ctx.fillStyle = "rgba(0, 128, 0, 0.3)";
                break;
            case "yellow":
                ctx.strokeStyle = "rgba(255, 255, 0, 1)";
                ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
                break;
        }
        ctx.arc(coordX, coordY, 220, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.closePath();

        calculateDistances();
        stepsTaken++;

        if (purpleCounter == 0 && greenCounter == 0 && yellowCounter == 0) {
            isWin = true;
            alert(`Győztél!\nLépések száma: ${stepsTaken}`)
        }
    }
}

let selectedWorkshop = null;
const purpleButton = document.getElementById("purple");
const greenButton = document.getElementById("green");
const yellowButton = document.getElementById("yellow");

function showButtons() {
    cities.map(city => {
        if (city.type == "purple") {
            purpleButton.style.display = "unset";
        }
        if (city.type == "green") {
            greenButton.style.display = "unset";
        }
        if (city.type == "yellow") {
            yellowButton.style.display = "unset";
        }
    });
}

function handleEventListeners() {
    purpleButton.addEventListener("click", () => {
        selectedWorkshop = "purple";
        document.getElementById("selectedColor").innerHTML = "Lila";
        document.getElementById("selectedColor").style.color = "purple";
        document.getElementById("selectedColor").style.webkitTextStroke = "1px black";
    });

    greenButton.addEventListener("click", () => {
        selectedWorkshop = "green";
        document.getElementById("selectedColor").innerHTML = "Zöld";
        document.getElementById("selectedColor").style.color = "green";
        document.getElementById("selectedColor").style.webkitTextStroke = "1px black";
    });

    yellowButton.addEventListener("click", () => {
        selectedWorkshop = "yellow";
        document.getElementById("selectedColor").innerHTML = "Sárga";
        document.getElementById("selectedColor").style.color = "yellow";
        document.getElementById("selectedColor").style.webkitTextStroke = "1px black";
    });

    document.getElementById("selectedColor").addEventListener("click", () => {
        calculateDistances();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    drawFrame(0);
    handleEventListeners();
});

let cursor = document.getElementsByClassName("cursor")[0];

canvas.addEventListener("mousemove", e => {
    cursor.style.top = `${e.y - 50}px`;
    cursor.style.left = `${e.x - 50}px`;
});