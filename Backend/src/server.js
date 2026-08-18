const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o PostgreSQL (Ajuste a senha do seu banco no 3º parâmetro)
const sequelize = new Sequelize('saep_saude', 'postgres', 'senai', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

// Modelos
const Usuario = sequelize.define('Usuario', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  senha: { type: DataTypes.STRING, allowNull: false }
});

const Atividade = sequelize.define('Atividade', {
  tipo: DataTypes.STRING,
  distancia_m: DataTypes.INTEGER,
  duracao_min: DataTypes.INTEGER,
  curtidas_count: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Curtida = sequelize.define('Curtida', {
  usuarioId: DataTypes.INTEGER,
  atividadeId: DataTypes.INTEGER
});

// Relacionamentos
Usuario.hasMany(Curtida);
Atividade.hasMany(Curtida);
Curtida.belongsTo(Usuario);
Curtida.belongsTo(Atividade);

// Sincroniza tabelas no banco de dados
sequelize.sync()
  .then(() => console.log('Tabelas sincronizadas no PostgreSQL!'))
  .catch((err) => console.error('Erro ao sincronizar tabelas:', err));

// Rotas de Autenticação
app.post('/registrar', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });
    const usuario = await Usuario.create({ email, senha });
    res.json({ id: usuario.id, email: usuario.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { email, senha } });
    if (!usuario) return res.status(401).json({ error: 'Credenciais inválidas.' });
    res.json({ id: usuario.id, email: usuario.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas do Feed
app.get('/atividades', async (req, res) => {
  try {
    const atividades = await Atividade.findAll({ order: [['id', 'ASC']] });
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trava de 1 curtida por usuário
app.post('/atividades/:id/curtir', async (req, res) => {
  const { id } = req.params;
  const { usuarioId } = req.body;

  if (!usuarioId) return res.status(401).json({ error: 'Faça login para curtir.' });

  try {
    const jaCurtiu = await Curtida.findOne({ where: { atividadeId: id, usuarioId } });
    if (jaCurtiu) {
      return res.status(400).json({ error: 'Você já curtiu esta atividade!' });
    }

    await Curtida.create({ atividadeId: id, usuarioId });
    await Atividade.increment('curtidas_count', { by: 1, where: { id } });

    res.json({ message: 'Curtida registrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});