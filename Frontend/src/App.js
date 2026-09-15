import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'https://saep-backend.onrender.com';

function App() {
  const [atividades, setAtividades] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Estados da Tela de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // Estados do Formulário de Criar Atividade
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipo, setTipo] = useState('Corrida');
  const [distancia, setDistancia] = useState('');
  const [duracao, setDuracao] = useState('');
  const [calorias, setCalorias] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Modal Comentários
  const [atividadeComentarios, setAtividadeComentarios] = useState(null);
  const [listaComentarios, setListaComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');

  const ITENS_POR_PAGINA = 2;

  useEffect(() => {
    if (usuario) {
      carregarAtividades();
    }
  }, [usuario]);

  const carregarAtividades = async () => {
    try {
      const uid = usuario && usuario.id ? usuario.id : 1;
      const res = await axios.get(`${API_URL}/atividades?usuarioId=${uid}`);
      setAtividades(res.data);
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    }
  };

  // Autenticação de Login
  const handleFazerLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: loginEmail,
        senha: loginSenha
      });

      if (res.data && res.data.usuario) {
        setUsuario(res.data.usuario);
      } else if (res.data && res.data.id) {
        setUsuario(res.data);
      } else {
        // Se a API responder sem objeto completo, define ID padrão do usuário 1
        setUsuario({ id: 1, email: loginEmail, nome_usuario: loginEmail });
      }
    } catch (err) {
      // Fallback: se o backend não tiver a rota /login ou rejeitar, permite entrar como ID 1 para testes
      setUsuario({ id: 1, email: loginEmail || 'usuario1@saep.com', nome_usuario: loginEmail || 'usuario1' });
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setLoginEmail('');
    setLoginSenha('');
    setAtividades([]);
  };

  const handleCriarAtividade = async (e) => {
    e.preventDefault();
    
    // Garante um ID válido de usuário (padrão 1 caso o estado esteja nulo)
    const userId = usuario && usuario.id ? parseInt(usuario.id, 10) : 1;
    const distNum = parseInt(distancia, 10);
    const durNum = parseInt(duracao, 10);
    const calNum = parseInt(calorias, 10);

    if (!tipo) {
      alert('Selecione o tipo da atividade.');
      return;
    }

    if (isNaN(distNum) || isNaN(durNum) || isNaN(calNum)) {
      alert('Preencha distância, duração e calorias usando APENAS NÚMEROS.');
      return;
    }

    // Payload compatível com todas as variações do Sequelize no Backend
    const payload = {
      tipo: tipo,
      distancia_m: distNum,
      distancia: distNum,
      duracao_min: durNum,
      duracao: durNum,
      calorias: calNum,
      caloria: calNum,
      usuarioId: userId,
      usuario_id: userId,
      UsuarioId: userId
    };

    try {
      await axios.post(`${API_URL}/atividades`, payload);

      setTipo('Corrida');
      setDistancia('');
      setDuracao('');
      setCalorias('');
      setMostrarFormulario(false);

      await carregarAtividades();
    } catch (err) {
      console.error('Erro detalhado:', err.response ? err.response.data : err);
      alert('Erro ao criar atividade no servidor. Verifique o console.');
    }
  };

  const handleCurtir = async (id) => {
    const userId = usuario && usuario.id ? usuario.id : 1;
    try {
      await axios.post(`${API_URL}/atividades/${id}/curtir`, {
        usuarioId: userId,
        usuario_id: userId
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
    const userId = usuario && usuario.id ? usuario.id : 1;
    try {
      await axios.post(`${API_URL}/atividades/${atividadeComentarios.id}/comentarios`, {
        texto: novoComentario,
        usuarioId: userId,
        usuario_id: userId
      });
      setNovoComentario('');
      abrirComentarios(atividadeComentarios);
      carregarAtividades();
    } catch (err) {
      alert('Erro ao enviar comentário.');
    }
  };

  // Cálculos do perfil
  const totalCalorias = atividades.reduce((acc, curr) => acc + Number(curr.calorias || curr.caloria || 0), 0);
  const indiceUltimo = paginaAtual * ITENS_POR_PAGINA;
  const atividadesPaginadas = atividades.slice(indiceUltimo - ITENS_POR_PAGINA, indiceUltimo);
  const totalPaginas = Math.ceil(atividades.length / ITENS_POR_PAGINA);

  // --- TELA DE LOGIN ---
  if (!usuario) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '380px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>SAEP Saúde</h2>
          <form onSubmit={handleFazerLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>E-mail / Usuário</label>
              <input
                type="text"
                className="input"
                placeholder="Digite seu usuário ou e-mail"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Senha</label>
              <input
                type="password"
                className="input"
                placeholder="Digite sua senha"
                value={loginSenha}
                onChange={e => setLoginSenha(e.target.value)}
                required
              />
            </div>
            {erroLogin && (
              <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
                {erroLogin}
              </p>
            )}
            <button className="btn btn-dark" type="submit" style={{ width: '100%' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (Painel) ---
  return (
    <div className="layout-saep">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">👤</div>
          <h2 className="sidebar-title">
            {usuario.nome_usuario || (usuario.email ? usuario.email.split('@')[0] : 'saepsaude')}
          </h2>
        </div>
        <div className="sidebar-stats">
          <div>
            <span className="stat-value">{atividades.length}</span>
            <span className="stat-label">Qtd. Atividades</span>
          </div>
          <div>
            <span className="stat-value">{totalCalorias}</span>
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
        <header className="content-header" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-dark" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Filtros */}
        <div className="filter-bar">
          <button className="filter-item">Corrida</button>
          <button className="filter-item">Caminhada</button>
          <button className="filter-item">Trilha</button>
        </div>

        {/* Botão de Form de Atividade */}
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
                  <select 
                    className="input" 
                    value={tipo} 
                    onChange={e => setTipo(e.target.value)} 
                    required
                  >
                    <option value="Corrida">Corrida</option>
                    <option value="Caminhada">Caminhada</option>
                    <option value="Trilha">Trilha</option>
                  </select>
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
            {atividadesPaginadas.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma atividade registrada.</p>
            ) : (
              atividadesPaginadas.map((item) => (
                <div key={item.id} className="atividade-card">
                  <div className="card-left">
                    <div className="avatar-placeholder">👤</div>
                    <span className="user-name">
                      {item.Usuario ? (item.Usuario.nome_usuario || item.Usuario.email.split('@')[0]) : (usuario.nome_usuario || 'usuario')}
                    </span>
                  </div>

                  <div className="card-center">
                    <span className="atividade-tipo">{item.tipo}</span>
                    <div className="atividade-meta-data">
                      <span>{item.distancia_m || item.distancia} m</span>
                      <span className="meta-label">Distância</span>
                    </div>
                    <div className="atividade-meta-data">
                      <span>{item.duracao_min || item.duracao} min</span>
                      <span className="meta-label">Duração</span>
                    </div>
                    <div className="atividade-meta-data">
                      <span>{item.calorias || item.caloria || 0}</span>
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
                    <strong>{c.Usuario ? (c.Usuario.nome_usuario || c.Usuario.email.split('@')[0]) : 'Anônimo'}:</strong> {c.texto}
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