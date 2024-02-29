const { rejects } = require('assert');
const { AsyncLocalStorage } = require('async_hooks');
const { resolve } = require('path');
const { constrainedMemory } = require('process');
const readline = require('readline');
const { workerData } = require('worker_threads');
const rl = readline.createInterface(
    process.stdin,
    process.stdout
);

/* -----    DECLERATIONS    ----- */

let currentRoom = "roomBottomRight";
let currentCommand = null
let input = null
let storeCommand = null
let storeRoom = null
let visitAllRooms = 0
let comMove = ["move", "walk", "run", "enter"];
let comLook = ["look", "see", "view", "explore"];
let comGrab = ["grab", "take", "acquire"];
let comDrop = ["drop", "leave", "release"];
// let cR = world[currentRoom];
let vBR = 1;
let vBL = 1;
let vTR = 1;
let vTL = 1;

/* -----    OBJECTS    ----- */

let player = {
    inventory: []
};

/* -----    ROOMS    ----- */

let world = ["roomBottomRight", "roomTopRight", "roomBottomLeft", "roomTopLeft"];

let roomBottomRight = {
    inventory: ["key"],
    connectedAreas: ["roomBottomLeft", "roomTopRight"]
};

let roomTopRight = {
    inventory: ["key"],
    connectedAreas: ["roomBottomRight", "roomTopLeft"]
};

let roomBottomLeft = {
    inventory: ["key"],
    connectedAreas: ["roomBottomRight", "roomTopLeft"]
};

let roomTopLeft = {
    inventory: ["key"],
    connectedAreas: ["roomBottomLeft", "roomTopRight"]
};

/* -----    FUNCTIONS    ----- */

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
};

function checkInput(inputEntered) {
    let inputSplit = inputEntered.split(" ");
    let isNull = false;

    for (word of inputSplit) {
        if (comGrab.includes(word)) {
            storeCommand = "grab";
        } else if (comLook.includes(word)) {
            storeCommand = "look";
        } else if (comMove.includes(word)) {
            storeCommand = "move";
        } else if (comDrop.includes(word)) {
            storeCommand = "drop";
        } else if (cR.includes(word)) {
            storeRoom = word;
        };
        console.log(`\nstoreCommand: ${storeCommand}`); // DEBUG
        console.log(`storeRoom: ${storeRoom}\n`); // DEBUG
    };

    if (storeCommand === null || storeRoom === null) {
        console.log("\nI don't understand that command.\n");
        isNull = true;
    };

    if (isNull === false) {
        if (world.includes(storeRoom)) {
            changeRoom(storeRoom);
        } else {
            enactCommand(storeCommand);
        };
    };

    storeCommand = null;
    storeRoom = null;
};

function changeRoom(newRoom) {
    let options = rooms[currentRoom];
    if(options.includes(newRoom)) {
        currentRoom = newRoom;
        console.log(`You are now in ${currentRoom}.`)
    } else {
            console.log(`\nInvalid room change attempted from ${currentRoom} to ${newRoom}.\n`);
    };
};

function enactCommand(newCommand) {
    if (comLook.includes(newCommand)) {
        if (currentRoom)
        console.log(`\nYou see that you are in ${currentRoom}. You see a key on the ground.\n`)
    } else if (comGrab.includes(newCommand)) {
        console.log(`\nYou pick up ${currentRoom}'s key.\n`)
    };
};

/* -----    GAME    ----- */

async function run() {
    let test = "roomBottomRight"; // DEBUG
    console.log(test["inventory"]); // DEBUG
    do {
        input = await ask(`You are in ${currentRoom}--where would you like to go? > `)
        checkInput(input);

        if (vBR == 1 && currentRoom == "roomBottomRight") {
            vBR -= 1;
            visitAllRooms += 1;

            console.log(vBR) // DEBUG
            console.log(visitAllRooms) // DEBUG

        } else if (vBL == 1 && currentRoom == "roomBottomLeft") {
            vBL -= 1;
            visitAllRooms += 1;

            console.log(vBL) // DEBUG
            console.log(visitAllRooms) // DEBUG

        } else if (vTR == 1 && currentRoom == "roomTopRight") {
            vTR -= 1;
            visitAllRooms += 1;

            console.log(vTR) // DEBUG
            console.log(visitAllRooms) // DEBUG

        } else if (vTL == 1 && currentRoom == "roomTopLeft") {
            vTL -= 1;
            visitAllRooms += 1;

            console.log(vTL) // DEBUG
            console.log(visitAllRooms) // DEBUG

        }
    } while (visitAllRooms < 4)

    console.log("All keys have been collected. You were teleported out.")

    process.exit();
}

run();