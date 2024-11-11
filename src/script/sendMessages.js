const axios = require('axios');

// URL da API para buscar estudantes sem resposta
const API_URL = 'http://localhost:3000/api/unanswered-students';
// Chave da API do ManyChat
const MANYCHAT_API_KEY = '1997860:7a9efbfdd5d83c16242688193f5393e5';

// Função para pausar a execução por um certo tempo (em milissegundos)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para enviar mensagem a usuários sem resposta
async function sendMessageToUnansweredStudents() {
    try {
        // Buscar dados dos estudantes que não responderam
        const response = await axios.get(API_URL);
        const students = response.data;

        for (const student of students) {
            // Enviar mensagem e esperar 100 milissegundos antes de enviar a próxima
            await sendMessageInManyChat(student);
            await delay(100); // Pausa de 100ms para manter o limite de 10 solicitações por segundo
        }

        console.log('Mensagens enviadas com sucesso para todos os estudantes sem resposta.');
    } catch (error) {
        console.error('Erro ao enviar mensagens:', error);
    }
}

// Função para enviar mensagem no ManyChat
async function sendMessageInManyChat(student) {
    try {
        // Construir a URL personalizada usando o token do estudante
        const surveyUrl = `https://idecace.datasavvy.com.br/?token=${student.token}`;

        // Enviar mensagem usando o número de telefone para localizar o contato
        await axios.post(
            'https://api.manychat.com/fb/sending/sendContent',
            {
                phone: student.phoneNumber, // Usando o número de telefone como identificador
                data: {
                    version: "v2",
                    content: {
                        messages: [
                            {
                                text: `Olá ${student.name}, você ainda não respondeu nossa pesquisa! Leva apenas alguns minutinhos, clique aqui para responder: ${surveyUrl}`,
                            }
                        ]
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${MANYCHAT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Mensagem enviada para ${student.name}`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem para ${student.name}:`, error);
    }
}

// Executar a função
sendMessageToUnansweredStudents();
