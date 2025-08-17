const boxen = require("boxen");

function createBoxes(title,message){
    const classicBox = boxen(`${title}\n ${message}`,{
        padding: 1,
        margin: 1,
        borderStyle: "classic",
        borderColor:"green"
    });

    const singleDoubleBox = boxen(`${title}\n ${message}`,{
        padding:1,
        margin:1,
        borderStyle:"singleDouble",
        borderColor:"cyan"
    });

    const roundbox = boxen(`${title}\n ${message}`,{
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "magenta"
    });
    return{classicBox,singleDoubleBox,roundbox}
}

module.exports = createBoxes;