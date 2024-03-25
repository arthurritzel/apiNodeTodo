const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const login = require("../middleware/login");

router.get('/', login, (req, res, next) => {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            "select * from tarefas where id_usuario = ?", [req.usuario.id_usuario],
            (error, result, fields)=>{
                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                const response = {
                    quantidade : result.length,
                    tarefas : result.map(prod =>{
                        return {
                            id_tarefa: prod.id,
                            mensagem: prod.mensagem,
                            situacao: prod.situacao,
                            id_usuario: prod.id_usuario,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna uma tarefa',
                                url: 'http://localhost:3000/tarefas/' + prod.id
                            }
                        }
                    })
                }
                res.status(200).send({
                    response
                })
            }
        )
    })
})

router.post('/', login, (req, res, next)=> {
    mysql.getConnection((err, conn) =>{
        if (err) {
        
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query("select * from usuarios where id = ?", [req.usuario.id_usuario], (err, result, field)=>{
            
            if (err) {
                conn.release();
                return res.status(500).send({
                    error: err,
                    response: null
                });
            }
            if(result.length == 0){
                conn.release();
                return res.status(404).send({
                    mensagem: "usuario nao encontrado"
                })
            }

            conn.query(
                'INSERT INTO tarefas (mensagem, situacao, id_usuario) VALUES (?, ?, ?)',
                [req.body.mensagem, req.body.situacao, req.usuario.id_usuario],
                (error, resultado, field) => {
                    conn.release();
    
    
                    if(error){
                        return res.status(500).send({
                            error: error,
                            response: null
                        })
                    }
                    const response = {
                        descricao: "Tarefa cadastrada com sucesso",
                        tarefaCriada : {
                                id_tarefa: resultado.insertId,
                                mensagem: req.body.mensagem,
                                situacao: req.body.situacao,
                                id_usuario: req.body.id_usuario,
                                request: {
                                    tipo: 'GET',
                                    descricao: 'Todos as tarefas',
                                    url: 'http://localhost:3000/tarefas/'
                                }
                            }
                        }
                    
    
                    res.status(201).send({
                        response
                        
                    })
                }
            )

        })
    })
})

router.get('/:id_tarefa', login, (req, res, next)=>{
    
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            "select * from tarefas where id = ?",
            [req.params.id_tarefa],
            (error, result, fields)=>{
                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                if (result.length === 0){
                    return res.status(400).send({
                        mensagem: "Tarefa nao encontrada"
                    })
                }

                const response = {
                    descricao: "Tarefa encontrada",
                    tarefas : result.map(prod =>{
                        return {
                            id: prod.id,
                            mensagem: prod.mensagem,
                            situacao: prod.situacao,
                            id_usuario: prod.id_usuario,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna as tarefas',
                                url: 'http://localhost:3000/tarefas/'
                            }
                        }
                    })
                    }
                res.status(200).send({
                    response
                })
            }
        )
    })
})

router.patch('/', login, (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            `update tarefas set mensagem = ?, situacao = ?, id_usuario = ? where id = ?;`,
            [req.body.mensagem, req.body.situacao, req.usuario.id_usuario, req.body.id_tarefa],
            (error, resul, fields)=>{
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                const response = {
                    descricao: "Tarefa modificada com sucesso",
                    tarefaModificada : {
                            id: req.body.insertId,
                            mensagem: req.mensagem,
                            situacao: req.situacao,
                            id_usuario: req.id_usuario,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna as tarefas',
                                url: 'http://localhost:3000/tarefas/'
                            }
                        }
                    }
                

                res.status(202).send({
                    response
                    
                })
            }
        )
    })
})

router.delete('/:id', login, (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            "delete from tarefas where id = ?",
            [req.params.id],
            (error, resultado, fields)=>{
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }

                const response = {
                    mensagem: "Tarefa removida com sucesso",
                    
                }
                res.status(202).send({
                    response
                })
            }
        )
    })
})

module.exports = router