const axios = require('axios');
const dotenv = require("dotenv");
const https = require('https');

const sapAxios = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000 // Timeout de 10 segundos
});

const getSessionSAP = async(req, res) => {
    const getServerInfo = {
        CompanyDB: process.env.SAP_COMPANYDB, 
        UserName: process.env.SAP_USERNAME, 
        Password: process.env.SAP_PASSWORD
    }

    const SAP_SESSION = await sapAxios.post(`${process.env.SAP_ENDPOINT}/Login`, getServerInfo, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return res.send(SAP_SESSION.data.SessionId)
}

module.exports = {
    getSessionSAP,
}
