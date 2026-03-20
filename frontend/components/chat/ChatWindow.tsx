import React, { useState, useRef } from 'react';
import { API_URL } from '../../services/api';

interface ChatWindowProps {
  loggedUserId: number | null;
  mensagens: any[];
  setMensagens: React.Dispatch<React.SetStateAction<any[]>>;
  setAbaAtiva: (aba: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  loggedUserId, mensagens, setMensagens, setAbaAtiva, showToast 
}) => {
  const [inputChat, setInputChat] = useState("");
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleEnviarMensagem = async (e?: any) => { 
    if (e) e.preventDefault(); 
    if (!inputChat.trim() || enviandoChat) return; 
    
    const novaMensagem = { role: "user", content: inputChat }; 
    setMensagens((prev) => [...prev, novaMensagem]); 
    setInputChat(""); 
    setEnviandoChat(true); 
    
    try { 
      const token = localStorage.getItem("edg_token"); 
      const response = await fetch(`${API_URL}/chat`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
        body: JSON.stringify({ pergunta: novaMensagem.content, historico: mensagens }) 
      }); 
      
      if (response.ok) { 
        const data = await response.json(); 
        setMensagens((prev) => [...prev, { role: "assistant", content: data.resposta }]); 
      } else { 
        setMensagens((prev) => [...prev, { role: "assistant", content: `❌ Erro no servidor.` }]); 
      } 
    } catch (error: any) { 
      setMensagens((prev) => [...prev, { role: "assistant", content: `❌ Erro de conexão.` }]); 
    } finally { 
      setEnviandoChat(false); 
      setTimeout(() => chatInputRef.current?.focus(), 100); 
    }
  };

  const handleAnalisarEntrevista = async () => {
    if (!loggedUserId) return;
    
    // 👇 1. Trava de Segurança
    if (mensagens.length <= 2) {
      showToast("A conversa está muito curta. Converse mais um pouco com o Edu!", "warning");
      return;
    }

    setIsExtracting(true); // Bloqueia o botão
    showToast("🧠 A IA está a ler o seu histórico e a extrair o seu perfil...", "warning");
    
    const token = localStorage.getItem("edg_token");
    
    try {
      const res = await fetch(`${API_URL}/chat/extract/${loggedUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(mensagens)
      });
      
      if (res.ok) {
        showToast("✅ IA finalizou! Perfil salvo com sucesso.", "success");
        setAbaAtiva("progresso");
      } else {
        const errData = await res.json();
        showToast(`❌ Erro na OpenAI: ${errData.detail}`, "error");
      }
    } catch (e) {
      showToast("❌ Falha de ligação ao servidor.", "error");
    } finally {
      setIsExtracting(false); // Liberta o botão no final (dando erro ou sucesso)
    }
  };

  return (
    <section className="card">
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h2>💬 Entrevista Educacional</h2>
        <p className="mut">Responda às perguntas para avançar.</p>
      </div>
      <div className="chat-wrap">
        <div className="chat-log" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mensagens.map((msg, idx) => (
            <div key={idx} className={`msg ${msg.role}`}>
              <strong>{msg.role === "user" ? "Você" : "Edu"}:</strong><br/>{msg.content}
            </div>
          ))}
          {enviandoChat && (<div className="msg assistant"><span className="mut">Edu está a escrever... ⏳</span></div>)}
        </div>
        <div className="row">
          <input 
            ref={chatInputRef} className="input" placeholder="Escreva a sua mensagem..." 
            maxLength={500} value={inputChat} onChange={(e) => setInputChat(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter') handleEnviarMensagem(); }} disabled={enviandoChat} 
          />
          <button className="btn btn-primary" type="button" onClick={handleEnviarMensagem} disabled={enviandoChat} style={{ cursor: enviandoChat ? "not-allowed" : "pointer" }}>
            📤 Enviar
          </button>
        </div>
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <button 
            className="btn btn-ok" 
            type="button" 
            onClick={handleAnalisarEntrevista} 
            disabled={isExtracting} // 👈 Fica cinza enquanto carrega
            style={{ width: "100%", padding: "10px", fontWeight: "bold", cursor: isExtracting ? "not-allowed" : "pointer" }}
          >
            {isExtracting ? "🧠 A extrair dados de forma invisível... ⏳" : "🧠 Encerrar Entrevista e Gerar Perfil IA"}
          </button>
        </div> 
      </div>
    </section>
  );
};