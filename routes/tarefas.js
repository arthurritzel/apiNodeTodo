const express = require('express');
const router = express.Router();
const login = require("../middleware/login");
const tarefasController = require("../controllers/tarefas_controller")


router.get('/', login.default, tarefasController.getTarefas)

router.post('/', login.default, tarefasController.postTarefas)

router.get('/:id_tarefa', login.default, tarefasController.getById)

router.patch('/', login.default, tarefasController.patchTarefas)

router.delete('/:id', login.default, tarefasController.deleteTarefas)

module.exports = router