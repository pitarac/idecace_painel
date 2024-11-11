// Importar dependências necessárias
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
  
      // Primeiro, filtrar documentos pela unidade (se unit for especificado)
      let matchStage = {};
      if (unit && unit !== "Todas") {
        matchStage = {
          "answers.1": unit // Filtra as respostas pela unidade especificada (campo "1" representa a unidade do CEU)
        };
      }
  
      // Pipeline de agregação para processar respostas no MongoDB
      let aggregationPipeline = [
        // Filtro inicial pelas respostas de unidade específica
        { $match: matchStage },
        
        // Converter o campo "answers" de objeto para um array de pares chave-valor
        {
          $addFields: {
            answersArray: { $objectToArray: "$answers" }
          }
        },
        // Desagregar o array de respostas em documentos individuais
        {
          $unwind: "$answersArray"
        },
        // Agrupar por questionId e resposta para contar as ocorrências
        {
          $group: {
            _id: {
              questionId: "$answersArray.k",
              answer: "$answersArray.v"
            },
            count: { $sum: 1 }
          }
        },
        // Agrupar novamente para juntar todas as respostas de uma pergunta
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
        // Projeção final para estruturar os dados de uma forma amigável
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
  
      // Executa o pipeline de agregação
      const processedResponses = await Response.aggregate(aggregationPipeline);
  
      // Envia os dados processados como resposta
      res.json(processedResponses);
    } catch (error) {
      console.error('Erro ao processar respostas:', error);
      res.status(500).json({ error: 'Erro ao processar respostas' });
    }
  });

module.exports = router;
