const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Atividade = sequelize.define('Atividade', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.STRING, allowNull: false }, // Corrida, Caminhada, Trilha
  distancia_m: { type: DataTypes.FLOAT, allowNull: false }, // em metros
  duracao_min: { type: DataTypes.INTEGER, allowNull: false }, // em minutos
  curtidas_count: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Atividade;