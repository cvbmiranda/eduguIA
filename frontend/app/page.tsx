"use client";
import { useState, useEffect, useRef } from "react";

export default function EduGuIA() {
  // --- ESTADOS GERAIS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("home");
  const [userRole, setUserRole] = useState("student");
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

  // --- ESTADOS DE LOGIN ---
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // --- ESTADOS DO CHAT ---
  const [inputChat, setInputChat] = useState("");
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [mensagens, setMensagens] = useState([{ role: "assistant", content: "Oi! 👋 Eu sou o Edu, seu assistente virtual do EduGuIA. Vamos conversar um pouco pra montar seu perfil? 😄" }]);

  // ==========================================
  // 💾 FUNÇÃO MESTRA: SALVAR PERFIL DA IA
  // ==========================================
  const salvarPerfilNoBanco = async (dadosAtualizados: any) => {
    if (!loggedUserId) return;
    const token = localStorage.getItem("edg_token");
    try {
      const resGet = await fetch(`http://localhost:8000/profiles/${loggedUserId}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resGet.ok) {
        const perfilAtual = await resGet.json();
        const novoPerfil = { ...perfilAtual, ...dadosAtualizados };
        await fetch(`http://localhost:8000/profiles/${loggedUserId}`, {
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
  const DUELOS = [
    { a: { p: "Redes sociais", i: "📱 Smartphone" }, b: { p: "Séries e streaming", i: "🎬 Plataforma de streaming" } },
    { a: { p: "Inteligência Artificial", i: "🤖 Robô" }, b: { p: "Música", i: "🎛️ Mesa de som" } },
    { a: { p: "Esportes", i: "⚽ Bola" }, b: { p: "Cultura geek", i: "📖 HQ ou mangá" } }
  ];
  const [intRound, setIntRound] = useState(0); const [intScores, setIntScores] = useState<Record<string, number>>({}); const [intPulos, setIntPulos] = useState(0); const [intCampeao, setIntCampeao] = useState("");
  const handleEscolhaInteresse = (profile: string) => { const newScores = { ...intScores, [profile]: (intScores[profile] || 0) + 1 }; setIntScores(newScores); avancarRodada(newScores); };
  const pularParInteresse = () => { if (intPulos < 5) { setIntPulos(p => p + 1); avancarRodada(intScores); } else { alert("Máximo de 5 pulos atingido!"); } };
  const avancarRodada = (currentScores: Record<string, number>) => { if (intRound < DUELOS.length - 1) { setIntRound(p => p + 1); } else { let maxScore = -1; let winner = ""; for (const [prof, score] of Object.entries(currentScores)) { if (score > maxScore) { maxScore = score; winner = prof; } } setIntCampeao(winner || "Generalista"); } };
  const reiniciarTorneio = () => { setIntRound(0); setIntScores({}); setIntPulos(0); setIntCampeao(""); };
  const concluirTorneio = () => { 
    salvarPerfilNoBanco({ peda_aptidoes: intCampeao }); 
    alert(`⭐ Perfil (${intCampeao}) salvo no seu Relatório!`); 
    setAbaAtiva("progresso"); 
  };

  // ==========================================
  // 🕹️ ESTILOS DE APRENDIZAGEM
  // ==========================================
  const [estiloSubAba, setEstiloSubAba] = useState<'visual' | 'auditivo' | 'textual' | 'pratico'>('visual');
  const [estiloResultadoFinal, setEstiloResultadoFinal] = useState<string>(""); 
  const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍎', '🍌', '🍇', '🍉'];
  const [memCartoes, setMemCartoes] = useState<any[]>([]); const [memCliques, setMemCliques] = useState(0); const [memViradas, setMemViradas] = useState<number[]>([]);
  const iniciarMemoria = () => { const emb = [...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, virada: false, combinada: false })); setMemCartoes(emb); setMemCliques(0); setMemViradas([]); };
  const clickCartao = (id: number) => { if (memViradas.length === 2) return; const cartao = memCartoes.find(c => c.id === id); if (cartao.virada || cartao.combinada) return; const novas = [...memViradas, id]; setMemViradas(novas); setMemCartoes(p => p.map(c => c.id === id ? { ...c, virada: true } : c)); setMemCliques(p => p + 1); if (novas.length === 2) { const c1 = memCartoes.find(c => c.id === novas[0]); const c2 = memCartoes.find(c => c.id === novas[1]); if (c1.emoji === c2?.emoji) { setTimeout(() => { setMemCartoes(p => p.map(c => novas.includes(c.id) ? { ...c, combinada: true } : c)); setMemViradas([]); }, 500); } else { setTimeout(() => { setMemCartoes(p => p.map(c => novas.includes(c.id) ? { ...c, virada: false } : c)); setMemViradas([]); }, 1000); } } };
  const [audSeq, setAudSeq] = useState<number[]>([]); const [audUserSeq, setAudUserSeq] = useState<number[]>([]); const [audAtivo, setAudAtivo] = useState<number | null>(null); const [audStatus, setAudStatus] = useState("Ouça e repita a sequência."); const [audBloqueado, setAudBloqueado] = useState(false);
  const coresAuditivo = [ { id: 0, cor: "#ef4444", bg: "#7f1d1d" }, { id: 1, cor: "#3b82f6", bg: "#1e3a8a" }, { id: 2, cor: "#22c55e", bg: "#14532d" }, { id: 3, cor: "#eab308", bg: "#713f12" } ];
  const tocarSequencia = async () => { setAudBloqueado(true); setAudStatus("Memorize a sequência..."); const novaSeq = [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)]; setAudSeq(novaSeq); setAudUserSeq([]); for (let i=0; i<novaSeq.length; i++) { await new Promise(r => setTimeout(r, 600)); setAudAtivo(novaSeq[i]); await new Promise(r => setTimeout(r, 500)); setAudAtivo(null); } setAudStatus("Sua vez! Repita a sequência."); setAudBloqueado(false); };
  const clickAudBotao = (id: number) => { if (audBloqueado || audSeq.length === 0) return; const nova = [...audUserSeq, id]; setAudUserSeq(nova); setAudAtivo(id); setTimeout(() => setAudAtivo(null), 200); if (nova[nova.length - 1] !== audSeq[nova.length - 1]) { setAudStatus("❌ Errado! Tente novamente."); setAudSeq([]); return; } if (nova.length === audSeq.length) { setAudStatus("✅ Sequência correta!"); setAudBloqueado(true); } };
  const FRASE_ALVO = "A educação transforma vidas"; const [txtInput, setTxtInput] = useState(""); const [txtStatus, setTxtStatus] = useState("");
  const verificarDitado = () => { if (txtInput.trim() === FRASE_ALVO) setTxtStatus("✅ Perfeito!"); else setTxtStatus("❌ Errado. Verifique letras e espaços."); };
  const [praCliques, setPraCliques] = useState(0); const [praTempo, setPraTempo] = useState(5); const [praJogando, setPraJogando] = useState(false); const timerRef = useRef<any>(null);
  const iniciarPratico = () => { setPraCliques(0); setPraTempo(5); setPraJogando(true); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { setPraTempo(p => { if (p <= 1) { clearInterval(timerRef.current); setPraJogando(false); return 0; } return p - 1; }); }, 1000); };
  const contarClique = () => { if (praJogando) setPraCliques(p => p + 1); };
  useEffect(() => { if (abaAtiva === 'estilos' && memCartoes.length === 0) iniciarMemoria(); }, [abaAtiva]);
  const concluirTodosEstilos = () => { 
    setEstiloResultadoFinal("Visual 👁️"); 
    salvarPerfilNoBanco({ peda_aprendizagem: "Visual 👁️" }); 
    alert("✅ Estilos salvos no seu Relatório!"); 
    setAbaAtiva("progresso"); 
  };

  // ==========================================
  // 🎮 PARKOUR
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [pkStatus, setPkStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [hudDisplay, setHudDisplay] = useState({ blocos: 0, velocidade: 4, scoreResiliencia: "0.0" });
  const gameState = useRef<any>({ running: false, speed: 4, score: 0, pl: { x: 100, y: 220, w: 30, h: 30, vy: 0, onGround: true, color: "" }, plats: [], stars: [] });
  const initStars = (W: number, H: number) => Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, size: Math.random() * 2, speed: Math.random() * 0.5 + 0.1 }));
  const gerarProximaPlataforma = (W: number, speed: number, lastX: number) => ({ x: lastX + Math.random() * (100 + speed * 15 - (60 + speed * 10)) + (60 + speed * 10), y: [220, 250, 280][Math.floor(Math.random() * 3)], w: Math.random() * 90 + 60, h: 20, passed: false });
  const iniciarParkour = () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const playerGrad = ctx.createLinearGradient(0, 0, 0, 30); playerGrad.addColorStop(0, "#7dd3fc"); playerGrad.addColorStop(1, "#0ea5e9"); gameState.current = { running: true, speed: 4.0, score: 0, pl: { x: 100, y: 200, w: 30, h: 30, vy: 0, onGround: false, color: playerGrad }, plats: [{ x: 50, y: 250, w: 400, h: 20, passed: true }], stars: initStars(canvasRef.current!.width, canvasRef.current!.height) }; setPkStatus('playing'); updateHud(); requestRef.current = requestAnimationFrame(loopEngine); };
  const pararParkour = () => { if (gameState.current) gameState.current.running = false; if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  const pularParkour = () => { const s = gameState.current; if (s.running && s.pl.onGround) { s.pl.vy = -12.5; s.pl.onGround = false; } };
  const updateHud = () => { const s = gameState.current; setHudDisplay({ blocos: s.score, velocidade: parseFloat(s.speed.toFixed(1)), scoreResiliencia: Math.min(5.0, (s.score / 50) * 5.0).toFixed(1) }); };
  const loopEngine = () => { const canvas = canvasRef.current; const s = gameState.current; if (!canvas || !s.running) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const W = canvas.width; const H = canvas.height; ctx.fillStyle = "#0b1222"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#ffffff44"; s.stars.forEach((star: any) => { ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); star.x -= star.speed * (s.speed / 2); if (star.x < 0) star.x = W; }); const pl = s.pl; pl.vy += 0.7; pl.y += pl.vy; pl.onGround = false; const platGrad = ctx.createLinearGradient(0, 0, W, 0); platGrad.addColorStop(0, "#3b82f6"); platGrad.addColorStop(1, "#60a5fa"); ctx.fillStyle = platGrad; s.plats = s.plats.filter((p: any) => p.x + p.w > -50); s.plats.forEach((p: any) => { p.x -= s.speed; ctx.shadowColor = "#3b82f6"; ctx.shadowBlur = 8; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.shadowBlur = 0; if (pl.vy >= 0 && pl.x + pl.w > p.x + 4 && pl.x < p.x + p.w - 4 && pl.y + pl.h >= p.y && pl.y + pl.h <= p.y + pl.vy + 4) { pl.y = p.y - pl.h; pl.vy = 0; pl.onGround = true; } if (!p.passed && pl.x > p.x + p.w) { p.passed = true; s.score++; if (s.score % 3 === 0) s.speed += 0.3; updateHud(); } }); let ultimaPlat = s.plats[s.plats.length - 1]; let limiteDireito = ultimaPlat ? (ultimaPlat.x + ultimaPlat.w) : 0; while (limiteDireito < W + 300) { const newPlat = gerarProximaPlataforma(W, s.speed, limiteDireito); s.plats.push(newPlat); ultimaPlat = newPlat; limiteDireito = ultimaPlat.x + ultimaPlat.w; } ctx.fillStyle = pl.color; ctx.shadowColor = "#7dd3fc"; ctx.shadowBlur = 12; ctx.fillRect(pl.x, pl.y, pl.w, pl.h); ctx.shadowBlur = 0; if (pl.y > H) { pararParkour(); setPkStatus('gameover'); return; } requestRef.current = requestAnimationFrame(loopEngine); };
  useEffect(() => { if (abaAtiva === "parkour") setPkStatus('idle'); else pararParkour(); }, [abaAtiva]);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if ((e.code === 'Space' || e.code === 'ArrowUp') && abaAtiva === 'parkour') { e.preventDefault(); if (pkStatus === 'idle' || pkStatus === 'gameover') iniciarParkour(); else if (pkStatus === 'playing') pularParkour(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [abaAtiva, pkStatus]);

  // ==========================================
  // 🗂️ GESTÃO (ESTUDANTES E ESCOLAS)
  // ==========================================
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [msgGestao, setMsgGestao] = useState({ texto: "", erro: false });

  const [textoRecarregarEstudante, setTextoRecarregarEstudante] = useState("⟳ Recarregar");
  const [textoRecarregarEscola, setTextoRecarregarEscola] = useState("⟳ Recarregar");

  const [novoEstudante, setNovoEstudante] = useState({ id: null as number | null, matricula: "", nome: "", role: "student", turma: "", email: "", senha: "", school_id: "", ativo: "Sim" });
  const [novaEscola, setNovaEscola] = useState({ id: null as number | null, nome: "", contato: "", ativa: "Sim" });

  const carregarDadosGestao = async (tipo?: 'estudantes' | 'escolas') => { 
    const token = localStorage.getItem("edg_token"); if (!token) return; 
    try { 
      const resEstudantes = await fetch("http://localhost:8000/users/", { headers: { "Authorization": `Bearer ${token}` } }); 
      if (resEstudantes.ok) { const data = await resEstudantes.json(); setUsuarios(data); } 
      
      const resEscolas = await fetch("http://localhost:8000/schools/", { headers: { "Authorization": `Bearer ${token}` } });
      if (resEscolas.ok) { const data = await resEscolas.json(); setEscolas(data); }
      
      if (tipo === 'estudantes') { 
        setTextoRecarregarEstudante("✅ Atualizado!"); 
        setTimeout(() => setTextoRecarregarEstudante("⟳ Recarregar"), 2000); 
      } else if (tipo === 'escolas') { 
        setTextoRecarregarEscola("✅ Atualizado!"); 
        setTimeout(() => setTextoRecarregarEscola("⟳ Recarregar"), 2000); 
      }
    } catch (e) { console.error("Erro ao carregar dados da gestão"); } 
  };

  useEffect(() => { if (abaAtiva === "gestao" || abaAtiva === "relatorios") carregarDadosGestao(); }, [abaAtiva]);

  const abrirModalNovoEstudante = () => { setNovoEstudante({ id: null, matricula: "", nome: "", role: "student", turma: "", email: "", senha: "", school_id: "", ativo: "Sim" }); setMsgGestao({ texto: "", erro: false }); setShowStudentModal(true); };
  const abrirModalEditarEstudante = (u: any) => { setNovoEstudante({ id: u.id, matricula: u.matricula || "", nome: u.nome, role: u.role, turma: u.turma || "", email: u.email, senha: "", school_id: u.school_id ? String(u.school_id) : "", ativo: u.is_active ? "Sim" : "Não" }); setMsgGestao({ texto: "", erro: false }); setShowStudentModal(true); };
  const handleSalvarEstudante = async (e: React.FormEvent) => { e.preventDefault(); setMsgGestao({ texto: "Salvando...", erro: false }); const token = localStorage.getItem("edg_token"); const isEdit = novoEstudante.id !== null; const url = isEdit ? `http://localhost:8000/users/${novoEstudante.id}` : "http://localhost:8000/users/"; try { const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(novoEstudante) }); if (res.ok) { setMsgGestao({ texto: "✅ Salvo com sucesso!", erro: false }); carregarDadosGestao(); setTimeout(() => setShowStudentModal(false), 1000); } else { const data = await res.json(); setMsgGestao({ texto: `❌ Erro: ${data.detail}`, erro: true }); } } catch (err) { setMsgGestao({ texto: "❌ Erro de conexão.", erro: true }); } };
  const handleExcluirUsuario = async (id: number, nome: string) => { if (!confirm(`Apagar ${nome}?`)) return; const t = localStorage.getItem("edg_token"); await fetch(`http://localhost:8000/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); carregarDadosGestao(); };

  const abrirModalNovaEscola = () => { setNovaEscola({ id: null, nome: "", contato: "", ativa: "Sim" }); setMsgGestao({ texto: "", erro: false }); setShowSchoolModal(true); };
  const abrirModalEditarEscola = (e: any) => { setNovaEscola({ id: e.id, nome: e.nome, contato: e.contato || "", ativa: e.ativa }); setMsgGestao({ texto: "", erro: false }); setShowSchoolModal(true); };
  const handleSalvarEscola = async (e: React.FormEvent) => { e.preventDefault(); const token = localStorage.getItem("edg_token"); const isEdit = novaEscola.id !== null; const url = isEdit ? `http://localhost:8000/schools/${novaEscola.id}` : "http://localhost:8000/schools/"; try { const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ nome: novaEscola.nome, contato: novaEscola.contato, ativa: novaEscola.ativa }) }); if (res.ok) { alert("✅ Salvo!"); setShowSchoolModal(false); carregarDadosGestao(); } else { alert("❌ Erro"); } } catch (err) { alert("❌ Erro de conexão."); } };
  const handleExcluirEscola = async (id: number, nome: string) => { if (!confirm(`Apagar escola ${nome}?`)) return; const t = localStorage.getItem("edg_token"); await fetch(`http://localhost:8000/schools/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); carregarDadosGestao(); };

  // ==========================================
  // 📈 RELATÓRIOS (CONECTADO AO BANCO!)
  // ==========================================
  const [relView, setRelView] = useState<'selecao' | 'turma' | 'individual'>('selecao');
  const [relTurmaSel, setRelTurmaSel] = useState("");
  const [relAlunoSel, setRelAlunoSel] = useState<any>(null);
  
  const [perfilAluno, setPerfilAluno] = useState<any>(null);

  const turmasDisponiveis = Array.from(new Set(usuarios.filter(u => u.turma).map(u => u.turma)));
  const alunosDaTurma = usuarios.filter(u => u.turma === relTurmaSel && u.role === 'student');

  const carregarPerfilAluno = async (id: number) => {
    const token = localStorage.getItem("edg_token");
    try {
      const res = await fetch(`http://localhost:8000/profiles/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPerfilAluno(data);
      } else {
        setPerfilAluno(null);
      }
    } catch (e) {
      console.error(e);
      setPerfilAluno(null);
    }
  };

  const mockDadosTurma = {
    socioeconomico: { tempoMedio: "1.5h/dia", acessoInternet: "85%", possuiEquip: "90% Celular / 40% PC" },
    psicologico: { vulnerabilidade: "15% Alta", confianca: "Média-Alta", bullying: "Nenhum caso grave", atencao: "3 alunos demandam atenção focada" },
    pedagogico: { intelDominantes: "40% Lógico, 30% Linguística", aprendizado: "50% Visual, 30% Prático", metEficazes: "Gamificação (Alta eficácia)", aptidoes: "1º Matemática, 2º Biologia", autonomia: "25% com Alta Autonomia" },
    abordagem: { linguagem: "Dinâmica, Interativa e Desafiadora", recursos: "Simuladores visuais, Quizzes competitivos, Debates curtos" }
  };

  // ==========================================
  // FUNÇÕES DE LOGIN E CHAT
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => { 
    e.preventDefault(); setCarregando(true); setErro(""); 
    if (!email || !senha) { setErro("Preencha email e senha"); setCarregando(false); return; } 
    try { 
      const fd = new URLSearchParams(); fd.append("username", email); fd.append("password", senha); 
      const res = await fetch("http://localhost:8000/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: fd.toString() }); 
      if (!res.ok) throw new Error("Email ou senha incorretos"); 
      const data = await res.json(); localStorage.setItem("edg_token", data.access_token); setIsLoggedIn(true); 
      
      const resMe = await fetch("http://localhost:8000/users/me", { headers: { "Authorization": `Bearer ${data.access_token}` } });
      if (resMe.ok) { 
        const userData = await resMe.json(); 
        setUserRole(userData.role); 
        setLoggedUserId(userData.id); 

        // Zera a tela pro novo login
        setHudDisplay({ blocos: 0, velocidade: 4, scoreResiliencia: "0.0" });
        setEstiloResultadoFinal("");
        setIntCampeao("");
        setMensagens([{ role: "assistant", content: `Oi ${userData.nome}! 👋 Vamos conversar?` }]);

        // Puxa o progresso do usuário do banco
        const resProfile = await fetch(`http://localhost:8000/profiles/${userData.id}`, { headers: { "Authorization": `Bearer ${data.access_token}` } });
        if (resProfile.ok) {
          const userProfile = await resProfile.json();
          if (userProfile.psico_resiliencia !== "Não avaliado") setHudDisplay(prev => ({ ...prev, scoreResiliencia: userProfile.psico_resiliencia }));
          if (userProfile.peda_aprendizagem !== "Pendente") setEstiloResultadoFinal(userProfile.peda_aprendizagem);
          if (userProfile.peda_aptidoes !== "Pendente") setIntCampeao(userProfile.peda_aptidoes);
        }
      }
    } catch (err: any) { setErro(err.message === "Failed to fetch" ? "Erro de conexão" : err.message); } finally { setCarregando(false); } 
  };
  
  const handleEnviarMensagem = async (e?: any) => { 
    if (e) e.preventDefault(); if (!inputChat.trim() || enviandoChat) return; 
    const novaMensagem = { role: "user", content: inputChat }; setMensagens((prev) => [...prev, novaMensagem]); setInputChat(""); setEnviandoChat(true); 
    try { 
      const token = localStorage.getItem("edg_token"); 
      const response = await fetch("http://localhost:8000/chat", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ pergunta: novaMensagem.content, historico: mensagens }) }); 
      if (response.ok) { const data = await response.json(); setMensagens((prev) => [...prev, { role: "assistant", content: data.resposta }]); } 
      else { setMensagens((prev) => [...prev, { role: "assistant", content: `❌ Erro no servidor.` }]); } 
    } catch (error: any) { setMensagens((prev) => [...prev, { role: "assistant", content: `❌ Erro de conexão.` }]); } finally { setEnviandoChat(false); } 
  };

  // 👇 NOVA FUNÇÃO: EXTRAIR DADOS COM A IA
  const handleAnalisarEntrevista = async () => {
    if (!loggedUserId) return;
    const token = localStorage.getItem("edg_token");
    alert("🧠 A IA está lendo o seu histórico e extraindo o seu perfil...");
    try {
      const res = await fetch(`http://localhost:8000/chat/extract/${loggedUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(mensagens)
      });
      
      if (res.ok) {
        alert("✅ IA finalizou! Seu perfil socioeconômico e emocional foi salvo no banco de dados.");
        setAbaAtiva("progresso");
      } else {
        const errData = await res.json();
        alert(`❌ Erro no Backend (OpenAI): ${errData.detail}`);
      }
    } catch (e) {
      alert("❌ Falha de conexão com o servidor.");
      console.error(e);
    }
  };


  // ==========================================
  // RENDERIZAÇÃO DA TELA
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 className="brand" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>EduGuIA</h1>
          <p className="mut" style={{ marginBottom: '16px' }}>Sistema de Perfil Educacional</p>
          {erro && <div className="alert a-err">{erro}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <button className="btn btn-primary" type="submit" disabled={carregando} style={{ justifyContent: 'center' }}>{carregando ? "Entrando..." : "Entrar"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="card hdr" role="banner">
        <div><h1 className="brand" style={{ fontSize: '2rem' }}>EduGuIA</h1><div className="mut">Sistema de Perfil Educacional</div></div>
        {/* 👇 Botão de SAIR corrigido com reload para limpar dados fantasmas */}
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
        <section className="card">
          <div style={{ textAlign: "center", marginBottom: "10px" }}><h2>👋 Bem-vindo!</h2><p className="mut">Complete os módulos para gerar seu perfil educacional.</p></div>
          <div className="grid grid-auto">
            <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('chat')}><div style={{ fontSize: "44px" }}>💬</div><h3 style={{ margin: "8px 0" }}>Entrevista Inicial</h3><div className="progress"><span style={{ width: mensagens.length > 2 ? "100%" : "0%", background: mensagens.length > 2 ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{mensagens.length > 2 ? "Iniciado" : "Não iniciado"}</div></article>
            <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('parkour')}><div style={{ fontSize: "44px" }}>🎮</div><h3 style={{ margin: "8px 0" }}>Parkour da Resiliência</h3><div className="progress"><span style={{ width: hudDisplay.scoreResiliencia !== "0.0" ? "100%" : "0%", background: hudDisplay.scoreResiliencia !== "0.0" ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{hudDisplay.scoreResiliencia !== "0.0" ? "Concluído" : "Não iniciado"}</div></article>
            <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('estilos')}><div style={{ fontSize: "44px" }}>🕹️</div><h3 style={{ margin: "8px 0" }}>Estilos de Aprendizagem</h3><div className="progress"><span style={{ width: estiloResultadoFinal ? "100%" : "0%", background: estiloResultadoFinal ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{estiloResultadoFinal ? "Concluído" : "Não iniciado"}</div></article>
            <article className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setAbaAtiva('interesses')}><div style={{ fontSize: "44px" }}>⭐</div><h3 style={{ margin: "8px 0" }}>Torneio de Interesses</h3><div className="progress"><span style={{ width: intCampeao ? "100%" : "0%", background: intCampeao ? "#22c55e" : "" }}></span></div><div className="mut" style={{ marginTop: "8px" }}>{intCampeao ? "Concluído" : "Não iniciado"}</div></article>
          </div>
        </section>
      )}

      {/* CHAT */}
      {abaAtiva === "chat" && (
        <section className="card">
          <div style={{ textAlign: "center", marginBottom: "10px" }}><h2>💬 Entrevista Educacional</h2><p className="mut">Responda às perguntas para avançar.</p></div>
          <div className="chat-wrap">
            <div className="chat-log" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mensagens.map((msg, idx) => (<div key={idx} className={`msg ${msg.role}`}><strong>{msg.role === "user" ? "Você" : "Edu"}:</strong><br/>{msg.content}</div>))}
              {enviandoChat && (<div className="msg assistant"><span className="mut">Edu está digitando... ⏳</span></div>)}
            </div>
            <div className="row">
              <input className="input" placeholder="Digite sua mensagem..." maxLength={500} value={inputChat} onChange={(e) => setInputChat(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleEnviarMensagem(); }} disabled={enviandoChat} />
              <button className="btn btn-primary" type="button" onClick={handleEnviarMensagem} disabled={enviandoChat} style={{ cursor: enviandoChat ? "not-allowed" : "pointer" }}>📤 Enviar</button>
            </div>
            {/* 👇 NOVO BOTÃO DA IA - AGORA ELE ESTÁ AQUI! */}
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button className="btn btn-ok" type="button" onClick={handleAnalisarEntrevista} style={{ width: "100%", padding: "10px", fontWeight: "bold" }}>
                🧠 Encerrar Entrevista e Gerar Perfil IA
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PARKOUR */}
      {abaAtiva === "parkour" && (
        <section className="card">
          <div style={{ textAlign: "center", marginBottom: "10px" }}><h2>🎮 Parkour da Resiliência</h2><p className="mut">Pule de bloco em bloco. Se cair, o jogo acaba!</p></div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "12px" }}>
            <div className="badge">Blocos: <strong style={{ marginLeft: "6px" }}>{hudDisplay.blocos}</strong></div>
            <div className="badge">Velocidade: <strong style={{ marginLeft: "6px" }}>{hudDisplay.velocidade}x</strong></div>
            <div className="badge">Score: <strong style={{ marginLeft: "6px" }}>{hudDisplay.scoreResiliencia}</strong></div>
          </div>
          <div className="card" style={{ position: "relative", textAlign: "center", padding: "0", overflow: "hidden", boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}>
            {pkStatus === 'idle' && (<div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}><h3 style={{ color: "#fff", fontSize: "24px", marginBottom: "10px" }}>Pronto para pular?</h3><button className="btn btn-primary" onClick={iniciarParkour}>▶️ Iniciar Jogo</button></div>)}
            {pkStatus === 'gameover' && (<div style={{ position: "absolute", inset: 0, background: "rgba(239, 68, 68, 0.2)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}><h2 style={{ color: "#ef4444", fontSize: "32px", fontWeight: "900", marginBottom: "5px", textShadow: "0 0 10px rgba(0,0,0,0.8)" }}>GAME OVER</h2><p style={{ color: "#fff", marginBottom: "15px", fontWeight: "bold" }}>Você superou {hudDisplay.blocos} blocos!</p><button className="btn btn-warn" onClick={iniciarParkour} style={{ padding: "12px 24px", fontSize: "18px" }}>🔄 Tentar Novamente</button></div>)}
            <canvas ref={canvasRef} width="720" height="350" style={{ background: "#0b1222", borderRadius: "10px", border: "2px solid #1e3a8a", display: "block", margin: "0 auto", maxWidth: "100%" }}/>
          </div>
          <div className="row" style={{ justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
             <button className="btn btn-primary" type="button" onClick={() => pkStatus === 'playing' ? pularParkour() : iniciarParkour()}>{pkStatus === 'playing' ? '🔼 Pular (ESPAÇO)' : '▶️ Iniciar Jogo (ESPAÇO)'}</button>
             <button className="btn btn-ok" type="button" onClick={() => { 
                pararParkour(); 
                salvarPerfilNoBanco({ psico_resiliencia: hudDisplay.scoreResiliencia });
                alert(`🏁 Score salvo: ${hudDisplay.scoreResiliencia}/5.0`); 
                setAbaAtiva("progresso"); 
              }}>🏁 Salvar Score e Sair</button>
          </div>
        </section>
      )}

      {/* ESTILOS */}
      {abaAtiva === "estilos" && (
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
      )}

      {/* INTERESSES */}
      {abaAtiva === "interesses" && (
        <section className="card">
          <div style={{ textAlign: "center", marginBottom: "20px" }}><h2>⭐ Torneio de Interesses</h2><p className="mut">Escolha entre pares para montar seu ranking.</p></div>
          <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}>
            {intCampeao === "" ? (
              <div>
                <div style={{ width: "100%", height: "6px", background: "#0b1222", borderRadius: "3px", marginBottom: "15px", border: "1px solid #1e3a8a" }}><div style={{ width: `${(intRound / 30) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: "3px", transition: "width 0.3s" }}></div></div>
                <div className="mut" style={{ fontSize: "14px", marginBottom: "20px" }}>Par {intRound + 1} de 30 • {intPulos} pulos (máx. 5)</div>
                <div style={{ width: "100%", height: "250px", border: "1px solid #1e3a8a", borderRadius: "8px", background: "#0b1222", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", paddingLeft: "30px", margin: "0 auto", maxWidth: "800px" }}>
                  <button className="btn" style={{ width: "280px", height: "75px", background: "transparent", border: "1px solid #1e3a8a", color: "#fff", textAlign: "left", paddingLeft: "20px", fontSize: "18px", cursor: "pointer", transition: "all 0.2s" }} onClick={() => handleEscolhaInteresse(DUELOS[intRound].a.p)} onMouseOver={(e) => e.currentTarget.style.background = "#1e3a8a"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>{DUELOS[intRound].a.i}</button>
                  <button className="btn" style={{ width: "280px", height: "75px", background: "transparent", border: "1px solid #1e3a8a", color: "#fff", textAlign: "left", paddingLeft: "20px", fontSize: "18px", cursor: "pointer", transition: "all 0.2s", marginTop: "-1px" }} onClick={() => handleEscolhaInteresse(DUELOS[intRound].b.p)} onMouseOver={(e) => e.currentTarget.style.background = "#1e3a8a"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>{DUELOS[intRound].b.i}</button>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}><button className="btn btn-warn" onClick={pularParInteresse}>⏭️ Pular Par</button><button className="btn btn-ok" onClick={() => { setIntCampeao("Generalista"); concluirTorneio(); }}>✅ Finalizar Agora</button></div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 1s ease-in-out", padding: "40px 0" }}>
                <div style={{ fontSize: "80px", marginBottom: "10px" }}>🏅</div><h2 style={{ marginBottom: "10px" }}>Perfil Mapeado!</h2><h1 style={{ color: "#eab308", fontSize: "2.5rem", marginBottom: "20px", textShadow: "0 0 20px rgba(234, 179, 8, 0.5)" }}>{intCampeao}</h1><p className="mut" style={{ marginBottom: "30px", maxWidth: "500px", margin: "0 auto 30px auto" }}>Baseado nas suas escolhas, esta é a área que mais faz o seu olho brilhar!</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}><button className="btn btn-sec" onClick={reiniciarTorneio}>🔄 Refazer Teste</button><button className="btn btn-ok" onClick={concluirTorneio}>✅ Salvar Preferência</button></div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PROGRESSO */}
      {abaAtiva === "progresso" && (
        <section className="card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}><h2>📊 Seu Progresso e Perfil</h2><p className="mut">Acompanhe a sua evolução nos módulos de mapeamento do EduGuIA.</p></div>
          <div className="grid grid-auto" style={{ marginBottom: "30px", gap: "15px" }}>
            <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>💬 Entrevista</h3>{mensagens.length > 2 ? (<div><p style={{ color: "#22c55e", fontWeight: "bold", marginBottom: "10px" }}>✅ Em andamento</p><div className="progress"><span style={{ width: "50%", background: "#22c55e" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
            <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>🎮 Resiliência</h3>{hudDisplay.scoreResiliencia !== "0.0" ? (<div><p style={{ color: "#7dd3fc", fontWeight: "bold", marginBottom: "10px" }}>✅ Score: {hudDisplay.scoreResiliencia}/5.0</p><div className="progress"><span style={{ width: `${(parseFloat(hudDisplay.scoreResiliencia)/5)*100}%`, background: "#7dd3fc" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
            <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>🕹️ Estilo de Aprendizagem</h3>{estiloResultadoFinal ? (<div><p style={{ color: "#eab308", fontWeight: "bold", marginBottom: "10px" }}>✅ {estiloResultadoFinal}</p><div className="progress"><span style={{ width: "100%", background: "#eab308" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
            <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}><h3 style={{ marginBottom: "10px" }}>⭐ Maior Interesse</h3>{intCampeao ? (<div><p style={{ color: "#ef4444", fontWeight: "bold", marginBottom: "10px" }}>✅ {intCampeao}</p><div className="progress"><span style={{ width: "100%", background: "#ef4444" }}></span></div></div>) : (<div><p className="mut" style={{ marginBottom: "10px" }}>⏳ Pendente</p><div className="progress"><span style={{ width: "0%" }}></span></div></div>)}</div>
          </div>
          <div className="card" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #0b1222 100%)", border: "1px solid #3b82f6", padding: "30px", textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "10px" }}>Sua Trilha Recomendada (IA)</h2>
            {estiloResultadoFinal && intCampeao ? (<div><p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#e2e8f0" }}>Avaliando os seus dados, percebemos que você tem facilidade com a aprendizagem <strong>{estiloResultadoFinal}</strong> e possui um interesse dominante em <strong>{intCampeao}</strong>. Além disso, seu nível de resiliência ao erro é de <strong>{hudDisplay.scoreResiliencia}/5.0</strong>.</p><div style={{ marginTop: "20px", background: "rgba(0,0,0,0.5)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}><strong>Próximo Passo Recomendado:</strong> A Inteligência Artificial irá gerar roteiros unindo {intCampeao} com desafios visuais!</div></div>) : (<div style={{ padding: "20px" }}><p style={{ color: "var(--mut)" }}>Conclua os módulos de "Estilos" e "Interesses" para liberar a análise completa do seu perfil pela nossa Inteligência Artificial.</p><div style={{ marginTop: "15px" }}>{!estiloResultadoFinal && <button className="btn btn-sec btn-sm" style={{ margin: "5px" }} onClick={() => setAbaAtiva('estilos')}>Ir para Estilos</button>} {!intCampeao && <button className="btn btn-sec btn-sm" style={{ margin: "5px" }} onClick={() => setAbaAtiva('interesses')}>Ir para Interesses</button>}</div></div>)}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 📈 ABA DE RELATÓRIOS (CONECTADA AO BANCO!) */}
      {/* ========================================== */}
      {abaAtiva === "relatorios" && (
        <section className="card" style={{ position: "relative" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--b1)", paddingBottom: "15px" }}>
            <div>
              <h2 style={{ fontSize: "24px", color: "#3b82f6" }}>📈 Relatórios Analíticos em Larga Escala</h2>
              <p className="mut">Análise pedagógica baseada em IA para Turmas e Indivíduos.</p>
            </div>
            {relView !== 'selecao' && (
              <button className="btn btn-sec" onClick={() => setRelView('selecao')}>⬅️ Voltar à Seleção</button>
            )}
          </div>

          {/* TELA 1: SELEÇÃO DE RELATÓRIO */}
          {relView === 'selecao' && (
            <div className="grid grid-auto" style={{ gap: "20px" }}>
              
              {/* CARD: RELATÓRIO DE TURMA */}
              <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
                <h3>Relatório de Turma (Grupo)</h3>
                <p className="mut" style={{ marginBottom: "15px", fontSize: "14px" }}>Análise agregada de perfil, inteligência e estratégias sugeridas para uma sala de aula específica.</p>
                
                <label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Selecione a Turma (ex: 3A, 3B)</label>
                <select className="input" style={{ width: "100%", marginBottom: "15px", background: "var(--bg1)" }} value={relTurmaSel} onChange={(e) => setRelTurmaSel(e.target.value)}>
                  <option value="">-- Selecione --</option>
                  {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                
                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={!relTurmaSel} onClick={() => setRelView('turma')}>Gerar Relatório da Turma</button>
              </div>

              {/* CARD: RELATÓRIO INDIVIDUAL */}
              <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>👤</div>
                <h3>Pasta do Estudante (Individual)</h3>
                <p className="mut" style={{ marginBottom: "15px", fontSize: "14px" }}>Diagnóstico completo puxado diretamente do banco de dados.</p>
                
                <label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>1. Turma do Aluno</label>
                <select className="input" style={{ width: "100%", marginBottom: "10px", background: "var(--bg1)" }} value={relTurmaSel} onChange={(e) => { setRelTurmaSel(e.target.value); setRelAlunoSel(null); setPerfilAluno(null); }}>
                  <option value="">-- Selecione a Turma --</option>
                  {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>2. Nome do Aluno</label>
                <select className="input" style={{ width: "100%", marginBottom: "15px", background: "var(--bg1)" }} value={relAlunoSel?.id || ""} 
                  onChange={(e) => { 
                    const selectedId = e.target.value;
                    const aluno = alunosDaTurma.find(al => al.id.toString() === selectedId); 
                    setRelAlunoSel(aluno); 
                    if (selectedId) carregarPerfilAluno(Number(selectedId));
                  }} disabled={!relTurmaSel}>
                  <option value="">-- Selecione o Aluno --</option>
                  {alunosDaTurma.map(a => <option key={a.id} value={a.id}>{a.nome} (Mat: {a.matricula || '-'})</option>)}
                </select>
                
                <button className="btn btn-ok" style={{ width: "100%", justifyContent: "center" }} disabled={!relAlunoSel || !perfilAluno} onClick={() => setRelView('individual')}>
                  {perfilAluno ? "Abrir Pasta Individual" : "Carregando Dados do Banco..."}
                </button>
              </div>
            </div>
          )}

          {/* TELA 2: RELATÓRIO INDIVIDUAL DO ALUNO */}
          {relView === 'individual' && relAlunoSel && perfilAluno && (
            <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
              <div className="card" style={{ background: "linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)", borderLeft: "4px solid #3b82f6", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ color: "#fff", margin: 0 }}>{relAlunoSel.nome}</h2>
                  <div className="mut" style={{ color: "#94a3b8", marginTop: "5px" }}>Matrícula: {relAlunoSel.matricula || "N/A"} | Email: {relAlunoSel.email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge" style={{ fontSize: "16px", background: "#3b82f6", color: "#fff" }}>Turma {relAlunoSel.turma}</span><br/>
                </div>
              </div>

              <div className="grid grid-auto" style={{ gap: "15px" }}>
                {/* Bloco 1 */}
                <div className="card" style={{ background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#eab308" }}>🏠 Perfil Socioeconômico</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", color: "var(--fg)" }}>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Responsável por Parente:</strong> {perfilAluno.socio_responsavel}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Escolaridade Resp.:</strong> {perfilAluno.socio_escolaridade}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Renda Média:</strong> {perfilAluno.socio_renda}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Acesso Internet/PC:</strong> {perfilAluno.socio_acesso}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Espaço de Estudo:</strong> {perfilAluno.socio_espaco}</li>
                    <li><strong style={{ color: "var(--mut)" }}>Transporte:</strong> {perfilAluno.socio_transporte}</li>
                  </ul>
                </div>

                {/* Bloco 2 */}
                <div className="card" style={{ background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#ef4444" }}>❤️ Psicológico e Emocional</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", color: "var(--fg)" }}>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Autoestima/Confiança:</strong> {perfilAluno.psico_autoestima}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Motivação/Resiliência:</strong> <span style={{ color: "#22c55e", fontWeight: "bold" }}>{perfilAluno.psico_resiliencia}</span></li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Sentimento Escolar:</strong> {perfilAluno.psico_sentimento}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Nível de Ansiedade:</strong> {perfilAluno.psico_ansiedade}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Relação Interpessoal:</strong> {perfilAluno.psico_relacao}</li>
                    <li><strong style={{ color: "var(--mut)" }}>Atenção/Foco:</strong> <span style={{ color: "#eab308" }}>{perfilAluno.psico_atencao}</span></li>
                  </ul>
                </div>

                {/* Bloco 3 */}
                <div className="card" style={{ background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#8b5cf6" }}>🧠 Diagnóstico Pedagógico</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", color: "var(--fg)" }}>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Tipo de Inteligência:</strong> {perfilAluno.peda_inteligencia}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Estilo Aprendizagem:</strong> {perfilAluno.peda_aprendizagem}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Metodologia Eficaz:</strong> {perfilAluno.peda_metodologia}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Altas Aptidões:</strong> <span style={{ color: "#3b82f6" }}>{perfilAluno.peda_aptidoes}</span></li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Não Aptidões:</strong> <span style={{ color: "#ef4444" }}>{perfilAluno.peda_nao_aptidoes}</span></li>
                    <li><strong style={{ color: "var(--mut)" }}>Nível Autonomia:</strong> {perfilAluno.peda_autonomia}</li>
                  </ul>
                </div>

                {/* Bloco 4 */}
                <div className="card" style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e" }}>
                  <h3 style={{ borderBottom: "1px solid #22c55e", paddingBottom: "8px", marginBottom: "12px", color: "#22c55e" }}>🎯 Resultados e Estratégia IA</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", color: "var(--fg)" }}>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Risco de Evasão:</strong> <span style={{ background: "#22c55e", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>{perfilAluno.ia_evasao}</span></li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Defasagem Detectada:</strong> {perfilAluno.ia_defasagem}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Engajamento Global:</strong> {perfilAluno.ia_engajamento}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Diagnóstico (Empecilho):</strong> {perfilAluno.ia_empecilhos}</li>
                    <li style={{ marginBottom: "8px" }}><strong style={{ color: "var(--mut)" }}>Metodologia IA Sugerida:</strong> <strong>{perfilAluno.ia_met_sugerida}</strong></li>
                    <li><strong style={{ color: "var(--mut)" }}>Linguagem/Abordagem:</strong> {perfilAluno.ia_abordagem}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TELA 3: RELATÓRIO DA TURMA */}
          {relView === 'turma' && relTurmaSel && (
            <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
              <div className="card" style={{ background: "linear-gradient(90deg, #7c3aed 0%, #0f172a 100%)", borderLeft: "4px solid #8b5cf6", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ color: "#fff", margin: 0 }}>Análise Macro: Turma {relTurmaSel}</h2>
                  <div className="mut" style={{ color: "#cbd5e1", marginTop: "5px" }}>EduGuIA Analytics - Visão Consolidada</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge" style={{ fontSize: "16px", background: "#8b5cf6", color: "#fff" }}>{alunosDaTurma.length} Alunos Cadastrados</span><br/>
                </div>
              </div>

              <div className="grid grid-auto" style={{ gap: "15px" }}>
                <div className="card" style={{ background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#3b82f6" }}>📊 Visão Socioeconômica</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Tempo Médio Estudo Extra:</span> <strong>{mockDadosTurma.socioeconomico.tempoMedio}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Acesso à Internet:</span> <strong>{mockDadosTurma.socioeconomico.acessoInternet}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mut">Dispositivos:</span> <strong>{mockDadosTurma.socioeconomico.possuiEquip}</strong></div>
                </div>

                <div className="card" style={{ background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#ef4444" }}>⚖️ Clima Psicológico</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Índice de Vulnerabilidade:</span> <strong style={{ color: "#ef4444" }}>{mockDadosTurma.psicologico.vulnerabilidade}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Confiança Coletiva:</span> <strong>{mockDadosTurma.psicologico.confianca}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Bullying/Conflitos:</span> <strong style={{ color: "#22c55e" }}>{mockDadosTurma.psicologico.bullying}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mut">Foco/Atenção Especial:</span> <strong>{mockDadosTurma.psicologico.atencao}</strong></div>
                </div>

                <div className="card" style={{ gridColumn: "1 / -1", background: "var(--bg2)" }}>
                  <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#eab308" }}>⚙️ Perfil Pedagógico Dominante</h3>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                    <div><span className="mut" style={{ display: "block" }}>Inteligências (%)</span><strong>{mockDadosTurma.pedagogico.intelDominantes}</strong></div>
                    <div><span className="mut" style={{ display: "block" }}>Aprendizagem (%)</span><strong>{mockDadosTurma.pedagogico.aprendizado}</strong></div>
                    <div><span className="mut" style={{ display: "block" }}>Metodologia Padrão</span><strong>{mockDadosTurma.pedagogico.metEficazes}</strong></div>
                    <div><span className="mut" style={{ display: "block" }}>Ranking Aptidões</span><strong>{mockDadosTurma.pedagogico.aptidoes}</strong></div>
                  </div>
                </div>

                <div className="card" style={{ gridColumn: "1 / -1", background: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6" }}>
                  <h3 style={{ borderBottom: "1px solid #3b82f6", paddingBottom: "8px", marginBottom: "12px", color: "#3b82f6" }}>📘 Guia Prático de Abordagem para o Professor</h3>
                  <p className="mut" style={{ marginBottom: "10px" }}>Baseado no mapeamento IA, esta é a forma mais eficaz de engajar esta turma:</p>
                  <ul style={{ listStyle: "circle", paddingLeft: "20px", color: "var(--fg)" }}>
                    <li style={{ marginBottom: "8px" }}><strong>Linguagem Recomendada:</strong> {mockDadosTurma.abordagem.linguagem}</li>
                    <li style={{ marginBottom: "8px" }}><strong>Recursos Sugeridos:</strong> {mockDadosTurma.abordagem.recursos}</li>
                    <li style={{ marginBottom: "8px" }}><strong>Nível de Autonomia:</strong> {mockDadosTurma.pedagogico.autonomia} (Necessita guia moderado do docente).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ========================================== */}
      {/* 🗂️ GESTÃO */}
      {/* ========================================== */}
      {abaAtiva === "gestao" && (
        <section className="card" style={{ position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <h2>🗂️ Gestão</h2>
            <p className="mut">Gerencie estudantes e, se for admin, também escolas.</p>
          </div>

          <div className="card" style={{ background: "var(--bg2)", marginBottom: "20px" }}>
            <div className="hdr" style={{ marginBottom: "8px" }}>
              <h3>👥 Estudantes</h3>
              <div className="toolbar">
                <button className="btn btn-primary btn-sm" type="button" onClick={abrirModalNovoEstudante}>➕ Novo Estudante</button>
                <button className="btn btn-sec btn-sm" type="button" onClick={() => carregarDadosGestao('estudantes')}>{textoRecarregarEstudante}</button>
              </div>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Turma</th><th>Nome</th><th>Matrícula</th><th>Role</th><th>Ativo</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "#ef4444" }}>Nenhum estudante encontrado ou erro ao carregar.</td></tr>
                  ) : (
                    usuarios.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td><td><strong>{user.turma || "-"}</strong></td><td>{user.nome || "-"}</td><td>{user.matricula || "-"}</td><td>{user.role}</td><td>{user.is_active ? "✅ Sim" : "❌ Não"}</td>
                        <td>
                          <button className="btn btn-sec btn-sm" style={{ marginRight: '5px' }} onClick={() => abrirModalEditarEstudante(user)}>✏️</button>
                          <button className="btn btn-err btn-sm" onClick={() => handleExcluirUsuario(user.id, user.nome || user.email)}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ background: "var(--bg2)" }}>
            <div className="hdr" style={{ marginBottom: "8px" }}>
              <h3>🏫 Escolas</h3>
              <div className="toolbar">
                <button className="btn btn-primary btn-sm" type="button" onClick={abrirModalNovaEscola}>➕ Nova Escola</button>
                <button className="btn btn-sec btn-sm" type="button" onClick={() => carregarDadosGestao('escolas')}>{textoRecarregarEscola}</button>
              </div>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Nome</th><th>Contato</th><th>Ativa</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {escolas.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "#ef4444" }}>Nenhuma escola cadastrada ainda.</td></tr>
                  ) : (
                    escolas.map((escola) => (
                      <tr key={escola.id}>
                        <td>{escola.id}</td><td>{escola.nome}</td><td>{escola.contato}</td><td>{escola.ativa === false || escola.ativa === "Não" ? "❌ Não" : "✅ Sim"}</td>
                        <td>
                          <button className="btn btn-sec btn-sm" style={{ marginRight: '5px' }} onClick={() => abrirModalEditarEscola(escola)}>✏️</button>
                          <button className="btn btn-err btn-sm" onClick={() => handleExcluirEscola(escola.id, escola.nome)}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL: ESTUDANTE */}
          {showStudentModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2, 6, 23, 0.95)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
              <div className="card" style={{ width: "90%", maxWidth: "550px", backgroundColor: "#0f172a", border: "1px solid #3b82f6", boxShadow: "0 10px 30px rgba(0,0,0,0.8)", padding: "25px", borderRadius: "12px" }}>
                <h3 style={{ marginBottom: "20px", color: "#fff" }}>{novoEstudante.id ? "Editar Estudante" : "Novo Estudante"}</h3>
                <form onSubmit={handleSalvarEstudante} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Matrícula</label><input className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.matricula} onChange={(e) => setNovoEstudante({...novoEstudante, matricula: e.target.value})} /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Nome</label><input className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.nome} onChange={(e) => setNovoEstudante({...novoEstudante, nome: e.target.value})} required /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Role</label>
                    <select className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.role} onChange={(e) => setNovoEstudante({...novoEstudante, role: e.target.value})}>
                      <option value="student">student</option><option value="teacher">teacher</option><option value="school">school</option><option value="admin">admin</option>
                    </select>
                  </div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Turma</label><input className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.turma} onChange={(e) => setNovoEstudante({...novoEstudante, turma: e.target.value})} /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Email</label><input className="input" type="email" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.email} onChange={(e) => setNovoEstudante({...novoEstudante, email: e.target.value})} required /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Senha {novoEstudante.id && "(vazio = manter)"}</label><input className="input" type="password" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.senha} onChange={(e) => setNovoEstudante({...novoEstudante, senha: e.target.value})} required={!novoEstudante.id} /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>School ID</label><input className="input" type="number" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.school_id} onChange={(e) => setNovoEstudante({...novoEstudante, school_id: e.target.value})} /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Ativo</label>
                    <select className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novoEstudante.ativo} onChange={(e) => setNovoEstudante({...novoEstudante, ativo: e.target.value})}>
                      <option value="Sim">Sim</option><option value="Não">Não</option>
                    </select>
                  </div>
                  {msgGestao.texto && (<div style={{ gridColumn: "span 2", color: msgGestao.erro ? "#ef4444" : "#22c55e", fontSize: "14px", marginTop: "5px", textAlign: "center" }}>{msgGestao.texto}</div>)}
                  <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-sec" style={{ padding: "8px 24px" }} onClick={() => setShowStudentModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-ok" style={{ padding: "8px 24px" }}>Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: ESCOLA */}
          {showSchoolModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2, 6, 23, 0.95)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
              <div className="card" style={{ width: "90%", maxWidth: "550px", backgroundColor: "#0f172a", border: "1px solid #3b82f6", boxShadow: "0 10px 30px rgba(0,0,0,0.8)", padding: "25px", borderRadius: "12px" }}>
                <h3 style={{ marginBottom: "20px", color: "#fff" }}>{novaEscola.id ? "Editar Escola" : "Nova Escola"}</h3>
                <form onSubmit={handleSalvarEscola} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Nome da Escola</label><input className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novaEscola.nome} onChange={(e) => setNovaEscola({...novaEscola, nome: e.target.value})} required /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Contato (email)</label><input className="input" type="email" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novaEscola.contato} onChange={(e) => setNovaEscola({...novaEscola, contato: e.target.value})} /></div>
                  <div><label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Ativa</label>
                    <select className="input" style={{ width: "100%", backgroundColor: "#1e293b", color: "#fff", borderColor: "#334155" }} value={novaEscola.ativa} onChange={(e) => setNovaEscola({...novaEscola, ativa: e.target.value})}>
                      <option value="Sim">Sim</option><option value="Não">Não</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-sec" style={{ padding: "8px 24px" }} onClick={() => setShowSchoolModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-ok" style={{ padding: "8px 24px" }}>Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </section>
      )}

    </div>
  );
}