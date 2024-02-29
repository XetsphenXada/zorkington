const { rejects } = require('assert');
const { AsyncLocalStorage } = require('async_hooks');
const { count } = require('console');
const { resolve } = require('path');
const { constrainedMemory } = require('process');
const readline = require('readline');
const { workerData } = require('worker_threads');
const rl = readline.createInterface(
    process.stdin,
    process.stdout
);

/* -----    CLASSES    ----- */

class Location {
    constructor (name, linkedAreas, inventory) {
        this.name = name;
        this.linkedAreas = linkedAreas;
        this.inventory = inventory;
    }
};

class World {
    constructor(areas, originPoint) {
        this.areas = areas;
        this.currentArea = this.areas[originPoint];

        console.log(`\nYou are currently in ${this.currentArea.name}.`);
    }
};

class Controller {
    constructor(commands) {
        this.commands = commands;
        this.inventory = [];
    }

    move(destination) {
        if (destination === null || destination === undefined || !destination) {
            destination = "null";
        }

        // console.log(`Destination: ${destination}`) // DEBUG
        // console.log(`Contains Destination: ${dataspace.currentArea.linkedAreas.includes(destination) === false}`) // DEBUG

        if (dataspace.currentArea.linkedAreas.includes(destination)) {
            dataspace.currentArea = dataspace.areas[destination];
            console.log(`\nAlright! I just arrived at ${dataspace.areas[destination].name}.`);
            inputOutput = "";
        } else if (destination === "null") {
            inputOutput = "badMove";
        } else if (dataspace.currentArea.linkedAreas.includes(destination) === false) {
            console.log(`\nThere is no "${destination}"--give me a real location.`)
            inputOutput = "";
        } else {
            console.log(`\nI can't just to go from ${dataspace.currentArea.name} to ${dataspace.areas[destination].name}.`);
            inputOutput = "";
        }
        return inputOutput;
    }

    look(viewThing) {
        // console.log(`\nareaView: ${areaView}`) // DEBUG
        // console.log(`Equals Name: ${areaView === dataspace.currentArea.name}`) // DEBUG
        // console.log(`Equals Area: ${areaView.toLowerCase() === "area"}\n`) // DEBUG
        if (viewThing === null || viewThing === undefined || !viewThing) {
            viewThing = "null";
        }

        if (viewThing === dataspace.currentArea.name || viewThing.toLowerCase() === "area") {
            showDescription(dataspace.currentArea.name);
            inputOutput = "";
        } else if (viewThing === "null") {
            inputOutput = "badLook";
        } else {
            console.log(`\nI don't see that... Where are you looking?`);
            inputOutput = "";
        }
        return inputOutput;
    }

    grab(areaItem) {
        if (areaItem === null || areaItem === undefined || !areaItem) {
            areaItem = "null";
        }

        let index = 0;
        // console.log(`areaItem: ${areaItem}`) // DEBUG
        if (dataspace.currentArea.inventory.includes(areaItem)) {
            for (let item of dataspace.currentArea.inventory) {
                // console.log(`Item: ${item}`) // DEBUG
                // console.log(`Equal: ${item === areaItem}`) // DEBUG
                if (item === areaItem) {
                    // console.log(`${dataspace.currentArea.name}'s Inventory: ${dataspace.currentArea.inventory}`) // DEBUG
                    let acquiredItem = String(dataspace.currentArea.inventory.splice(index, index + 1));
                    // console.log(`Remove's Value: ${remove}`)
                    // console.log(`Player's Inventory: ${player.inventory}`) // DEBUG
                    this.inventory.push(acquiredItem);
                    console.log(`\nOkay, I grabbed the ${acquiredItem}!`);
                    console.log(`${typeof acquiredItem}`)
                    visitAllRooms += 1; // DEBUG
                    inputOutput = "";
                    break
                } else {
                    index += 1;
                }
            }
            inputOutput = "";
        } else if (areaItem === "null") {
            inputOutput = "badGrab";
        } else {
            console.log(`\nWhere do you see a ${areaItem} around here?`)
            inputOutput = "";
        }
        // console.log(index) // DEBUG
        return inputOutput;
    }

