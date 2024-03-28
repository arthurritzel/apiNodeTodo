const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require("../middleware/login");
const usuariosController = require("../controllers/usuarios_controller");

router.post('/cadastro', usuariosController.cadastrarUsuarios);

router.post("/login", usuariosController.loginUsuarios)

router.get('/', login.adm, usuariosController.getUsuarios)

router.get('/:id', login.adm, usuariosController.getById)

router.patch('/', login.default, usuariosController.patchSenha)

router.patch('/nome', login.default, usuariosController.patchNome)

router.patch('/makeadm', login.adm, usuariosController.makeADM)

router.patch('/removeadm', login.adm, usuariosController.removeADM)

router.delete('/:id', login.adm, usuariosController.delete)

module.exports = router