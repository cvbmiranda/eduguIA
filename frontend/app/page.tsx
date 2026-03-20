"use client";
import { useState, useEffect, useRef } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ParkourGame } from "../components/games/ParkourGame";
import { LearningStyles } from "../components/games/LearningStyles";
import { InterestTournament } from "../components/games/InterestTournament";
import { ManagementTab } from "../components/management/ManagementTab";
import { ReportsTab } from "../components/reports/ReportsTab";
import { HomeScreen } from "../components/dashboard/HomeScreen";
import { ProgressScreen } from "../components/dashboard/ProgressScreen";

export default function EduGuIA() {
  // No topo da função EduGuIA
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // --- ESTADOS GERAIS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [userRole, setUserRole] = useState("student");
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

 // --- SISTEMA DE NOTIFICAÇÕES (TOAST) E REFS ---
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };
  const chatInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DE LOGIN ---
  const [matricula, setMatricula] = useState(""); // 👈 Mudamos de email para matricula

  // --- ESTADOS DO CHAT ---
  const [mensagens, setMensagens] = useState([{ role: "assistant", content: "Oi! 👋 Eu sou o Edu, seu assistente virtual do EduGuIA. Vamos conversar um pouco pra montar seu perfil? 😄" }]);

  // ==========================================
  // 💾 FUNÇÃO MESTRA: SALVAR PERFIL DA IA
  // ==========================================
  const salvarPerfilNoBanco = async (dadosAtualizados: any) => {
    if (!loggedUserId) return;
    const token = localStorage.getItem("edg_token");
    try {
      const resGet = await fetch(`${API_URL}/profiles/${loggedUserId}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resGet.ok) {
        const perfilAtual = await resGet.json();
        const novoPerfil = { ...perfilAtual, ...dadosAtualizados };
        await fetch(`${API_URL}/profiles/${loggedUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(novoPerfil)
        });
      }
    } catch (e) {
      console.error("Erro ao salvar no perfil", e);
    }
  };