    drop(inventoryItem) {
        if (inventoryItem === null || inventoryItem === undefined || !inventoryItem) {
            inventoryItem = "null";
        }

        let index = 0;
        // console.log(`inventoryItem: ${inventoryItem}`) // DEBUG
        // console.log(`In Inventory: ${this.inventory.includes(inventoryItem)}`) // DEBUG
        if (this.inventory.includes(inventoryItem)) {
            for (let item of this.inventory) {
                // console.log(`Item: ${item}`) // DEBUG
                // console.log(`Equal: ${item === inventoryItem}`) // DEBUG
                if (item === inventoryItem) {
                    // console.log(`${dataspace.currentArea.name}'s Inventory: ${dataspace.currentArea.inventory}`) // DEBUG
                    let droppedItem = this.inventory.splice(index, index + 1);
                    console.log(`droppedItem's Value: ${droppedItem}`)
                    // console.log(`${dataspace.currentArea.name}'s Inventory: ${dataspace.currentArea.inventory}`) // DEBUG
                    dataspace.currentArea.inventory.push(droppedItem);
                    console.log(`\nDropping the ${droppedItem}!`);
                    visitAllRooms -= 1; // DEBUG
                    inputOutput = "";
                    break
                } else {
                    index -= 1;
                }
            }
            inputOutput = "";
        } else if (inventoryItem === "null") {
            inputOutput = "badGrab";
        } else {
            console.log(`\nI'm not holding on to a ${inventoryItem}.`)
            inputOutput = "";
        }
        // console.log(index) // DEBUG
        return inputOutput;
    }

    checkInventory() {
        if (this.inventory.length !== 0) {
            console.log(`\nOk. Here's what I have:\n${this.inventory}`);
        } else {
            console.log(`\nI'm not holding on to anything right now!`)
        }
        inputOutput = "";
        return inputOutput;
    }
}


/* -----    DECLERATIONS   ----- */

let dataspace = new World({
    A1: new Location(`A1`, [`A2`, `B1`], ["key"]),
    A2: new Location(`A2`, [`A1`, `B2`], ["key"]),
    B1: new Location(`B1`, [`A1`, `B2`], ["key"]),
    B2: new Location(`B2`, [`A2`, `B1`], ["key"])
}, `A1`);

let player = new Controller(["move", "look", "grab", "drop", "inventory"]);

let inputOutput = "";
let storedCommand = null;
let storedObject = null;
let visitAllRooms = 0;


/* -----    FUNCTIONS   ----- */

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

function checkInput(inputEntered) {
    // console.log(`inputEntered: ${inputEntered}`) // DEBUG
    let inputSplit = inputEntered.split(" ");
    // console.log(`inputSplit: ${inputSplit}`) // DEBUG
    // console.log(`Player Inventory: ${player.inventory}, \n${player.inventory[0]}, \n${typeof player.inventory}`) // DEBUG
    for (word of inputSplit) {
        // console.log(`\nWord: ${word}`) // DEBUG
        // console.log(`In Inventory: ${player.inventory.includes(word)}`) // DEBUG
        if (player.commands.includes(word.toLowerCase())) {
            storedCommand = word.toLowerCase();
            // console.log(`storedCommand: ${storedCommand}`) // DEBUG
        } else if (dataspace.currentArea.inventory.includes(word)) {
            storedObject = word;
            console.log
        } else if (player.inventory.includes(word)) {
            storedObject = word;
        } else {
            for (let location in dataspace.areas) {
                if (dataspace.areas[location].linkedAreas.includes(word)) {
                    storedObject = word;
                }
            }
        }
        console.log(`storedObject: ${storedObject}`) // DEBUG

        // console.log(`In Linked Areas: ${dataspace.currentArea.linkedAreas.includes(word)}`) // DEBUG
        // if (dataspace.currentArea.linkedAreas.includes(word)) {
        //     storedObject = word;
        //     console.log(`storedObject: ${storedObject}`) // DEBUG
        // }

        // if (word.toLowerCase() === "inventory") {
        //     storedObject = "inventory";
        // }
        // console.log(`storedObject: ${storedObject}\n`) // DEBUG
    }

    // if (storedObject === "inventory") {
    //     noneNull = false;
    // } else if (storedCommand === null) {
    //     noneNull = false;
    // } else if (storedObject === null) {
    //     noneNull = false;
    // }

    // console.log(`storedCommand: ${storedCommand}`) // DEBUG
    // console.log(`storedObject: ${storedObject}\n`) // DEBUG
        if (storedObject === null) {
            storedObject = "null";
        }

    // console.log(`stored Object Equals Inventory: ${storedObject === "inventory"}`) // DEBUG

        if (storedCommand === "move") {
            player.move(storedObject);
        } else if (storedCommand === "look") {
            player.look(storedObject);
        } else if (storedCommand === "grab") {
            player.grab(storedObject);
        } else if (storedCommand === "drop") {
            player.drop(storedObject);
        } else if (storedCommand === "inventory") {
            player.checkInventory();
        } else {
            console.log(`\nI don't understand that command.`)
        }
    
    storedCommand = null;
    storedObject = null;
    return inputOutput;
}

