const Atividade = require('../models/Atividade');

// LISTAR ATIVIDADES
exports.listarAtividades = async (req, res) => {
  try {
    const { tipo, pagina = 1 } = req.query;
    const limite = 4; // Paginação limitada em 4 itens por página
    const offset = (pagina - 1) * limite;
    const whereClause = tipo ? { tipo } : {};

    const { rows: atividades, count } = await Atividade.findAndCountAll({
      where: whereClause,
      limit: limite,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      totalItens: count,
      totalPaginas: Math.ceil(count / limite),
      paginaAtual: Number(pagina),
      atividades,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar atividades.' });
  }
};

// CRIAR ATIVIDADE (Ajustado para aceitar variações do frontend e não dar Validation Error)
exports.criarAtividade = async (req, res) => {
  try {
    // Captura os dados flexibilizando os nomes das variáveis enviadas pelo Frontend
    const {
      tipo, tipo_atividade,
      distancia, distancia_m,
      duracao, duracao_min,
      calorias, caloria,
      usuario_id, usuarioId, UsuarioId
    } = req.body;

    const tipoFinal = tipo || tipo_atividade || 'Corrida';
    const distanciaFinal = Number(distancia || distancia_m || 0);
    const duracaoFinal = Number(duracao || duracao_min || 0);
    const caloriasFinal = Number(calorias || caloria || 0);
    const userIdFinal = Number(usuario_id || usuarioId || UsuarioId || 1);

    // Cria o registro no banco
    const novaAtividade = await Atividade.create({
      tipo: tipoFinal,
      distancia: distanciaFinal,
      distancia_m: distanciaFinal,
      duracao: duracaoFinal,
      duracao_min: duracaoFinal,
      calorias: caloriasFinal,
      caloria: caloriasFinal,
      usuario_id: userIdFinal,
      usuarioId: userIdFinal,
      UsuarioId: userIdFinal,
      curtidas_count: 0
    });

    return res.status(201).json(novaAtividade);
  } catch (error) {
    console.error('Erro detalhado no backend ao criar atividade:', error);
    return res.status(500).json({ 
      error: 'Validation error', 
      detalhes: error.message,
      errosSequelize: error.errors ? error.errors.map(e => e.message) : []
    });
  }
};

// CURTIR ATIVIDADE
exports.curtirAtividade = async (req, res) => {
  try {
    const { id } = req.params;
    const atividade = await Atividade.findByPk(id);
    if (!atividade) return res.status(404).json({ error: 'Atividade não encontrada' });

    atividade.curtidas_count = (atividade.curtidas_count || 0) + 1;
    await atividade.save();
    return res.json(atividade);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao curtir atividade.' });
  }
};