import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CardAtividade from './components/CardAtividade';

export default function App() {
  const [atividades, setAtividades] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const carregarAtividades = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/atividades');
      setAtividades(res.data.atividades);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarAtividades();
  }, []);

  const handleCurtir = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/atividades/${id}/curtir`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>SAEPSaúde</h2>
        <button onClick={() => setIsLogged(!isLogged)}>
          {isLogged ? 'Sair (Logout)' : 'Entrar (Login)'}
        </button>
      </header>

      <main>
        {atividades.map((act) => (
          <CardAtividade
            key={act.id}
            atividade={act}
            isLogged={isLogged}
            onRequireLogin={() => setModalOpen(true)}
            onCurtir={handleCurtir}
          />
        ))}
      </main>

      {modalOpen && (
        <div style={{ position: 'fixed', top: '30%', left: '30%', background: '#fff', padding: '20px', border: '2px solid black' }}>
          <h3>Atenção</h3>
          <p>Você precisa estar logado para realizar esta ação.</p>
          <button onClick={() => setModalOpen(false)}>Fechar</button>
        </div>
      )}
    </div>
  );
}