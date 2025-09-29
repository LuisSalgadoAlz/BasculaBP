const { executeView } = require("../lib/hanaActions");

const getViewManifiestos = async(req, res)=> {
    try{
        const result = await executeView('IT_MANIFIESTOS_ACTIVOS');
        return res.send(result)
    }catch(err){
        console.log(err)
        return res.status(400).send({err: err.message})
    }
}

module.exports = {
    getViewManifiestos
}