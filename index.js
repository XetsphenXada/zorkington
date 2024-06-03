// const { rejects } = require('assert');
// const { AsyncLocalStorage } = require('async_hooks');
// const { count } = require('console');
// const { resolve } = require('path');
// const { constrainedMemory } = require('process');
const readline = require('readline');
// const { workerData } = require('worker_threads');
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

        console.log(`\nHey! I'm currently stuck in this dataspace and need you to help me navigate my way out.\nYou can use these commands to help me through:\nMove - Tell me which area to head to next\nLook - I'll tell you what I see around the area\nGrab - I can pick up an object you specify\nDrop - I can drop something if you think we won't need it\nIf you mention inventory in anyway, I'll let you know what I'm currently carrying.\nAnd remember--how you type things in is important for how I'll understand it! I am just a program, after all.\nSo currently it looks like we're in area ${this.currentArea.name}.`);
    }
};

class Controller {
    constructor(commands) {
        this.commands = commands;
        this.inventory = [];
    }

    /* Moves character through world to specified area */
    move(destination) {
        if (destination === null || destination === undefined || !destination) {
            destination = "null";
        }

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

    /* Gives description area and objects within */
    look(viewThing) {
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

    /* Adds specified item to inventory and removes from room */
    grab(areaItem) {
        if (areaItem === null || areaItem === undefined || !areaItem) {
            areaItem = "null";
        }

        let index = 0;
        let acquiredItem

        if (dataspace.currentArea.inventory.includes(areaItem)) {
            for (let item of dataspace.currentArea.inventory) {
                if (item === areaItem) {
                    if (index === 0) {
                        acquiredItem = String(dataspace.currentArea.inventory.splice(index, index + 1));
                    } else {
                        acquiredItem = String(dataspace.currentArea.inventory.splice(index, index));
                    }
                    this.inventory.push(acquiredItem);
                    console.log(`\nOkay, I grabbed the ${acquiredItem}!`);
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

        return inputOutput;
    }

    /* Removes specified item from inventory and adds to room */
    drop(inventoryItem) {
        if (inventoryItem === null || inventoryItem === undefined || !inventoryItem) {
            inventoryItem = "null";
        }

        let index = 0;
        let droppedItem

        if (this.inventory.includes(inventoryItem)) {
            for (let item of this.inventory) {
                if (item === inventoryItem) {
                    if (index === 0) {
                        droppedItem = this.inventory.splice(index, index + 1);
                    } else {
                        droppedItem = this.inventory.splice(index, index);
                    }
                    dataspace.currentArea.inventory.push(droppedItem);
                    console.log(`\nDropping the ${droppedItem}!`);
                    visitAllRooms -= 1; // DEBUG
                    inputOutput = "";
                    break
                } else {
                    index += 1;
                }
            }

            inputOutput = "";
        } else if (inventoryItem === "null") {
            inputOutput = "badGrab";
        } else {
            console.log(`\nI'm not holding on to a ${inventoryItem}.`)
            inputOutput = "";
        }

        return inputOutput;
    }

    /* Checks items in inventory */
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

/* Create game world and locations within */
let dataspace = new World({
    A1: new Location(`A1`, [`A2`, `B1`], ["keyFrag"]),
    A2: new Location(`A2`, [`A1`, `B2`], ["keyFrag", "bugData"]),
    B1: new Location(`B1`, [`A1`, `B2`], ["keyFrag", "junkFile", "bugData"]),
    B2: new Location(`B2`, [`A2`, `B1`], ["keyFrag", "bugData"])
}, `A1`);

/* Player Controller for naviating world */
let player = new Controller(["move", "look", "grab", "drop", "inventory"]);

/* Used variables */
let inputOutput = "";
let storedCommand = null;
let storedObject = null;
let visitAllRooms = 0;


/* -----    FUNCTIONS   ----- */

/* Allows user to input commands */
function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

/* Checks user input for legal commands */
function checkInput(inputEntered) {
    let inputSplit = inputEntered.split(" ");

    /* Searches user's input for keywords to determine which functions to execute */
    for (word of inputSplit) {
        if (player.commands.includes(word.toLowerCase())) {
            storedCommand = word.toLowerCase();
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
    }

    /* Null variable catch */
    if (storedObject === null) {
        storedObject = "null";
    }

    /* Checks for specific commands to be executed */
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

/* Shows area's description and items within if any */
function showDescription(view) {
    let descriptionResponse = `\nI'm currently in ${view}. `
    let indexInventory = -1
    let indexAreas = -1
    let counter = 0

    for (link of dataspace.currentArea.linkedAreas) {
        indexAreas += 1;
    }

    /* Lists connected rooms */
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

    /* If room has items, also lists current inventory */
    if (dataspace.currentArea.inventory.length !== 0) {
        descriptionResponse += ` I also see `
        for (item of dataspace.currentArea.inventory) {
            indexInventory += 1;
        }

        descriptionResponse += `a ${dataspace.currentArea.inventory[counter]}`;
        counter += 1;

        if (indexInventory > 0) {
            if (counter < indexInventory) {
                do {
                    descriptionResponse += `, a ${dataspace.currentArea.inventory[counter]}`
                    counter += 1;
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

    console.log(`\nWoah! It looks like the keyFrags are responding!\nI see... It make some kind of keyData! I'm gonna use that to exit! Thanks for all your help!\n`)

    process.exit();
}


/* -----    RUN    ----- */

run();