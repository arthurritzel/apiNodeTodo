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
                    'INSERT INTO usuarios (nome, email, senha, permissao) VALUES (?, ?, ?, ?)',
                    [req.body.nome, req.body.email, hash, 2],
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
                        permissao: results[0].permissao
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
                            permissao: prod.permissao,
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

exports.patchSenha = (req, res, next) => {
    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }
        conn.query("SELECT * FROM usuarios WHERE id = ?", [req.body.id], (error, results, fields) => {
            if (error) {
                return res.status(500).send({ error: error });
            }
            if (results.length < 1) {
                return res.status(500).send({
                    mensagem: "Falha na autenticação"
                });
            }
            bcrypt.compare(req.body.senha, results[0].senha, (bcrypterr1, resultBcry) => {
                if (bcrypterr1) {
                    console.log("Erro ao comparar as senhas.");
                    return res.status(401).send({
                        mensagem: "Senha antiga inválida"
                    });
                }
                if (resultBcry) {
                    bcrypt.hash(req.body.senhaNova, 10, (errBcrypt, hash) => {
                        if (errBcrypt) {
                            return res.status(500).send({
                                errBcrypt: errBcrypt,
                                response: null
                            });
                        }
                        conn.query(
                            'UPDATE usuarios SET senha = ? WHERE id = ?',
                            [hash, req.body.id],
                            (error2, resultado, field) => {
                                conn.release();
                                if (error2) {
                                    console.log("Erro ao atualizar a senha.");
                                    return res.status(500).send({
                                        error: error2,
                                        response: null
                                    });
                                }
                                console.log("Senha atualizada com sucesso.");
                                return res.status(201).send({
                                    mensagem: "Senha alterada com sucesso"
                                });
                            }
                        );
                    });
                } else {
                    console.log("Autenticação falhou.");
                    return res.status(402).send({
                        mensagem: "Falha na autenticação"
                    });
                }
            });
        });
    });
}

exports.delete = (req, res, next)=> {
    if(req.params.id != 8){
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
    }else{
        return res.status(500).send({
            mensagem: "Não é possivel remover esse usuario"
        });
    }
}

exports.patchNome = (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            `update usuarios set nome = ? where id = ?;`,
            [req.body.nome, req.body.id_usuario],
            (error, resul, fields)=>{
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                const response = {
                    mensagem: "Nome modificado com sucesso"
                    }
                

                res.status(202).send({
                    response
                    
                })
            }
        )
    })
}

exports.makeADM = (req, res, next)=> {
    mysql.getConnection((err, conn)=>{
        if (err) {
            return res.status(500).send({
                error: err,
                response: null
            });
        }

        conn.query(
            `update usuarios set permissao = ? where id = ?;`,
            [1, req.body.id_usuario],
            (error, resul, fields)=>{
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                const response = {
                    mensagem: "Permissao modificada com sucesso"
                    }
                

                res.status(202).send({
                    response
                    
                })
            }
        )
    })
}

exports.removeADM = (req, res, next)=> {
    if(req.body.id_usuario != 8){
        mysql.getConnection((err, conn)=>{
            if (err) {
                return res.status(500).send({
                    error: err,
                    response: null
                });
            }

            conn.query(
                `update usuarios set permissao = ? where id = ?;`,
                [2, req.body.id_usuario],
                (error, resul, fields)=>{
                    conn.release();
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null
                        });
                    }
                    const response = {
                        mensagem: "Permissao modificada com sucesso"
                        }
                    

                    res.status(202).send({
                        response
                        
                    })
                }
            )
        })
    }else{
        return res.status(500).send({
            mensagem: "Não é possivel remover ADM desse usuario"
        });
    }
}