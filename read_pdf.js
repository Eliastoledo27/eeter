const fs = require('fs');
const pdf = require('pdf-parse');

async function read() {
    let dataBuffer = fs.readFileSync('C:\\Users\\Admin\\Desktop\\Pegada Solo\\eter-store\\C_mo_sumar_Nave_a_tu_Billowshop.pdf');
    try {
        const data = await pdf(dataBuffer);
        console.log(data.text);
    } catch (e) {
        console.error(e);
    }
}

read().catch(console.error);
