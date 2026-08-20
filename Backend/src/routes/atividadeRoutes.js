const express = require('express');
const router = express.Router();
const Atividade = require('../models/Atividade');

// GET /atividades
router.get('/', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    const uid = parseInt(usuarioId, 10) || 1;

    const atividades = await Atividade.findAll({
      order: [['id', 'DESC']]
    });

    // Formata o retorno para o frontend com valores padrão seguros
    const resultado = atividades.map(item => {
      const obj = item.toJSON();
      return {
        ...obj,
        curtidoPeloUsuario: false,
        comentarios_count: 0,
        Usuario: { email: 'usuario01@email.com' }
      };
    });

    res.json(resultado);
  } catch (err) {
    console.error('Erro no GET /atividades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /atividades
router.post('/', async (req, res) => {
  try {
    const { tipo, distancia_m, duracao_min, calorias, usuarioId } = req.body;

    const novaAtividade = await Atividade.create({
      tipo: tipo || 'Caminhada',
      distancia_m: parseFloat(distancia_m) || 0,
      duracao_min: parseInt(duracao_min, 10) || 0,
      calorias: parseInt(calorias, 10) || 300,
      curtidas_count: 0,
      usuarioId: parseInt(usuarioId, 10) || 1
    });

    res.status(201).json(novaAtividade);
  } catch (err) {
    console.error('Erro no POST /atividades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;