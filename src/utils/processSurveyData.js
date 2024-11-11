function processSurveyData(responses, questions) {
  const processedData = {};

  // Inicializa o objeto processedData com todas as perguntas
  questions.forEach((question) => {
    const questionIdStr = String(question.id).trim();
    processedData[questionIdStr] = {
      question: question.question,
      options: {},
      comments: [],
    };

    // Inicializa as opções com valores 0 para contagem
    question.options.forEach((option) => {
      processedData[questionIdStr].options[option] = 0;
    });

    // Inicializa os comentários se permitidos para a pergunta
    if (question.allowComment) {
      processedData[questionIdStr].comments = [];
    }
  });

  // Itera sobre cada resposta recebida
  responses.forEach((response, index) => {
    console.log(`Processando resposta ${index + 1} de ${responses.length}`);

    // Itera sobre cada resposta fornecida pelo usuário
    for (const [questionId, answer] of Object.entries(response.answers)) {
      const questionIdStr = String(questionId).trim();

      // Verifica se a pergunta existe em processedData
      if (processedData[questionIdStr]) {
        // Incrementa a contagem da opção respondida
        if (processedData[questionIdStr].options.hasOwnProperty(answer)) {
          processedData[questionIdStr].options[answer]++;
          console.log(`-- Incrementando a contagem da opção "${answer}" para a pergunta "${questionIdStr}"`);
        } else {
          console.warn(`-- Opção "${answer}" não encontrada para a pergunta "${processedData[questionIdStr].question}"`);
        }

        // Adiciona comentários, se houver e se permitido
        if (
          response.comments &&
          response.comments.hasOwnProperty(questionIdStr) &&
          processedData[questionIdStr].comments !== undefined
        ) {
          const comment = response.comments[questionIdStr];
          if (comment && comment.trim() !== "") {
            processedData[questionIdStr].comments.push(comment);
            console.log(`-- Adicionando comentário para a pergunta "${questionIdStr}":`, comment);
          }
        }
      } else {
        console.warn(`!! Pergunta ID ${questionIdStr} não encontrada no processedData`);
      }
    }
  });

  console.log('Dados processados finais:', JSON.stringify(processedData, null, 2));
  return processedData;
}

module.exports = processSurveyData;
