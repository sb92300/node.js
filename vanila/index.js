const daysOfWeek = ["Mon", "The", "Wed", "Thu", "Fri", "Sat", "Sun"];
const myInfo = {
    name : "Kim Seung Bin", 
    age : '28', city : 'Seoul', 
    contury : 'Korea',
    favorite : ['basketball', 'listening music', 'watching movie', 'coding']
    };
const game = [
    {
        openworld : 'RDR2'
    },
    {
        fps : 'COD WW2'
    },
    {
        aos : 'LOL'
    },
    {
        rpg : 'elencia'
    }
]

    myInfo.contury = 'USA';
console.log(daysOfWeek);
console.log(myInfo);
console.log(myInfo.favorite[2]);
console.log(game);
console.log(game[2])


function hello() {
    const value = document.getElementById('test').value;
    document.getElementById('test2').innerText = value;
}

function sayHello(name, age) {
    return `hello my name is ${name} and i am ${age} years old.`;
}

const greetKim = sayHello("kim", 28);

console.log(greetKim);

const calculator = {
    plus : function(a, b){
        return a+b;
    },
    minus : function(a, b) {
        return a-b;
    },
    multiply : function(a, b) {
        return a*b;
    },
    division : function(a, b) {
        return a/b;
    }
}

const plus = calculator.plus(5, 5);
const minus = calculator.minus(10, 3);
const multiply = calculator.multiply(5, 7);
const division = calculator.division(9, 3);
console.log(plus);
console.log(minus);
console.log(multiply);
console.log(division);

document.getElementById('title').innerHTML = `it's the power of JS!`
console.dir(document); 
document.title = 'i own you now';
const title = document.querySelector('#title');
console.log(title);
title.style.color = "red";