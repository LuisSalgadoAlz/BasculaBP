const axios = require('axios');
const dotenv = require("dotenv");
const https = require('https');
const { getRedisClient, closeRedisClient } = require('../lib/redisClient');

const getHeadersPost = (SessionID) => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': `B1SESSION=${SessionID}`
    }
}

const sapAxios = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000 // Timeout de 10 segundos
});

const getSessionSAP = async() => {
    try{
        const store = await getRedisClient()
        const sessionID = await store.get('sap:sessionID');

        console.log(sessionID)

        if(sessionID) {
            console.log('Aqui con redis')
            await store.set('sap:sessionID', sessionID);
            await store.expire('sap:sessionID', 1800);
            return sessionID;
        }

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

        console.log('Aqui sin redis')

        await store.set('sap:sessionID', SAP_SESSION.data.SessionId);
        await store.expire('sap:sessionID', 1800);

        return SAP_SESSION.data.SessionId;
    }catch(err){
        console.log(err)
    }
}

const getCamionesRedis = async()=> {
    try{
        const store = await getRedisClient()
        const SessionID = await getSessionSAP()
        const select = 'DocNum,U_Tipo,U_CamionPlaca,U_PesoTotal,U_Diferencia'
        const filter = 'U_Status eq \'E\''
        const camiones = await sapAxios.get(`${process.env.SAP_ENDPOINT}/Manifiestos?$select=${select}&$filter=${filter}`, {
            headers: getHeadersPost(SessionID)
        }) 

        const refactor = camiones.data.value.map((el) => ({
            Manifiesto: el.DocNum,
            tipo: el.U_Tipo,
            placa: el.U_CamionPlaca,
            pesoTotal: el.U_PesoTotal,
            diferencia: el.U_Diferencia
        }))

        const valueWithDate = {
            dataDate: new Date().toLocaleString(),
            data: refactor
        }

        await store.set('sap:manifiestos', JSON.stringify(valueWithDate));
        return true
    }catch(err){
        console.log(err)
        return false
    }
}

const getCamiones = async(req, res) => {
    try{
        const store = await getRedisClient()
        const validRediManifiestos = await store.get('sap:manifiestos')

        if(validRediManifiestos){
            return res.send(JSON.parse(validRediManifiestos))
        }
        return res.send({msg:'Intente denuevo dentro de 3 minutos...'})
    }catch(err){
        return res.send({err: err.message})
    }
}


module.exports = {
    getCamiones,
    getCamionesRedis
}
