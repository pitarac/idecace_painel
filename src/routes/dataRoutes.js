const express = require('express');
const Response = require('../models/ResponseModel');
const Student = require('../models/StudentModel');
const router = express.Router();

// Rota original para obter respostas com informações dos estudantes
router.get('/responses', async (req, res) => {
    try {
        const responses = await Response.aggregate([
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student_info"
                }
            },
            { $unwind: "$student_info" }
        ]);

        res.json(responses);
    } catch (error) {
        console.error('Erro ao buscar respostas:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// Nova rota para obter estudantes que não têm respostas registradas
router.get('/unanswered-students', async (req, res) => {
    try {
        // Busca todos os IDs de estudantes que têm respostas
        const studentsWithResponses = await Response.distinct('studentId');

        // Busca estudantes que não estão na lista de IDs com respostas
        const unansweredStudents = await Student.find({
            _id: { $nin: studentsWithResponses }
        });

        res.json(unansweredStudents);
    } catch (error) {
        console.error('Erro ao buscar estudantes sem respostas:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

module.exports = router;
