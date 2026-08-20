const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Conexão PostgreSQL
const sequelize = new Sequelize('saep_saude', 'postgres', 'senai', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

// 2. Definição dos Modelos Atualizados
const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  nome_usuario: { type: DataTypes.STRING, allowNull: false },
  imagem: { type: DataTypes.STRING, allowNull: true },
  senha: { type: DataTypes.STRING, allowNull: false }
});

const Atividade = sequelize.define('Atividade', {
  tipo_atividade: { type: DataTypes.STRING, allowNull: false },
  distancia_percorrida: { type: DataTypes.INTEGER, allowNull: false },
  duracao_atividade: { type: DataTypes.INTEGER, allowNull: false },
  quantidade_calorias: { type: DataTypes.INTEGER, defaultValue: 300 },
  curtidas_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true }
});

const Curtida = sequelize.define('Curtida', {
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  atividade_id: { type: DataTypes.INTEGER, allowNull: false }
});

const Comentario = sequelize.define('Comentario', {
  texto: { type: DataTypes.STRING, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  atividade_id: { type: DataTypes.INTEGER, allowNull: false }
});

// 3. Relacionamentos
Usuario.hasMany(Atividade, { foreignKey: 'usuario_id' });
Atividade.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Usuario.hasMany(Curtida, { foreignKey: 'usuario_id' });
Atividade.hasMany(Curtida, { foreignKey: 'atividade_id' });

Usuario.hasMany(Comentario, { foreignKey: 'usuario_id' });
Atividade.hasMany(Comentario, { foreignKey: 'atividade_id' });
Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// 4. Sincronização e Povoamento do Banco
async function inicializar() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // Inserção exata dos usuários fornecidos
    await Usuario.bulkCreate([
      { id: 1, nome: 'saepsaude', email: 'saepsaude@email.com', nome_usuario: 'saepsaude', imagem: 'saepsaude.png', senha: '123', createdAt: '2024-08-14 18:56:33.531 +00:00', updatedAt: '2024-08-14 18:56:33.531 +00:00' },
      { id: 2, nome: 'usuario1', email: 'usuario1@email.com', nome_usuario: 'usuario01', imagem: 'usuario01.jpg', senha: '123', createdAt: '2024-08-14 18:58:07.862 +00:00', updatedAt: '2024-08-14 18:58:07.862 +00:00' },
      { id: 3, nome: 'usuario2', email: 'usuario2@email.com', nome_usuario: 'usuario02', imagem: 'usuario02.jpg', senha: '123', createdAt: '2024-08-14 18:58:21.651 +00:00', updatedAt: '2024-08-14 18:58:21.651 +00:00' },
      { id: 4, nome: 'usuario3', email: 'usuario3@email.com', nome_usuario: 'usuario03', imagem: 'usuario03.jpg', senha: '123', createdAt: '2024-08-14 18:58:35.090 +00:00', updatedAt: '2024-08-14 18:58:35.090 +00:00' }
    ]);

    // Inserção exata das atividades fornecidas anteriormente
    await Atividade.bulkCreate([
      { id: 3, tipo_atividade: 'caminhada', distancia_percorrida: 5000, duracao_atividade: 70, quantidade_calorias: 340, usuario_id: 1, createdAt: '2024-08-14 19:15:11.453 +00:00', updatedAt: '2024-08-14 19:15:11.453 +00:00' },
      { id: 4, tipo_atividade: 'caminhada', distancia_percorrida: 4000, duracao_atividade: 40, quantidade_calorias: 140, usuario_id: 2, createdAt: '2024-08-14 19:15:54.438 +00:00', updatedAt: '2024-08-14 19:15:54.438 +00:00' },
      { id: 5, tipo_atividade: 'caminhada', distancia_percorrida: 3000, duracao_atividade: 30, quantidade_calorias: 140, usuario_id: 3, createdAt: '2024-08-14 19:16:09.149 +00:00', updatedAt: '2024-08-14 19:16:09.149 +00:00' },
      { id: 6, tipo_atividade: 'caminhada', distancia_percorrida: 3500, duracao_atividade: 35, quantidade_calorias: 180, usuario_id: 4, createdAt: '2024-08-14 19:16:24.636 +00:00', updatedAt: '2024-08-14 19:16:24.636 +00:00' },
      { id: 7, tipo_atividade: 'corrida', distancia_percorrida: 6500, duracao_atividade: 40, quantidade_calorias: 280, usuario_id: 1, createdAt: '2024-08-14 19:17:30.973 +00:00', updatedAt: '2024-08-14 19:17:30.973 +00:00' },
      { id: 8, tipo_atividade: 'corrida', distancia_percorrida: 5500, duracao_atividade: 50, quantidade_calorias: 220, usuario_id: 2, createdAt: '2024-08-14 19:17:47.106 +00:00', updatedAt: '2024-08-14 19:17:47.106 +00:00' },
      { id: 9, tipo_atividade: 'corrida', distancia_percorrida: 10000, duracao_atividade: 24, quantidade_calorias: 420, usuario_id: 3, createdAt: '2024-08-14 19:18:18.334 +00:00', updatedAt: '2024-08-14 19:18:18.334 +00:00' },
      { id: 10, tipo_atividade: 'corrida', distancia_percorrida: 5000, duracao_atividade: 23, quantidade_calorias: 320, usuario_id: 4, createdAt: '2024-08-14 19:18:41.149 +00:00', updatedAt: '2024-08-14 19:18:41.149 +00:00' },
      { id: 11, tipo_atividade: 'trilha', distancia_percorrida: 2000, duracao_atividade: 40, quantidade_calorias: 420, usuario_id: 1, createdAt: '2024-08-14 19:20:24.202 +00:00', updatedAt: '2024-08-14 19:20:24.202 +00:00' },
      { id: 12, tipo_atividade: 'trilha', distancia_percorrida: 3000, duracao_atividade: 45, quantidade_calorias: 470, usuario_id: 2, createdAt: '2024-08-14 19:20:43.688 +00:00', updatedAt: '2024-08-14 19:20:43.688 +00:00' },
      { id: 13, tipo_atividade: 'trilha', distancia_percorrida: 3500, duracao_atividade: 45, quantidade_calorias: 420, usuario_id: 3, createdAt: '2024-08-14 19:26:04.128 +00:00', updatedAt: '2024-08-14 19:26:04.128 +00:00' },
      { id: 14, tipo_atividade: 'trilha', distancia_percorrida: 5000, duracao_atividade: 70, quantidade_calorias: 570, usuario_id: 4, createdAt: '2024-08-14 19:26:23.865 +00:00', updatedAt: '2024-08-14 19:26:23.865 +00:00' }
    ]);

    console.log('✅ USUÁRIOS E ATIVIDADES POPULADOS COM SUCESSO');
  } catch (err) {
    console.error('❌ ERRO NO BANCO DE DADOS:', err.message);
  }
}

