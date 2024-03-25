const jwt = require("jsonwebtoken");


exports.default = (req, res, next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token, process.env.JWT_KEY)
        req.usuario = decode
        next()
    } catch (error) {
        return res.status(401).send({ mensagem: "Falha na autenticacao"})
    }
    
};

exports.adm = (req, res, next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token, process.env.JWT_KEY)
        req.usuario = decode
        if(decode.permissao != 1){
            return res.status(401).send({ mensagem: "Falha na autenticacao"})
        }else{
            next()
        }
        
    } catch (error) {
        return res.status(401).send({ mensagem: "Falha na autenticacao"})
    }
    
};