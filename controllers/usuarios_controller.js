const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.cadastrarUsuarios = (req, res, next)=> {
    mysql.getConnection((err, conn)=>{

        if (err) {
        
            return res.status(500).send({
                error: err,
                response: null
            });
        }
        conn.query("select * from usuarios where email = ?", [req.body.email], (err, result)=>{
            if (err) {
        
                return res.status(500).send({
                    error: err,
                    response: null
                });
            }
            if(result.length > 0){
                return res.status(409).send({
                    mensagem: "usuario ja cadastrado"
                })
            }

            bcrypt.hash(req.body.senha, 10, (errBcrypt, hash)=>{
                if(errBcrypt){
                    return res.status(500).send({
                        errBcrypt: error,
                        response: null
                    })
                }
                conn.query(
                    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                    [req.body.nome, req.body.email, hash],
                    (error, resultado, field) => {
                        conn.release();
                        
                        
                        if(error){
                            return res.status(500).send({
                                error: error,
                                response: null
                            })
                        }
                        const response = {
                            descricao: "Usuario cadastrado com sucesso",
                            usuarioCriado : {
                                id_usuario: resultado.insertId,
                                nome: req.body.nome,
                                email: req.body.email,
                                
                                request: {
                                    tipo: 'GET',
                                    descricao: 'Todos os usuarios',
                                    url: 'http://localhost:3000/usuarios/'
                                }
                            }
                        }
                        
                        
                        res.status(201).send({
                            response
                            
                        })
                    }
                    )
                    
                });
                
            })
            
        })
            
}

exports.loginUsuarios = (req, res, next)=>{
    mysql.getConnection((err, conn)=>{
        if (err) {
        
            return res.status(500).send({
                error: err,
                response: null
            });
        }
        conn.query("select * from usuarios where email = ?", [req.body.email], (error, results, fields)=>{
            conn.release();
            if(error){
                return res.status(500).send({ error: error})
            }
            if(results.length < 1){
                return res.status(401).send({
                    mensagem: "Falha na autenticação"
                })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result)=>{
                if(err){
                    return res.status(401).send({
                        mensagem: "Falha na autenticação"
                    })
                }
                if(result){
                    const token = jwt.sign({
                        id_usuario: results[0].id,
                        nome: results[0].nome,
                        email: results[0].email,
                    }, 
                    process.env.JWT_KEY, 
                    {
                        expiresIn: "1h"
                    })
                    return res.status(200).send({
                        mensagem:  "Autenticado com sucesso",
                        token: token
                    })
                }
                return res.status(401).send({
                    mensagem: "Falha na autenticação"
                })
            })
        })
    })

}

exports.getUsuarios = (req, res, next) => {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }
        
        conn.query(
            "select * from usuarios",
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
                    usuarios : result.map(prod =>{
                        return {
                            id_usuario: prod.id,
                            nome: prod.nome,
                            email: prod.email,
                            senha: prod.senha,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna um usuario',
                                url: 'http://localhost:3000/usuarios/' + prod.id
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
    
}

exports.getById = (req, res, next)=>{
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            "select * from usuarios where id = ?",
            [req.params.id],
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
                        mensagem: "Usuario nao encontrado"
                    })
                }

                const response = {
                    descricao: "Usuario encontrado",
                    usuarios : result.map(prod =>{
                        return {
                            id_usuario: prod.id,
                            nome: prod.nome,
                            email: prod.email,
                            
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os usuarios',
                                url: 'http://localhost:3000/usuarios/'
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
}

exports.patch = (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            `update usuarios set nome = ?, email = ?, senha = ? where id = ?;`,
            [req.body.nome, req.body.email, req.body.senha, req.body.id],
            (error, resul, fields)=>{
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                const response = {
                    descricao: "Usuario modificado com sucesso",
                    usuarioModificado : {
                            id_usuario: req.body.insertId,
                            nome: req.body.nome,
                            email: req.body.email,
                            senha: req.body.senha,
                            request: {
                                tipo: 'GET',
                                descricao: 'Todos os usuarios',
                                url: 'http://localhost:3000/usuarios/'
                            }
                        }
                    }
                

                res.status(202).send({
                    response
                    
                })
            }
        )
    })
}

exports.delete = (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            "delete from usuarios where id = ?",
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
                    mensagem: "Usuario removido com sucesso",
                    
                }
                res.status(202).send({
                    response
                })
            }
        )
    })
}