import React, { useState } from 'react';

export default function CardAtividade({ atividade, isLogged, onRequireLogin, onCurtir }) {
  const [curtido, setCurtido] = useState(false);

  // Conversões solicitadas
  const distanciaKm = (atividade.distancia_m / 1000).toFixed(2);
  const duracaoHoras = (atividade.duracao_min / 60).toFixed(1);

  const handleLike = () => {
    if (!isLogged) {
      onRequireLogin();
      return;
    }
    setCurtido(!curtido);
    onCurtir(atividade.id);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
      <h3>{atividade.tipo}</h3>
      <p>Distância: {distanciaKm} km | Duração: {duracaoHoras} hrs</p>
      
      <button 
        onClick={handleLike} 
        style={{ color: curtido ? '#FF0000' : '#000', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        ♥ {atividade.curtidas_count + (curtido ? 1 : 0)} Likes
      </button>
    </div>
  );
}