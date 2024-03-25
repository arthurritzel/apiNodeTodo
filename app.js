const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const rotaTarefas = require('./routes/tarefas');
const rotaUsuarios = require('./routes/usuarios');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(                     
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Conten-Type, Accept, Authorization'
        )

    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({})
    }
    next();
})

app.use('/tarefas', rotaTarefas);
app.use('/usuarios', rotaUsuarios);

app.use((req, res, next)=>{
    const erro = new Error('Not found')
    erro.status = 404;
    next(erro);
});

app.use((error, rqe, res, next) => {
    res.status(error.status || 500);
    return res.send({
        error:{
            mensagem: error.message
        }
    });
})

module.exports = app;