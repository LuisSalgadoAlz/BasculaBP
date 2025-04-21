const { exec } = require("child_process");

const imprimirEpson = (async = (req, res) => {
  exec(
    'powershell "Get-Printer | Where-Object Shared -eq $true | Select-Object ShareName"',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log("Impresoras compartidas en red:\n", stdout);
    }
  );
});

module.exports = imprimirEpson;
