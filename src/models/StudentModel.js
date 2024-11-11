console.log('Carregando StudentModel...');

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token: {  type: String, required: false, default: null }, // Token para identificar o estudante
  phoneNumber: { type: String }, // Número de telefone (opcional, dependendo de outras funcionalidades)
  messageStatus: { type: String, enum: ['Enviado', 'Falha', 'Não Enviado'], default: 'Não Enviado' }, // Status do envio da mensagem
  surveyResponse: { type: Boolean, default: false } // Indica se o estudante respondeu à pesquisa ou não
});

module.exports = mongoose.model('Student', studentSchema);