inicializar();

// 5. Rotas de Autenticação
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await Usuario.findOne({ where: { email, senha } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, nome_usuario, imagem, senha } = req.body;
    const novo = await Usuario.create({
      nome: nome || email.split('@')[0],
      email,
      nome_usuario: nome_usuario || email.split('@')[0],
      imagem: imagem || 'default.jpg',
      senha
    });
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Rotas de Atividades
app.get('/atividades', async (req, res) => {
  try {
    const uid = parseInt(req.query.usuarioId || req.query.usuario_id, 10) || 1;

    const atividades = await Atividade.findAll({
      order: [['id', 'DESC']],
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'nome_usuario', 'imagem'] }]
    });

    const curtidas = await Curtida.findAll({ where: { usuario_id: uid } });
    const curtidasIds = curtidas.map(c => c.atividade_id);
    const comentarios = await Comentario.findAll();

    const resultado = atividades.map(item => {
      const obj = item.toJSON();
      const qtdComentarios = comentarios.filter(c => c.atividade_id === obj.id).length;

      return {
        ...obj,
        tipo: obj.tipo_atividade,
        distancia_m: obj.distancia_percorrida,
        duracao_min: obj.duracao_atividade,
        calorias: obj.quantidade_calorias,
        usuarioId: obj.usuario_id,
        curtidoPeloUsuario: curtidasIds.includes(obj.id),
        comentarios_count: qtdComentarios
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/atividades', async (req, res) => {
  try {
    const { tipo, tipo_atividade, distancia_m, distancia_percorrida, duracao_min, duracao_atividade, calorias, quantidade_calorias, usuarioId, usuario_id } = req.body;

    const nova = await Atividade.create({
      tipo_atividade: tipo_atividade || tipo || 'caminhada',
      distancia_percorrida: parseInt(distancia_percorrida || distancia_m, 10) || 1000,
      duracao_atividade: parseInt(duracao_atividade || duracao_min, 10) || 30,
      quantidade_calorias: parseInt(quantidade_calorias || calorias, 10) || 300,
      curtidas_count: 0,
      usuario_id: parseInt(usuario_id || usuarioId, 10) || 1
    });

    res.status(201).json(nova);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/atividades/:id/curtir', async (req, res) => {
  try {
    const aid = parseInt(req.params.id, 10);
    const uid = parseInt(req.body.usuarioId || req.body.usuario_id, 10) || 1;

    const jaCurtiu = await Curtida.findOne({ where: { atividade_id: aid, usuario_id: uid } });

    if (jaCurtiu) {
      await jaCurtiu.destroy();
      await Atividade.decrement('curtidas_count', { by: 1, where: { id: aid } });
      return res.json({ message: 'Descurtido' });
    }

    await Curtida.create({ atividade_id: aid, usuario_id: uid });
    await Atividade.increment('curtidas_count', { by: 1, where: { id: aid } });
    res.json({ message: 'Curtido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Rotas de Comentários
app.get('/atividades/:id/comentarios', async (req, res) => {
  try {
    const coms = await Comentario.findAll({
      where: { atividade_id: req.params.id },
      include: [{ model: Usuario, attributes: ['nome', 'nome_usuario', 'imagem'] }]
    });
    res.json(coms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/atividades/:id/comentarios', async (req, res) => {
  try {
    const aid = parseInt(req.params.id, 10);
    const uid = parseInt(req.body.usuarioId || req.body.usuario_id, 10) || 1;
    const { texto } = req.body;

    const novo = await Comentario.create({ texto, atividade_id: aid, usuario_id: uid });
    res.json(novo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Backend atualizado e rodando na porta 3000!');
});