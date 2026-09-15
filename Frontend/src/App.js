import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'https://saep-backend.onrender.com';

function App() {
  const [atividades, setAtividades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState(null); // Inicia sem usuário logado
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estados do Formulário de Atividade
  const [tipo, setTipo] = useState('');
  const [distancia, setDistancia] = useState('');
  const [duracao, setDuracao] = useState('');
  const [calorias, setCalorias] = useState('');

  // Modal Comentários
  const [atividadeComentarios, setAtividadeComentarios] = useState(null);
  const [listaComentarios, setListaComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');

  const ITENS_POR_PAGINA = 2;

  // Carrega lista de usuários e atividades ao iniciar
  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    carregarAtividades();
  }, [usuario]);

  const carregarUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(res.data);
      // Se houver usuários e nenhum estiver selecionado, seleciona o primeiro por padrão
      if (res.data.length > 0 && !usuario) {
        setUsuario(res.data[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      // Fallback de segurança caso a rota de usuários falhe
      if (!usuario) {
        setUsuario({ id: 1, email: 'usuario01@email.com' });
      }
    }
  };

  const carregarAtividades = async () => {
    try {
      const uid = usuario ? usuario.id : '';
      const res = await axios.get(`${API_URL}/atividades?usuarioId=${uid}`);
      setAtividades(res.data);
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    }
  };

  const handleToggleLogin = () => {
    if (usuario) {
      setUsuario(null); // Logout
    } else if (usuarios.length > 0) {
      setUsuario(usuarios[0]); // Login como primeiro usuário
    } else {
      setUsuario({ id: 1, email: 'usuario01@email.com' });
    }
  };

  const handleTrocarUsuario = (e) => {
    const idSelecionado = parseInt(e.target.value, 10);
    const u = usuarios.find(item => item.id === idSelecionado);
    if (u) setUsuario(u);
  };

  const handleCriarAtividade = async (e) => {
    e.preventDefault();

    if (!usuario) {
      alert('Faça login para registrar uma atividade.');
      return;
    }

    const distNum = parseInt(distancia, 10);
    const durNum = parseInt(duracao, 10);
    const calNum = parseInt(calorias, 10);

    if (isNaN(distNum) || isNaN(durNum) || isNaN(calNum)) {
      alert('Por favor, preencha distância, duração e calorias usando APENAS NÚMEROS.');
      return;
    }

    try {
      await axios.post(`${API_URL}/atividades`, {
        tipo: tipo.trim(),
        distancia_m: distNum,
        duracao_min: durNum,
        calorias: calNum,
        usuarioId: usuario.id
      });

      setTipo('');
      setDistancia('');
      setDuracao('');
      setCalorias('');
      setMostrarFormulario(false);

      await carregarAtividades();
    } catch (err) {
      alert('Erro ao criar atividade no servidor.');
    }
  };

  const handleCurtir = async (id) => {
    if (!usuario) return alert('Faça login para curtir.');
    try {
      await axios.post(`${API_URL}/atividades/${id}/curtir`, {
        usuarioId: usuario.id
      });
      carregarAtividades();
    } catch (err) {
      alert('Erro ao curtir a atividade.');
    }
  };

  const abrirComentarios = async (atividade) => {
    setAtividadeComentarios(atividade);
    try {
      const res = await axios.get(`${API_URL}/atividades/${atividade.id}/comentarios`);
      setListaComentarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!usuario) return alert('Faça login para comentar.');
    try {
      await axios.post(`${API_URL}/atividades/${atividadeComentarios.id}/comentarios`, {
        texto: novoComentario,
        usuarioId: usuario.id
      });
      setNovoComentario('');
      abrirComentarios(atividadeComentarios);
      carregarAtividades();
    } catch (err) {
      alert('Erro ao enviar comentário.');
    }
  };

  // Cálculos dinâmicos do perfil
  const totalCalorias = atividades.reduce((acc, curr) => acc + Number(curr.calorias || 0), 0);
  const indiceUltimo = paginaAtual * ITENS_POR_PAGINA;
  const atividadesPaginadas = atividades.slice(indiceUltimo - ITENS_POR_PAGINA, indiceUltimo);
  const totalPaginas = Math.ceil(atividades.length / ITENS_POR_PAGINA);

  return (
    <div className="layout-saep">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">👤</div>
          <h2 className="sidebar-title">
            {usuario ? usuario.email.split('@')[0] : 'Visitante'}
          </h2>
        </div>
        <div className="sidebar-stats">
          <div>
            <span className="stat-value">{usuario ? atividades.length : 0}</span>
            <span className="stat-label">Qtd. Atividades</span>
          </div>
          <div>
            <span className="stat-value">{usuario ? totalCalorias : 0}</span>
            <span className="stat-label">Qtd. Calorias</span>
          </div>
        </div>
        <div className="sidebar-menu">
          <a href="#atividade" className="menu-item active">📊 Atividade</a>
        </div>
        <div className="sidebar-footer">
          <strong>SAEPSaúde</strong>
          <p style={{ marginTop: '5px' }}>Copyright - 2025/2026</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Seletor para trocar de usuário para testes */}
          {usuario && usuarios.length > 0 && (
            <select className="input" style={{ width: 'auto', margin: 0 }} value={usuario.id} onChange={handleTrocarUsuario}>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          )}

          <button className="btn btn-dark" onClick={handleToggleLogin}>
            {usuario ? 'Logout' : 'Login'}
          </button>
        </header>

        {/* Filtros */}
        <div className="filter-bar">
          <button className="filter-item">Corrida</button>
          <button className="filter-item">Caminhada</button>
          <button className="filter-item">Trilha</button>
        </div>

        {/* Botão para exibir o Formulário */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button className="btn btn-dark" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            {mostrarFormulario ? 'Cancelar' : '+ Criar Atividade'}
          </button>
        </div>

        {/* Formulário Condicional */}
        {mostrarFormulario && (
          <section className="form-card">
            <h2 className="form-title">Crie sua atividade</h2>
            <form onSubmit={handleCriarAtividade}>
              <div className="form-grid">
                <div>
                  <label>Tipo da atividade</label>
                  <input 
                    className="input" 
                    placeholder="Ex: Caminhada" 
                    value={tipo} 
                    onChange={e => setTipo(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label>Distância percorrida (metros)</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="1" 
                    placeholder="Ex: 1000" 
                    value={distancia} 
                    onChange={e => setDistancia(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label>Duração da atividade (minutos)</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="1" 
                    placeholder="Ex: 120" 
                    value={duracao} 
                    onChange={e => setDuracao(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label>Quantidade de Calorias</label>
                  <input 
                    className="input" 
                    type="number" 
                    min="1" 
                    placeholder="Ex: 300" 
                    value={calorias} 
                    onChange={e => setCalorias(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-dark" type="submit">Salvar Atividade</button>
              </div>
            </form>
          </section>
        )}

        {/* Feed de Atividades */}
        <section className="feed-section">
          <h2 className="feed-title">Suas Atividades</h2>
          <div className="atividades-feed">
            {!usuario ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Faça login para visualizar e interagir com as atividades.</p>
            ) : atividadesPaginadas.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma atividade registrada.</p>
            ) : (
              atividadesPaginadas.map((item) => (
                <div key={item.id} className="atividade-card">
                  <div className="card-left">
                    <div className="avatar-placeholder">👤</div>
                    <span className="user-name">
                      {item.Usuario ? item.Usuario.email.split('@')[0] : usuario.email.split('@')[0]}
                    </span>
                  </div>
                  
                  <div className="card-center">
                    <span className="atividade-tipo">{item.tipo}</span>
                    <div className="atividade-meta-data">
                      <span>{item.distancia_m} m</span>
                      <span className="meta-label">Distância</span>
                    </div>
                    <div className="atividade-meta-data">
                      <span>{item.duracao_min} min</span>
                      <span className="meta-label">Duração</span>
                    </div>
                    <div className="atividade-meta-data">
                      <span>{item.calorias || 0}</span>
                      <span className="meta-label">Calorias</span>
                    </div>
                  </div>

                  <div className="card-right">
                    <span className="atividade-data">18/08/2026</span>
                    <div className="card-actions">
                      <span 
                        onClick={() => handleCurtir(item.id)}
                        style={{ 
                          cursor: 'pointer', 
                          color: item.curtidoPeloUsuario ? '#ff0000' : '#333333',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}
                      >
                        {item.curtidoPeloUsuario ? '❤️' : '♡'} {item.curtidas_count || 0}
                      </span>
                      <span onClick={() => abrirComentarios(item)} style={{ cursor: 'pointer', fontSize: '1.2rem' }}>
                        💬 {item.comentarios_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)}>Anterior</button>
            <button className={`page-number ${paginaAtual === 1 ? 'active' : ''}`} onClick={() => setPaginaAtual(1)}>1</button>
            {totalPaginas >= 2 && <button className={`page-number ${paginaAtual === 2 ? 'active' : ''}`} onClick={() => setPaginaAtual(2)}>2</button>}
            <button className="page-btn" disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)}>Próximo</button>
          </div>
        )}
      </main>

      {/* Modal Comentários */}
      {atividadeComentarios && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px' }}>
            <h2>Comentários - {atividadeComentarios.tipo}</h2>
            <div className="comentarios-lista">
              {listaComentarios.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>Nenhum comentário ainda.</p>
              ) : (
                listaComentarios.map(c => (
                  <div key={c.id} className="comentario-item">
                    <strong>{c.Usuario ? c.Usuario.email.split('@')[0] : 'Anônimo'}:</strong> {c.texto}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleEnviarComentario}>
              <input 
                className="input" 
                placeholder="Escreva um comentário..." 
                value={novoComentario} 
                onChange={e => setNovoComentario(e.target.value)} 
                required 
              />
              <button className="btn btn-dark" type="submit" style={{ width: '100%', margin: '8px 0' }}>Enviar Comentário</button>
            </form>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setAtividadeComentarios(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;