const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require("../middleware/login");
const usuariosController = require("../controllers/usuarios_controller");

router.post('/cadastro', usuariosController.cadastrarUsuarios);

router.post("/login", usuariosController.loginUsuarios)

router.get('/', usuariosController.getUsuarios)

router.get('/:id', usuariosController.getById)

router.patch('/', login, usuariosController.patch)

router.delete('/:id', usuariosController.delete)

module.exports = router