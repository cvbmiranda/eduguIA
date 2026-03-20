import React, { useState, useEffect, useRef } from 'react';

interface LearningStylesProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  salvarPerfilNoBanco: (dados: any) => void;
  setEstiloResultadoFinal: (estilo: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export const LearningStyles: React.FC<LearningStylesProps> = ({
  abaAtiva, setAbaAtiva, salvarPerfilNoBanco, setEstiloResultadoFinal, showToast
}) => {
  const [estiloSubAba, setEstiloSubAba] = useState<'visual' | 'auditivo' | 'textual' | 'pratico'>('visual');
  
  // --- VISUAL (Memória) ---
  const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍎', '🍌', '🍇', '🍉'];
  const [memCartoes, setMemCartoes] = useState<any[]>([]); 
  const [memCliques, setMemCliques] = useState(0); 
  const [memViradas, setMemViradas] = useState<number[]>([]);
  
  const iniciarMemoria = () => { const emb = [...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, virada: false, combinada: false })); setMemCartoes(emb); setMemCliques(0); setMemViradas([]); };
  const clickCartao = (id: number) => { if (memViradas.length === 2) return; const cartao = memCartoes.find(c => c.id === id); if (cartao.virada || cartao.combinada) return; const novas = [...memViradas, id]; setMemViradas(novas); setMemCartoes(p => p.map(c => c.id === id ? { ...c, virada: true } : c)); setMemCliques(p => p + 1); if (novas.length === 2) { const c1 = memCartoes.find(c => c.id === novas[0]); const c2 = memCartoes.find(c => c.id === novas[1]); if (c1.emoji === c2?.emoji) { setTimeout(() => { setMemCartoes(p => p.map(c => novas.includes(c.id) ? { ...c, combinada: true } : c)); setMemViradas([]); }, 500); } else { setTimeout(() => { setMemCartoes(p => p.map(c => novas.includes(c.id) ? { ...c, virada: false } : c)); setMemViradas([]); }, 1000); } } };
  
  // --- AUDITIVO (Sequência) ---
  const [audSeq, setAudSeq] = useState<number[]>([]); const [audUserSeq, setAudUserSeq] = useState<number[]>([]); const [audAtivo, setAudAtivo] = useState<number | null>(null); const [audStatus, setAudStatus] = useState("Ouça e repita a sequência."); const [audBloqueado, setAudBloqueado] = useState(false);
  const coresAuditivo = [ { id: 0, cor: "#ef4444", bg: "#7f1d1d" }, { id: 1, cor: "#3b82f6", bg: "#1e3a8a" }, { id: 2, cor: "#22c55e", bg: "#14532d" }, { id: 3, cor: "#eab308", bg: "#713f12" } ];
  const tocarSequencia = async () => { setAudBloqueado(true); setAudStatus("Memorize a sequência..."); const novaSeq = [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)]; setAudSeq(novaSeq); setAudUserSeq([]); for (let i=0; i<novaSeq.length; i++) { await new Promise(r => setTimeout(r, 600)); setAudAtivo(novaSeq[i]); await new Promise(r => setTimeout(r, 500)); setAudAtivo(null); } setAudStatus("Sua vez! Repita a sequência."); setAudBloqueado(false); };
  const clickAudBotao = (id: number) => { if (audBloqueado || audSeq.length === 0) return; const nova = [...audUserSeq, id]; setAudUserSeq(nova); setAudAtivo(id); setTimeout(() => setAudAtivo(null), 200); if (nova[nova.length - 1] !== audSeq[nova.length - 1]) { setAudStatus("❌ Errado! Tente novamente."); setAudSeq([]); return; } if (nova.length === audSeq.length) { setAudStatus("✅ Sequência correta!"); setAudBloqueado(true); } };
  
  // --- TEXTUAL (Ditado) ---
  const FRASE_ALVO = "A educação transforma vidas"; const [txtInput, setTxtInput] = useState(""); const [txtStatus, setTxtStatus] = useState("");
  const verificarDitado = () => { if (txtInput.trim() === FRASE_ALVO) setTxtStatus("✅ Perfeito!"); else setTxtStatus("❌ Errado. Verifique letras e espaços."); };
  
  // --- PRÁTICO (Cliques) ---
  const [praCliques, setPraCliques] = useState(0); const [praTempo, setPraTempo] = useState(5); const [praJogando, setPraJogando] = useState(false); const timerRef = useRef<any>(null);
  const iniciarPratico = () => { setPraCliques(0); setPraTempo(5); setPraJogando(true); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { setPraTempo(p => { if (p <= 1) { clearInterval(timerRef.current); setPraJogando(false); return 0; } return p - 1; }); }, 1000); };
  const contarClique = () => { if (praJogando) setPraCliques(p => p + 1); };
  
  // Efeito de inicialização
  useEffect(() => { if (abaAtiva === 'estilos' && memCartoes.length === 0) iniciarMemoria(); }, [abaAtiva]);
  
  const concluirTodosEstilos = () => { 
    setEstiloResultadoFinal("Visual 👁️"); 
    salvarPerfilNoBanco({ peda_aprendizagem: "Visual 👁️" }); 
    showToast("✅ Estilos salvos no seu Relatório!", "success"); // Trocado alert por showToast!
    setAbaAtiva("progresso"); 
  };

  return (
    <section className="card">
      <div style={{ textAlign: "center", marginBottom: "20px" }}><h2>🕹️ Estilos de Aprendizagem</h2><p className="mut">Interaja rapidamente em cada estilo e conclua.</p></div>
      <nav className="tabs" style={{ marginBottom: "20px", justifyContent: "flex-start", overflowX: "auto" }}>
        <button className={`tab ${estiloSubAba === 'visual' ? 'active' : ''}`} onClick={() => setEstiloSubAba('visual')}>👁️ Visual</button>
        <button className={`tab ${estiloSubAba === 'auditivo' ? 'active' : ''}`} onClick={() => setEstiloSubAba('auditivo')}>👂 Auditivo</button>
        <button className={`tab ${estiloSubAba === 'textual' ? 'active' : ''}`} onClick={() => setEstiloSubAba('textual')}>📝 Textual</button>
        <button className={`tab ${estiloSubAba === 'pratico' ? 'active' : ''}`} onClick={() => setEstiloSubAba('pratico')}>🔧 Prático</button>
      </nav>
      <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {estiloSubAba === 'visual' && (<div style={{ textAlign: "center" }}><h3 style={{ marginBottom: "5px" }}>👁️ Jogo da Memória Visual</h3><p className="mut" style={{ marginBottom: "20px" }}>Clique nos pares corretos.</p><div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", maxWidth: "300px", margin: "0 auto", marginBottom: "20px" }}>{memCartoes.map(c => (<button key={c.id} className="btn" style={{ height: "60px", fontSize: "24px", background: (c.virada || c.combinada) ? "var(--bg1)" : "var(--b1)", border: "1px solid var(--b2)", cursor: c.combinada ? "default" : "pointer" }} onClick={() => clickCartao(c.id)}>{(c.virada || c.combinada) ? c.emoji : "?"}</button>))}</div><div className="mut">Cliques: {memCliques}</div>{memCartoes.every(c => c.combinada) && memCartoes.length > 0 && <div style={{ color: "#22c55e", marginTop: "10px", fontWeight: "bold" }}>✅ Memória Concluída!</div>}</div>)}
        {estiloSubAba === 'auditivo' && (<div style={{ textAlign: "center" }}><h3 style={{ marginBottom: "5px" }}>👂 Sequência Sonora</h3><p className="mut" style={{ marginBottom: "20px" }}>{audStatus}</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "250px", margin: "0 auto", marginBottom: "20px" }}>{coresAuditivo.map(c => (<button key={c.id} style={{ height: "60px", borderRadius: "10px", border: "none", cursor: audBloqueado ? "not-allowed" : "pointer", background: audAtivo === c.id ? c.cor : c.bg, transition: "background 0.1s" }} onClick={() => clickAudBotao(c.id)}/>))}</div><button className="btn btn-primary" onClick={tocarSequencia} disabled={audBloqueado && audStatus.includes("Memorize")}>🔊 Tocar Sequência</button></div>)}
        {estiloSubAba === 'textual' && (<div style={{ textAlign: "center", width: "100%", maxWidth: "500px" }}><h3 style={{ marginBottom: "5px" }}>📝 Ditado Relâmpago</h3><p className="mut" style={{ marginBottom: "20px" }}>Digite a frase abaixo o mais rápido que puder.</p><div className="card" style={{ background: "var(--bg1)", marginBottom: "15px", fontFamily: "monospace", fontSize: "16px" }}>{FRASE_ALVO}</div><input className="input" style={{ width: "100%", marginBottom: "10px" }} placeholder="Digite aqui..." value={txtInput} onChange={(e) => setTxtInput(e.target.value)}/><button className="btn btn-primary" onClick={verificarDitado} style={{ marginBottom: "10px" }}>✅ Verificar</button><div style={{ color: txtStatus.includes("✅") ? "#22c55e" : "#ef4444", fontWeight: "bold", minHeight: "24px" }}>{txtStatus}</div></div>)}
        {estiloSubAba === 'pratico' && (<div style={{ textAlign: "center" }}><h3 style={{ marginBottom: "5px" }}>🔧 Clique Rápido (Prático)</h3><p className="mut" style={{ marginBottom: "20px" }}>Clique no botão o máximo de vezes em 5 segundos.</p><div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "10px" }}>{praTempo}s</div><div className="mut" style={{ marginBottom: "20px" }}>Cliques: {praCliques}</div>{!praJogando && praTempo === 5 ? (<button className="btn btn-primary" style={{ padding: "15px 30px", fontSize: "18px" }} onClick={iniciarPratico}>Começar!</button>) : praJogando ? (<button className="btn btn-primary" style={{ padding: "15px 30px", fontSize: "18px", background: "#ef4444", borderColor: "#ef4444" }} onClick={contarClique}>CLIQUE!</button>) : (<div><div style={{ color: "#22c55e", fontWeight: "bold", marginBottom: "10px" }}>✅ Fim do tempo!</div><button className="btn btn-sec" onClick={() => { setPraTempo(5); setPraCliques(0); }}>Tentar de novo</button></div>)}</div>)}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}><button className="btn btn-ok" onClick={concluirTodosEstilos}>🚀 Salvar e Ver Progresso</button></div>
    </section>
  );
};