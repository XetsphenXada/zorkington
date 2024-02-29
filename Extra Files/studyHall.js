let produce = new Room({
    name: "produce",
    description:
    "You are currently in the produce department. From here you can move to the baking"
    inventory: [
        {
            item: "greens",
            message: "greens were added to your cart",
        },
        {
            item: "onions",
            message: "carrots were added to your cart",
        },
    ]
});

let shooper = new Player({
    currentInventory: [],
    shoppingList: ["greens", "onions", "chicken", "baking soda", "milk", "flour"],
});

let state = {
    "produce department": produce,
    "meat department": meat,
    "dairy department": dairy,
    "baking aisle": baking,
}

let answer = console.log(

)