import React from 'react';

interface ProgressScreenProps {
  setAbaAtiva: (aba: string) => void;
  mensagens: any[];
  hudDisplay: { scoreResiliencia: string };
  estiloResultadoFinal: string;
  intCampeao: string;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  setAbaAtiva, mensagens, hudDisplay, estiloResultadoFinal, intCampeao
}) => {
  return (
    <section className="card">
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2>📊 O Seu Progresso e Perfil</h2>
        <p className="mut">Acompanhe a sua evolução nos módulos de mapeamento do EduGuIA.</p>
      </div>
      <div className="grid grid-auto" style={{ marginBottom: "30px", gap: "15px" }}>
        <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>💬 Entrevista</h3>{mensagens.length > 2 ? (<div><p style={{ color: "#22c55e", fontWeight: "bold", marginBottom: "10px" }}>✅ Em andamento</p><div className="progress"><span style={{ width: "50%", background: "#22c55e" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
        <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>🎮 Resiliência</h3>{hudDisplay.scoreResiliencia !== "0.0" ? (<div><p style={{ color: "#7dd3fc", fontWeight: "bold", marginBottom: "10px" }}>✅ Score: {hudDisplay.scoreResiliencia}/5.0</p><div className="progress"><span style={{ width: `${(parseFloat(hudDisplay.scoreResiliencia)/5)*100}%`, background: "#7dd3fc" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
        <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>🕹️ Estilo de Aprendizagem</h3>{estiloResultadoFinal ? (<div><p style={{ color: "#eab308", fontWeight: "bold", marginBottom: "10px" }}>✅ {estiloResultadoFinal}</p><div className="progress"><span style={{ width: "100%", background: "#eab308" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
        <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>⭐ Maior Interesse</h3>{intCampeao ? (<div><p style={{ color: "#ef4444", fontWeight: "bold", marginBottom: "10px" }}>✅ {intCampeao}</p><div className="progress"><span style={{ width: "100%", background: "#ef4444" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
      </div>
      <div className="card" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #0b1222 100%)", border: "1px solid #3b82f6", padding: "30px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: "10px" }}>A Sua Trilha Recomendada (IA)</h2>
        {estiloResultadoFinal && intCampeao ? (<div><p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#e2e8f0" }}>Avaliando os seus dados, percebemos que tem facilidade com a aprendizagem <strong>{estiloResultadoFinal}</strong> e possui um interesse dominante em <strong>{intCampeao}</strong>. Além disso, o seu nível de resiliência ao erro é de <strong>{hudDisplay.scoreResiliencia}/5.0</strong>.</p><div style={{ marginTop: "20px", background: "rgba(0,0,0,0.5)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}><strong>Próximo Passo Recomendado:</strong> A Inteligência Artificial irá gerar roteiros unindo {intCampeao} com desafios visuais!</div></div>) : (<div style={{ padding: "20px" }}><p style={{ color: "var(--mut)" }}>Conclua os módulos de "Estilos" e "Interesses" para libertar a análise completa do seu perfil pela nossa Inteligência Artificial.</p><div style={{ marginTop: "15px" }}>{!estiloResultadoFinal && <button className="btn btn-sec btn-sm" style={{ margin: "5px" }} onClick={() => setAbaAtiva('estilos')}>Ir para Estilos</button>} {!intCampeao && <button className="btn btn-sec btn-sm" style={{ margin: "5px" }} onClick={() => setAbaAtiva('interesses')}>Ir para Interesses</button>}</div></div>)}
      </div>
    </section>
  );
};