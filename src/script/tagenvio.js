const axios = require('axios');

// Dados de configuração
const MANYCHAT_API_KEY = '1997860:7a9efbfdd5d83c16242688193f5393e5'; // Certifique-se de usar o token diretamente, sem Bearer
const API_URL = 'http://localhost:3000/api/unanswered-students'; // Rota para buscar estudantes que não responderam
const TAG_ID = 54243305; // Substitua pelo ID real da tag "Aguardando Resposta" no ManyChat

// Função para buscar o `subscriber_id` com base no número de telefone
async function getSubscriberId(phoneNumber) {
    try {
        const response = await axios.get(
            'https://api.manychat.com/fb/subscriber/findBySystemField',
            {
                params: {
                    phone: `+${phoneNumber}` // Adiciona o '+' antes do número de telefone
                },
                headers: {
                    'Authorization': MANYCHAT_API_KEY, // Apenas o token, sem Bearer
                    'Content-Type': 'application/json'
                }
            }
        );
        const { data } = response.data;
        return data.id; // Retorna o subscriber_id
    } catch (error) {
        console.error(`Erro ao buscar subscriber_id para ${phoneNumber}:`, error.response ? error.response.data : error.message);
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
                    'Authorization': MANYCHAT_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`Tag adicionada ao usuário com subscriber_id ${subscriberId}`);
    } catch (error) {
        console.error(`Erro ao adicionar tag para ${subscriberId}:`, error.response ? error.response.data : error.message);
    }
}

// Função principal para processar usuários sem resposta e adicionar a tag
async function tagUnansweredStudents() {
    try {
        const response = await axios.get(API_URL);
        const students = response.data;

        for (const student of students) {
            // Buscar o `subscriber_id` pelo número de telefone com o formato correto
            const subscriberId = await getSubscriberId(student.phoneNumber);
            
            // Se `subscriber_id` for encontrado, adicionar a tag
            if (subscriberId) {
                await addTagToSubscriber(subscriberId, TAG_ID);
            } else {
                console.log(`Usuário com telefone +${student.phoneNumber} não encontrado no ManyChat.`);
            }
        }

        console.log('Processo de adição de tags concluído.');
    } catch (error) {
        console.error('Erro ao processar usuários:', error.message);
    }
}

// Executar a função
tagUnansweredStudents();
