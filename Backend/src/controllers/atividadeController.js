const Atividade = require('../models/Atividade');

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

exports.curtirAtividade = async (req, res) => {
  try {
    const { id } = req.params;
    const atividade = await Atividade.findByPk(id);
    if (!atividade) return res.status(404).json({ error: 'Atividade não encontrada' });

    atividade.curtidas_count += 1;
    await atividade.save();
    return res.json(atividade);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao curtir atividade.' });
  }
};