class City {
    constructor(coordX, coordY, type) {
        this.imageUrl;
        this.coordX = coordX;
        this.coordY = coordY;
        this.type = type;
        this.occupiedMatrix = [];

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

    workshops.push(new Workshop(mouseX - 50, mouseY - 50, selectedWorkshop));

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
        if (matricesShareElement(cityMatrix, currentWorkshop.occupiedMatrix)) {
            flag = false;
            break;  
        }
    }
    for (let workshop of workshops) {
        for (let currentWorkshop of workshops) {
            if (matricesShareElement(workshop.occupiedMatrix, currentWorkshop.occupiedMatrix) && (workshop != currentWorkshop) || ((mouseX < 55 || mouseX > 1225) || (mouseY < 55 || mouseY > 665))) {
                flag = false;
                console.log(matricesShareElement(workshop.occupiedMatrix, currentWorkshop.occupiedMatrix));
                console.log(mouseX + ' , ' + mouseY);
                break;  
            }
        }
    }

    if (selectedWorkshop == null) {
        alert("Válassz egy műhelytípust!");
        workshops.pop();
    }
    else if(flag) drawWorkshop(currentWorkshop);
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

        if (!citiesDrawn) {
            citiesDrawn = true;
            populateCities();
        }
    }

    requestAnimationFrame(drawFrame);
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

function drawWorkshop(workshop) {
    const width = 100;
    const height = 100;

    const image = new Image();
    image.src = "workshop.webp";

    image.onload = () => {
        ctx.drawImage(image, workshop.coordX - width / 2, workshop.coordY - height / 2, width, height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        switch (workshop.type) {
            case "purple":
                ctx.strokeStyle = "purple";
                ctx.fillStyle = "rgba(128, 0, 128, 0.3)";
                break;
            case "green":
                ctx.strokeStyle = "green";
                ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
                break;

            case "yellow": 
                ctx.strokeStyle = "yellow";
                ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
                break;
        }
        ctx.arc(workshop.coordX, workshop.coordY, 130, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.closePath();
    }
    console.log(workshops);
    
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
    });

    greenButton.addEventListener("click", () => {
        selectedWorkshop = "green";
    });

    yellowButton.addEventListener("click", () => {
        selectedWorkshop = "yellow";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    drawFrame(0); // Start the animation
    handleEventListeners();
});

let cursor = document.getElementsByClassName("cursor")[0]; 

canvas.addEventListener("mousemove", e => {
    cursor.style.top = `${e.y - 50}px`;
    cursor.style.left = `${e.x - 50}px`;
})