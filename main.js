const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const laneCountMain = 4
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount = laneCountMain);


// DISPLAY SETTINGS
//list all the current settings in the canvas with id=settingsCanvas. Show the following values from the local storage: Population size and the neural network mode.
function displaySettings() {
    const settingsCanvas = document.getElementById("settingsCanvas");
    const settingsCtx = settingsCanvas.getContext("2d");
    settingsCtx.font = "20px Arial";
    settingsCtx.fillStyle = "black";
    settingsCtx.fillText("Population size: " + localStorage.getItem("population"), 10, 30);
    settingsCtx.fillText("Neural network mode: " + localStorage.getItem("neuralNetworkMode")||"minimal", 10, 60);
    settingsCtx.fillText("Lane: " + localStorage.getItem("lane"), 10, 90);
}


displaySettings();

// CONTROL PANEL

//put controls on the right side over the networkCanvas
const controlCanvas = document.getElementById("controlCanvas");
controlCanvas.width = 500;
const controlCtx = controlCanvas.getContext("2d");
controlCtx.font = "14px Arial";
controlCtx.fillText("Press 's' to save the best car's brain", 10, 15);
controlCtx.fillText("Press 'd' to discard the saved brain", 10, 30);
controlCtx.fillText("Press 'r' to reload the simulation", 10, 45);
controlCtx.fillText("Press 'p' to toggle population", 10, 60);
controlCtx.fillText("Press 'n' to toggle the neural network mode", 10, 75);
controlCtx.fillText("Press 'l' to toggle lane to start", 10,    90);

// controlCtx.fillText("Press 'q' to toggle number of sensor rays", 10, 120);
// controlCtx.fillText("Press 'b' to pause the simulation", 10, 90);
// controlCtx.fillText("Press 't' to toggle traffic", 10, 60);
// controlCtx.fillText("Press 'q' to toggle number of sensor rays", 10, 150);

//if s is pressed save the best car's brain
document.addEventListener("keydown", e => {
    if (e.key == "s") {
        saveBrain();
    }
    if (e.key == "d") {
        deleteBrain();
    }
    if (e.key == "r") {
        location.reload();
    }
    // if (e.key == "t") {
    //     toggleTraffic();
    // }
    if (e.key == "p") {
        togglePopulation();
    }
    // if (e.key == "b") {
    //     togglePause();
    // }
    if (e.key == "n") {
        toggleNeuralNetworkMode();
    }
    if (e.key == "l") {
        toggleLane();
    }
    // if (e.key == "q") {
    //     toggleRays();
    // }

});


const cars = generateCars(localStorage.getItem("population") || 200);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(3), -1200, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(2), -1500, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(0), -1550, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
    new Car(road.getLaneCenter(1), -1700, 30, 50, "DUMMY", 2, carColor = getRandomColor()),
];

animate();

function saveBrain() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function deleteBrain() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        // cars.push(new Car(road.getLaneCenter(localStorage.getItem("lane")),100,30,50,"AI", maxSpeed=4, rayCount=localStorage.getItem("rays")));
        cars.push(x = new Car(road.getLaneCenter(localStorage.getItem("lane") || 1), y = 100, width = 30, height = 50, controlType = "AI", maxSpeed = 4, carColor = "blue"));

    }

    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));

    carCanvas.height = window.innerHeight * 0.90;
    networkCanvas.height = window.innerHeight * 0.90;
    //increase the dpi of the font
    
    // carCanvas.width = window.innerWidth * 0.20;
    // networkCanvas.width = window.innerWidth * 0.40;
    // settingsCanvas.width = window.innerWidth * 0.20;


    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}

//toggel the number (3, 6, 12) of rays per car and store it in local storage + reload the page + print in console
function toggleRays() {
    if (localStorage.getItem("rays") == 3) {
        localStorage.setItem("rays", 6);
        console.log("6 rays");
    } else if (localStorage.getItem("rays") == 6) {
        localStorage.setItem("rays", 12);
        console.log("12 rays");
    } else {
        localStorage.setItem("rays", 3);
        console.log("3 rays");
    }
    location.reload();
}


//toggle traffic 0, 10, 50 or 100 cars and store it in local storage
function toggleTraffic() {
    if (localStorage.getItem("traffic")) {
        if (localStorage.getItem("traffic") == 0) {
            localStorage.setItem("traffic", 10);
        } else if (localStorage.getItem("traffic") == 10) {
            localStorage.setItem("traffic", 50);
        } else if (localStorage.getItem("traffic") == 50) {
            localStorage.setItem("traffic", 100);
        } else if (localStorage.getItem("traffic") == 100) {
            localStorage.setItem("traffic", 0);
        }
    } else {
        localStorage.setItem("traffic", 10);
    }

    location.reload();
}

//toggle population 100, 200, 500 or 1000 cars and store it in local storage
function togglePopulation() {
    if (localStorage.getItem("population")) {
        if (localStorage.getItem("population") == 1) {
            localStorage.setItem("population", 100);
        }
        if (localStorage.getItem("population") == 100) {
            localStorage.setItem("population", 200);
        } else if (localStorage.getItem("population") == 200) {
            localStorage.setItem("population", 500);
        } else if (localStorage.getItem("population") == 500) {
            localStorage.setItem("population", 1000);
        } else if (localStorage.getItem("population") == 1000) {
            localStorage.setItem("population", 1);
        }
    } else {
        localStorage.setItem("population", 200);
    }

    location.reload();
}


//toggle the 3 neural network modes and store it in local storage the values are minimal, normal, maximal. Everytime switched deleted the brain and reload the page
function toggleNeuralNetworkMode() {
    if (localStorage.getItem("neuralNetworkMode")) {
        if (localStorage.getItem("neuralNetworkMode") == "minimal") {
            localStorage.setItem("neuralNetworkMode", "normal");
        } else if (localStorage.getItem("neuralNetworkMode") == "normal") {
            localStorage.setItem("neuralNetworkMode", "maximal");
        } else if (localStorage.getItem("neuralNetworkMode") == "maximal") {
            localStorage.setItem("neuralNetworkMode", "minimal");
        }
    } else {
        localStorage.setItem("neuralNetworkMode", "minimal");
    }
    deleteBrain();
    location.reload();
    //print the current neural network mode in console
    console.log(localStorage.getItem("neuralNetworkMode"));
}


//toggle lane 1, 2, 3, 4 or 5 lanes and store it in local storage
function toggleLane() {
    if (localStorage.getItem("lane")) {
        if (localStorage.getItem("lane") == 0) {
            localStorage.setItem("lane", 1);
        } else if (localStorage.getItem("lane") == 1) {
            localStorage.setItem("lane", 2);
        } else if (localStorage.getItem("lane") == 2) {
            localStorage.setItem("lane", 3);
        } else if (localStorage.getItem("lane") == 3) {
            localStorage.setItem("lane", 0);
        }
    } else {
        localStorage.setItem("lane", 2);
    }

    location.reload();
}

//toggle pause
function togglePause() {
    if (localStorage.getItem("pause")) {
        if (localStorage.getItem("pause") == "true") {
            localStorage.setItem("pause", "false");
        } else {
            localStorage.setItem("pause", "true");
        }
    } else {
        localStorage.setItem("pause", "true");
    }
}

//save the best car's brain to local storage
function saveBrain() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function deleteBrain() {
    localStorage.removeItem("bestBrain");
}