// ==========================================
  // ⭐ TORNEIO DE INTERESSES
  // ==========================================
  const [intCampeao, setIntCampeao] = useState("");


  // ==========================================
  // 🕹️ ESTILOS DE APRENDIZAGEM
  // ==========================================
  const [estiloResultadoFinal, setEstiloResultadoFinal] = useState<string>("");
  const [hudDisplay, setHudDisplay] = useState({ blocos: 0, velocidade: 4, scoreResiliencia: "0.0" });

  // ==========================================
  // 🗂️ GESTÃO (ESTUDANTES E ESCOLAS)
  // ==========================================
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);

  const carregarDadosGestao = async () => { 
    const token = localStorage.getItem("edg_token"); if (!token) return; 
    try { 
      const resEstudantes = await fetch(`${API_URL}/users/`, { headers: { "Authorization": `Bearer ${token}` } }); 
      if (resEstudantes.ok) { const data = await resEstudantes.json(); setUsuarios(data); } 
      
      const resEscolas = await fetch(`${API_URL}/schools/`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resEscolas.ok) { const data = await resEscolas.json(); setEscolas(data); }
    } catch (e) { console.error("Erro ao carregar dados da gestão"); } 
  };

  useEffect(() => { if (abaAtiva === "gestao" || abaAtiva === "relatorios") carregarDadosGestao(); }, [abaAtiva]);


  // ==========================================
  // 📈 RELATÓRIOS (CONECTADO AO BANCO!)
  // ==========================================
  const [relView, setRelView] = useState<'selecao' | 'turma' | 'individual'>('selecao');


  // ==========================================
  // FUNÇÕES DE LOGIN E CHAT
  // ==========================================
  
  // 👇 A NOVA função de login (bem menor), que recebe os dados do LoginForm.tsx
  const handleLoginSuccess = (token: string, userData: any, profileData: any) => {
    setUserRole(userData.role);
    setLoggedUserId(userData.id);

    setHudDisplay({ blocos: 0, velocidade: 4, scoreResiliencia: "0.0" });
    setEstiloResultadoFinal("");
    setIntCampeao("");
    setMensagens([{ role: "assistant", content: `Olá ${userData.nome}! 👋 Vamos conversar?` }]);

    if (profileData) {
      if (profileData.psico_resiliencia !== "Não avaliado") setHudDisplay(prev => ({ ...prev, scoreResiliencia: profileData.psico_resiliencia }));
      if (profileData.peda_aprendizagem !== "Pendente") setEstiloResultadoFinal(profileData.peda_aprendizagem);
      if (profileData.peda_aptidoes !== "Pendente") setIntCampeao(profileData.peda_aptidoes);
    }

    setIsLoggedIn(true);
    setAbaAtiva("home");
  };
  


  // ==========================================
  // RENDERIZAÇÃO DA TELA
  // ==========================================
  
  // 👇 AQUI NÓS CHAMAMOS O COMPONENTE NOVO!
  if (!isLoggedIn) {
    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        
        {/* Toast pro ecrã de login caso haja erros */}
        {toast.show && (
          <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, background: toast.type === "error" ? "#ef4444" : "#22c55e", color: "white", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontWeight: "bold", transition: "all 0.3s ease", animation: "fadeIn 0.3s" }}>
            {toast.message}
          </div>
        )}
      </>
    );
  }


  // 👇 O RETORNO PRINCIPAL DA TELA COMEÇA AQUI!
  return (
    <div className="container">
      {/* CABEÇALHO E MENU DE NAVEGAÇÃO */}
      <header className="card hdr" role="banner">
        <div><h1 className="brand" style={{ fontSize: '2rem' }}>EduGuIA</h1><div className="mut">Sistema de Perfil Educacional</div></div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge">{userRole}</span>
          <button className="btn btn-sec btn-sm" onClick={() => { localStorage.removeItem("edg_token"); window.location.reload(); }}>🚪 Sair</button>
        </div>
        <nav className="tabs">
          <button className={`tab ${abaAtiva === 'home' ? 'active' : ''}`} onClick={() => setAbaAtiva('home')}>🏠 Início</button>
          <button className={`tab ${abaAtiva === 'chat' ? 'active' : ''}`} onClick={() => setAbaAtiva('chat')}>💬 Chat</button>
          <button className={`tab ${abaAtiva === 'parkour' ? 'active' : ''}`} onClick={() => setAbaAtiva('parkour')}>🎮 Parkour</button>
          <button className={`tab ${abaAtiva === 'estilos' ? 'active' : ''}`} onClick={() => setAbaAtiva('estilos')}>🕹️ Estilos</button>
          <button className={`tab ${abaAtiva === 'interesses' ? 'active' : ''}`} onClick={() => setAbaAtiva('interesses')}>⭐ Interesses</button>
          <button className={`tab ${abaAtiva === 'progresso' ? 'active' : ''}`} onClick={() => setAbaAtiva('progresso')}>📊 Progresso</button>
          {(userRole === 'admin' || userRole === 'school') && (
            <>
              <button className={`tab ${abaAtiva === 'gestao' ? 'active' : ''}`} onClick={() => setAbaAtiva('gestao')}>🗂️ Gestão</button>
              <button className={`tab ${abaAtiva === 'relatorios' ? 'active' : ''}`} onClick={() => { setAbaAtiva('relatorios'); setRelView('selecao'); }}>📈 Relatórios</button>
            </>
          )}
        </nav>
      </header>

      {/* HOME */}
      {abaAtiva === "home" && (
        <HomeScreen 
          setAbaAtiva={setAbaAtiva} 
          mensagens={mensagens} 
          hudDisplay={hudDisplay} 
          estiloResultadoFinal={estiloResultadoFinal} 
          intCampeao={intCampeao} 
        />
      )}

      {/* CHAT */}
      {abaAtiva === "chat" && (
        <ChatWindow 
          loggedUserId={loggedUserId}
          mensagens={mensagens}
          setMensagens={setMensagens}
          setAbaAtiva={setAbaAtiva}
          showToast={showToast}
        />
      )}


      {/* PARKOUR V2 (MOTOR AVANÇADO) */}
      {abaAtiva === "parkour" && (
        <ParkourGame 
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          salvarPerfilNoBanco={salvarPerfilNoBanco}
          setHudDisplay={setHudDisplay}
          showToast={showToast}
        />
      )}

      {/* ESTILOS DE APRENDIZAGEM */}
      {abaAtiva === "estilos" && (
        <LearningStyles
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          salvarPerfilNoBanco={salvarPerfilNoBanco}
          setEstiloResultadoFinal={setEstiloResultadoFinal}
          showToast={showToast}
        />
      )}

      {/* INTERESSES */}
      {abaAtiva === "interesses" && (
        <InterestTournament
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          salvarPerfilNoBanco={salvarPerfilNoBanco}
          intCampeao={intCampeao}
          setIntCampeao={setIntCampeao}
          showToast={showToast}
        />
      )}

      {/* PROGRESSO */}
      {abaAtiva === "progresso" && (
        <ProgressScreen 
          setAbaAtiva={setAbaAtiva} 
          mensagens={mensagens} 
          hudDisplay={hudDisplay} 
          estiloResultadoFinal={estiloResultadoFinal} 
          intCampeao={intCampeao} 
        />
      )}

      {/* ========================================== */}
      {/* 📈 ABA DE RELATÓRIOS (CONECTADA AO BANCO!) */}
      {/* ========================================== */}
      {abaAtiva === "relatorios" && (
        <ReportsTab 
          usuarios={usuarios}
          relView={relView}
          setRelView={setRelView}
        />
      )}


      {/* ========================================== */}
      {/* 🗂️ GESTÃO */}
      {/* ========================================== */}
      {abaAtiva === "gestao" && (
        <ManagementTab 
          usuarios={usuarios}
          escolas={escolas}
          carregarDadosGestao={carregarDadosGestao}
          showToast={showToast}
        />
      )}


{/* COMPONENTE VISUAL DO TOAST GLOBAL */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, background: toast.type === "error" ? "#ef4444" : "#22c55e", color: "white", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontWeight: "bold", transition: "all 0.3s ease", animation: "fadeIn 0.3s" }}>
          {toast.message}
        </div>
      )}

    </div>
  );
}