function showDescription(view) {
    let descriptionResponse = `\nI'm currently in ${view}. `
    let indexInventory = -1
    let indexAreas = -1
    let counter = 0

    for (link of dataspace.currentArea.linkedAreas) {
        indexAreas += 1;
    }

    if (indexAreas > 0) {
        descriptionResponse += `The linked areas are ${dataspace.currentArea.linkedAreas[counter]}`
        counter += 1;
        if (counter < indexAreas) {
            do {
            descriptionResponse += `, ${dataspace.currentArea.linkedAreas[counter]}`;
            counter += 1;
            } while (counter < indexAreas)
        }
        descriptionResponse += ` and ${dataspace.currentArea.linkedAreas[counter]}.`
    } else {
        descriptionResponse += `The only linked area is ${dataspace.currentArea.linkedAreas[counter]}.`
    }

    counter = 0;

    // console.log(`${dataspace.currentArea.name}'s Inventory: ${dataspace.currentArea.inventory}`) // DEBUG
    if (dataspace.currentArea.inventory.length !== 0) {
        descriptionResponse += ` I also see `
        for (item of dataspace.currentArea.inventory) {
            // console.log(`Item: ${item}`) // DEBUG
            indexInventory += 1;
            // console.log(`Index: ${indexInventory}`) // DEBUG
        }

        descriptionResponse += `a ${dataspace.currentArea.inventory[counter]}`;
        counter += 1;

        // console.log(`\nIndex Greater Than 0: ${indexInventory > 0}`) // DEBUG
        if (indexInventory > 0) {
            // console.log(`\nCounter: ${counter}`) // DEBUG
            // console.log(`Index: ${indexInventory}`) // DEBUG
            // console.log(`Counter Less Than Index: ${counter < indexInventory}`) // DEBUG
            if (counter < indexInventory) {
                do {
                    descriptionResponse += `, a ${dataspace.currentArea.inventory[counter]}`
                    counter += 1;
                    // console.log(`\nCounter: ${counter}`) // DEBUG
                    // console.log(`Index: ${indexInventory}`) // DEBUG
                    // console.log(`Less Than Index: ${counter < indexInventory}`) // DEBUG
                } while (counter < indexInventory);
            }
                descriptionResponse += ` and a ${dataspace.currentArea.inventory[counter]}.`;
        } else {
            descriptionResponse += `.`
        }
    }

    console.log(descriptionResponse);
}

/* -----    GAME    ----- */

async function run() {
    do {
        input = await ask(`\nWhat would you like me to do?_> `)
        inputOutput = checkInput(input);
        if (inputOutput === "badMove") {
            do {
                inputOutput = await ask(`\nMove where?_> `)
                player.move(inputOutput);
            } while (inputOutput !== "")
        } else if (inputOutput === "badLook") {
            do {
                inputOutput = await ask(`\nLook at what?_> `)
                player.look(inputOutput);
            } while (inputOutput !== "") 
        } else if (inputOutput === "badGrab") {
            do {
                inputOutput = await ask(`\nGrab what?_> `)
                player.grab(inputOutput);
            } while (inputOutput !== "")
        } else if (inputOutput === "badDrop") {
            do {
                inputOutput = await ask(`\nDrop what?_> `)
                player.drop(inputOutput);
            } while (inputOutput !== "")
        }
        inputOutput = ""
    } while (visitAllRooms < 4)

    console.log("\nI got all of the keys! I'm logging out!\n")

    process.exit();
}


/* -----    RUN    ----- */

run();