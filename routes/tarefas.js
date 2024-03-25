const express = require('express');
const router = express.Router();
const login = require("../middleware/login");
const tarefasController = require("../controllers/tarefas_controller")


router.get('/', login, tarefasController.getTarefas)

router.post('/', login, tarefasController.postTarefas)

router.get('/:id_tarefa', login, tarefasController.getById)

router.patch('/', login, tarefasController.patchTarefas)

router.delete('/:id', login, tarefasController.deleteTarefas)

module.exports = router