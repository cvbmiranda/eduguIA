import React from 'react';

interface HomeScreenProps {
  setAbaAtiva: (aba: string) => void;
  mensagens: any[];
  hudDisplay: { scoreResiliencia: string };
  estiloResultadoFinal: string;
  intCampeao: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setAbaAtiva, mensagens, hudDisplay, estiloResultadoFinal, intCampeao
}) => {
  return (
    <section className="card">
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2>👋 Bem-vindo!</h2>
        <p className="mut">Complete os módulos para gerar o seu perfil educacional.</p>
      </div>
      <div className="grid grid-auto">
        <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('chat')}><div style={{ fontSize: "44px" }}>💬</div><h3 style={{ margin: "8px 0" }}>Entrevista Inicial</h3><div className="progress"><span style={{ width: mensagens.length > 2 ? "100%" : "0%", background: mensagens.length > 2 ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{mensagens.length > 2 ? "Iniciado" : "Não iniciado"}</div></article>
        <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('parkour')}><div style={{ fontSize: "44px" }}>🎮</div><h3 style={{ margin: "8px 0" }}>Parkour da Resiliência</h3><div className="progress"><span style={{ width: hudDisplay.scoreResiliencia !== "0.0" ? "100%" : "0%", background: hudDisplay.scoreResiliencia !== "0.0" ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{hudDisplay.scoreResiliencia !== "0.0" ? "Concluído" : "Não iniciado"}</div></article>
        <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('estilos')}><div style={{ fontSize: "44px" }}>🕹️</div><h3 style={{ margin: "8px 0" }}>Estilos de Aprendizagem</h3><div className="progress"><span style={{ width: estiloResultadoFinal ? "100%" : "0%", background: estiloResultadoFinal ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{estiloResultadoFinal ? "Concluído" : "Não iniciado"}</div></article>
        <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('interesses')}><div style={{ fontSize: "44px" }}>⭐</div><h3 style={{ margin: "8px 0" }}>Torneio de Interesses</h3><div className="progress"><span style={{ width: intCampeao ? "100%" : "0%", background: intCampeao ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{intCampeao ? "Concluído" : "Não iniciado"}</div></article>
      </div>
    </section>
  );
};