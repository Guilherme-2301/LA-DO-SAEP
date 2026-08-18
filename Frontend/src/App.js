import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [atividades, setAtividades] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [usuario, setUsuario] = useState(null);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isCadastro, setIsCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const ITENS_POR_PAGINA = 4;

  useEffect(() => {
    carregarAtividades();
  }, []);

  const carregarAtividades = async () => {
    try {
      const res = await axios.get('http://localhost:3000/atividades');
      const atividadesFormatadas = res.data.map((item, index) => ({
        ...item,
        usuarioNome: index % 2 === 0 ? "Usuário_01" : "Usuário_02",
        calorias: 350,
        data: index % 2 === 0 ? "18:30 - 12/08/2024" : "20:40 - 15/08/2024",
        comentarios_count: 4
      }));
      setAtividades(atividadesFormatadas);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErro('');
    const endpoint = isCadastro ? '/registrar' : '/login';
    
    try {
      const res = await axios.post(`http://localhost:3000${endpoint}`, { email, senha });
      setUsuario(res.data);
      setMostrarModal(false);
      setEmail('');
      setSenha('');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro na requisição.');
    }
  };

  const handleCurtir = async (id) => {
    if (!usuario) {
      setMostrarModal(true);
      return;
    }

    try {
      await axios.post(`http://localhost:3000/atividades/${id}/curtir`, {
        usuarioId: usuario.id
      });
      carregarAtividades();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao curtir.');
    }
  };

  const indiceUltimo = paginaAtual * ITENS_POR_PAGINA;
  const atividadesPaginadas = atividades.slice(indiceUltimo - ITENS_POR_PAGINA, indiceUltimo);
  const totalPaginas = Math.ceil(atividades.length / ITENS_POR_PAGINA);

  return (
    <div className="layout-saep">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🏃</div>
          <h1 className="sidebar-title">SAEPSaúde</h1>
        </div>
        <div className="sidebar-stats">
          <div>
            <span className="stat-value">3</span>
            <span className="stat-label">Qtd. Atividades</span>
          </div>
          <div>
            <span className="stat-value">100</span>
            <span className="stat-label">Qtd. Calorias</span>
          </div>
        </div>
        <div className="sidebar-menu">
          <a href="#atividade" className="menu-item">
            📊 Atividade
          </a>
        </div>
        <div className="sidebar-footer">
          <strong>SAEPSaúde</strong>
          <p style={{ marginTop: '5px' }}>Copyright - 2025/2026</p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <header className="content-header">
          {usuario ? (
            <div>
              <span style={{ fontSize: '0.9rem', marginRight: '10px' }}>{usuario.email}</span>
              <button className="btn btn-secondary" onClick={() => setUsuario(null)}>Sair</button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setMostrarModal(true)}>Login</button>
          )}
        </header>

        {/* Filtros */}
        <div className="filter-bar">
          <button className="filter-item active">Corrida</button>
          <button className="filter-item">Caminhada</button>
          <button className="filter-item">Trilha</button>
        </div>

        {/* Feed */}
        <div className="atividades-feed">
          {atividadesPaginadas.map((item) => (
            <div key={item.id} className="atividade-card">
              <div className="card-left">
                <div className="avatar-placeholder">
                  {item.usuarioNome.slice(-2)}
                </div>
                <span className="user-name">{item.usuarioNome}</span>
              </div>
              
              <div className="card-center">
                <span className="atividade-tipo">{item.tipo}</span>
                <div className="atividade-meta-data">
                  <span>{(item.distancia_m / 1000).toFixed(0)} km</span>
                  <span className="meta-label">Distância</span>
                </div>
                <div className="atividade-meta-data">
                  <span>{item.duracao_min} min</span>
                  <span className="meta-label">Duração</span>
                </div>
                <div className="atividade-meta-data">
                  <span>{item.calorias}</span>
                  <span className="meta-label">Calorias</span>
                </div>
              </div>

              <div className="card-right">
                <span className="atividade-data">{item.data}</span>
                <div className="card-actions">
                  <span className="action-item" onClick={() => handleCurtir(item.id)}>
                    ♡ {item.curtidas_count}
                  </span>
                  <span className="action-item">
                    💬 {item.comentarios_count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)}>Anterior</button>
            <button className={`page-number ${paginaAtual === 1 ? 'active' : ''}`} onClick={() => setPaginaAtual(1)}>1</button>
            {totalPaginas >= 2 && <button className={`page-number ${paginaAtual === 2 ? 'active' : ''}`} onClick={() => setPaginaAtual(2)}>2</button>}
            {totalPaginas >= 3 && <button className={`page-number ${paginaAtual === 3 ? 'active' : ''}`} onClick={() => setPaginaAtual(3)}>3</button>}
            <button className="page-btn" disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)}>Próximo</button>
          </div>
        )}
      </main>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isCadastro ? 'Criar Conta' : 'Acessar Conta'}</h2>
            {erro && <p className="error-msg">{erro}</p>}
            <form onSubmit={handleAuth}>
              <input className="input" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginBottom: '10px' }}>
                {isCadastro ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setIsCadastro(!isCadastro); setErro(''); }}>
              {isCadastro ? 'Já tenho conta' : 'Criar nova conta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;