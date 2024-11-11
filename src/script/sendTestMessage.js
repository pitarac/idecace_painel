const axios = require('axios');

// Dados para o envio de teste
const testStudent = {
    name: "Paulo H",               // Nome do destinatário de teste
    phoneNumber: "5561981388239",   // Número de telefone no formato correto
    token: "e57e07c5-dabe-4117-b135-c9704da1a5b7" // Token de teste
};

// Chave da API do ManyChat (use diretamente no cabeçalho)
const MANYCHAT_API_KEY = '1997860:7a9efbfdd5d83c16242688193f5393e5';

// Função para enviar uma mensagem de teste
async function sendTestMessage() {
    const surveyUrl = `https://idecace.datasavvy.com.br/?token=${testStudent.token}`;

    try {
        // Enviar mensagem para o número de telefone de teste
        await axios.post(
            'https://api.manychat.com/fb/sending/sendContent',
            {
                phone: testStudent.phoneNumber, // Verifique se este campo está configurado no ManyChat para identificar o usuário
                data: {
                    version: "v2",
                    content: {
                        messages: [
                            {
                                text: `Olá ${testStudent.name}, você ainda não respondeu nossa pesquisa! Leva apenas alguns minutinhos, clique aqui para responder: ${surveyUrl}`,
                            }
                        ]
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${MANYCHAT_API_KEY}`, // Não inclua Bearer, apenas o token direto
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Mensagem de teste enviada para ${testStudent.name}`);
    } catch (error) {
        console.error('Erro ao enviar mensagem de teste:', error.response ? error.response.data : error.message);
    }
}

// Executar a função de teste
sendTestMessage();
