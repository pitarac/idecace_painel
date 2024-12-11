const axios = require('axios');

// Chave da API do ManyChat
const MANYCHAT_API_KEY = '1997860:42d27c596dae2e907e46d4421c4fc209';

// ID do campo personalizado de "token" no ManyChat
const TOKEN_FIELD_ID = 12005293; // Substitua pelo ID do campo de token no ManyChat

// Função para pausar a execução por um certo tempo (em milissegundos)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para buscar o `subscriber_id` com base no campo personalizado `token`
async function getSubscriberIdByToken(token) {
    try {
        const response = await axios.get(
            'https://api.manychat.com/fb/subscriber/findByCustomField',
            {
                params: {
                    field_id: TOKEN_FIELD_ID,
                    field_value: token
                },
                headers: {
                    'Authorization': `Bearer ${MANYCHAT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const data = response.data.data;
        return data.length > 0 ? data[0].id : null; // Retorna o subscriber_id se encontrado, senão retorna null
    } catch (error) {
        console.error(`Erro ao buscar subscriber_id para o token ${token}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

// Função para adicionar a tag ao `subscriber_id`
async function addTagToSubscriber(subscriberId, tagId) {
    try {
        await axios.post(
            'https://api.manychat.com/fb/subscriber/addTag',
            {
                subscriber_id: subscriberId,
                tag_id: tagId
            },
            {
                headers: {
                    'Authorization': `Bearer ${MANYCHAT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`Tag adicionada ao usuário com subscriber_id ${subscriberId}`);
    } catch (error) {
        console.error(`Erro ao adicionar tag para ${subscriberId}:`, error.response ? error.response.data : error.message);
    }
}

// Função principal para processar usuários sem resposta e adicionar a tag com uma pausa entre as requisições
async function tagUnansweredStudents() {
    const API_URL = 'https://proced.datasavvy.com.br/api/unanswered-students/'; // Endpoint para buscar estudantes sem resposta
    const TAG_ID = 54362739; // ID da tag "Aguardando Resposta" no ManyChat

    try {
        const response = await axios.get(API_URL);
        const students = response.data;

        for (const student of students) {
            // Buscar o `subscriber_id` pelo token personalizado
            const subscriberId = await getSubscriberIdByToken(student.token);
            
            // Se `subscriber_id` for encontrado, adicionar a tag
            if (subscriberId) {
                await addTagToSubscriber(subscriberId, TAG_ID);
            } else {
                console.log(`Usuário com token ${student.token} não encontrado no ManyChat.`);
            }

            // Pausar 100ms entre as requisições para não ultrapassar o limite de 10 por segundo
            await delay(100);
        }

        console.log('Processo de adição de tags concluído.');
    } catch (error) {
        console.error('Erro ao processar usuários:', error.message);
    }
}

// Executar a função
tagUnansweredStudents();
