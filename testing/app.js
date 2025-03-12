const express = require("express");
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();

const {SerialPort} = require('serialport')

// Ver puertos seriales activos
SerialPort.list()
.then((data) => console.log(data))
.catch(err => console.log(err));


//lectura de puerto

let currentData = 0;
app.get('/peso', function (req, res) {
    res.send({
        peso: String(currentData),
    });
});

const port = new SerialPort({path: 'COM1', baudRate: 1200}, function (err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r' }))
parser.on('data', data => currentData = data);

app.listen(3000, () => {
  console.log(`Server ejecutandose en el puerto 3000`);
});