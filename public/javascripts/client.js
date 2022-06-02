var lobby = "";
var formData;
var socket = io();//"ws://dice-house.herokuapp.com"

window.addEventListener('load',onLoad);

socket.on('connectToRoom',function(data){
    setStatus(data);
    lobby = data;
});
socket.on('otherRoll',function(diceSet){
    console.log("remote roll");
    showDice(diceSet);
})
socket.on('otherForm',function(diceSet){
    console.log("remote form update");
    updateForm(diceSet);
})
function onLoad()
{
    formData = getFormDataFromField();
    //todo ask for form update.
}
function join()
{
    let roomName = inputName();
    console.log("client wants to join "+roomName);
    socket.emit("joinRoom",roomName);
}

function setStatus(status)
{
    document.getElementById("status").innerText = status;
}
function inputName()
{
    let room = document.getElementById("roomNameInput").value;
    //if we use the URL and the time in seconds, in the salt, people can copy the code and it won't break
    //"blooperDiceHouse_"
    return room;
}
function updateForm(otherFormData)
{
    formData = otherFormData;
    if(lobby != otherFormData.room)
    {
        console.log("wonky lobby hiccup?");
    }
    //todo: Check for difference then flash animation

    document.getElementById("numDiceInput").value = otherFormData['numDice'];
    document.getElementById("diceSidesSelectInput").value = otherFormData['sides'];

}
function diceNumberChange()
{
    let number = document.getElementById("numDiceInput").value;
    if(formData['numDice'] != number)
    {
        formData['numDice'] = number;
        sendFormUpdate();
    }
}
function diceSidesChange()
{
    let sides = document.getElementById("diceSidesSelectInput").value;
    if(formData['sides'] != sides)
    {
        formData['sides'] = sides;
        sendFormUpdate();
    }
}
function getFormDataFromField()
{
    let form = {}
    form['room'] = lobby;
    let sides= document.querySelector("#diceSidesSelectInput");
    let dice = document.getElementById("numDiceInput").value;

    form['sides'] = sides.value;
    form['numDice'] = dice;

    return form;
}
function sendFormUpdate()
{
    formData.room = lobby;//force lobby update lazily.
    socket.emit("updateForm",formData);
}
//Dice Things
function roll()
{
    console.log("local roll");
    let numDice = document.getElementById("numDiceInput");
    let sides = document.querySelector("#diceSidesSelectInput");

    diceSet = rollNewDiceSet(numDice.value,sides.value);

    socket.emit("roll",diceSet);

    showDice(diceSet);
}
function rollNewDiceSet(numDice,sides)
{
    let diceSet = {};
    diceSet['room'] = lobby;
    diceSet['dice'] = [];
    diceSet['total'] = 0;
    for(let i = 0;i<numDice;i++)
    {
        let dice = {};
        dice.sides = sides;
        dice.val =  Math.floor( Math.random() * sides )+1;
        diceSet['total']+=dice.val;
        diceSet.dice.push(dice)
    }

    return diceSet;
}
function showDice(diceSet)
{
    let container = document.getElementById("diceContainer");
    container.innerHTML = "";
    diceSet.dice.forEach(item => {
        drawDice(item);
    });
    document.getElementById("diceTotal").innerText=diceSet['total'];

}
function drawDice(dice)
{
    let container = document.getElementById("diceContainer");
    container.innerHTML += "<div class=\"dice button\"><h3>"+dice.val+"</h3><p class='outOfText'>/"+dice.sides+"</p></div>";
}
function copyIDToClipboard()
{
    navigator.clipboard.writeText(lobby);
    //Todo: Feedback that is has been copied.
}