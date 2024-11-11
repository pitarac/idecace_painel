// src/infrastructure/database/models/ResponseModel.js
console.log('Carregando ResponseModel...');

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  answers: { type: Object, required: true }, // As respostas são armazenadas em um objeto
  comments: { type: Object, required: false }, // Os comentários são armazenados em um objeto
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', responseSchema);