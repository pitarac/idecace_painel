const express = require('express');
const Response = require('../models/ResponseModel');
const Student = require('../models/StudentModel');

const router = express.Router();

/**
 * Rota: /responses
 * Função: Obter respostas e informações dos estudantes (rota original)
 */
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

/**
 * Rota: /comments/word-cloud
 * Função: Processar os comentários e gerar dados para a word cloud
 */
router.get('/comments/word-cloud', async (req, res) => {
  try {
    // Buscar todos os comentários do banco de dados
    const responses = await Response.find();

    // Objeto para armazenar palavras categorizadas por pergunta
    const questionWordCounts = {};

    responses.forEach((response) => {
      if (response.comments) {
        Object.entries(response.comments).forEach(([questionId, comment]) => {
          // Inicializar a estrutura para a pergunta, se necessário
          if (!questionWordCounts[questionId]) {
            questionWordCounts[questionId] = {};
          }

          // Processar o comentário para contar as palavras
          comment
            .toLowerCase()
            .replace(/[^a-zÀ-ÿ\s]/g, '') // Remove pontuação
            .split(/\s+/) // Divide em palavras
            .forEach((word) => {
              if (word.length > 2) { // Filtra palavras pequenas
                questionWordCounts[questionId][word] =
                  (questionWordCounts[questionId][word] || 0) + 1;
              }
            });
        });
      }
    });

    // Transformar os resultados em um formato amigável
    const result = Object.entries(questionWordCounts).map(([questionId, words]) => ({
      questionId,
      words: Object.entries(words).map(([word, count]) => ({
        word,
        count,
      })),
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao processar comentários:', error);
    res.status(500).json({ error: 'Erro ao processar comentários' });
  }
});


/**
 * Rota: /unanswered-students
 * Função: Obter estudantes que não têm respostas registradas
 */
router.get('/unanswered-students', async (req, res) => {
  try {
    const studentsWithResponses = await Response.distinct('studentId');
    const unansweredStudents = await Student.find({
      _id: { $nin: studentsWithResponses }
    });

    res.json(unansweredStudents);
  } catch (error) {
    console.error('Erro ao buscar estudantes sem respostas:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

/**
 * Rota: /processed-responses
 * Função: Obter os dados das respostas já processados usando agregação no MongoDB
 * Parâmetro: unit (opcional) - Filtra as respostas de acordo com a unidade do CEU
 */
router.get('/processed-responses', async (req, res) => {
  try {
    const { unit } = req.query;

    let matchStage = {};
    if (unit && unit !== "Todas") {
      matchStage = {
        "answers.1": unit // Filtra as respostas pela unidade especificada (campo "1" representa a unidade do CEU)
      };
    }

    let aggregationPipeline = [
      { $match: matchStage },
      {
        $addFields: {
          answersArray: { $objectToArray: "$answers" }
        }
      },
      { $unwind: "$answersArray" },
      {
        $group: {
          _id: {
            questionId: "$answersArray.k",
            answer: "$answersArray.v"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.questionId",
          options: {
            $push: {
              answer: "$_id.answer",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          questionId: "$_id",
          options: {
            $arrayToObject: {
              $map: {
                input: "$options",
                as: "option",
                in: {
                  k: "$$option.answer",
                  v: "$$option.count"
                }
              }
            }
          }
        }
      }
    ];

    const processedResponses = await Response.aggregate(aggregationPipeline);
    res.json(processedResponses);
  } catch (error) {
    console.error('Erro ao processar respostas:', error);
    res.status(500).json({ error: 'Erro ao processar respostas' });
  }
});

module.exports = router;
