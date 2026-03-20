import React, { useState, useEffect } from 'react';

interface InterestTournamentProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  salvarPerfilNoBanco: (dados: any) => void;
  intCampeao: string;
  setIntCampeao: (campeao: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export const InterestTournament: React.FC<InterestTournamentProps> = ({
  abaAtiva, setAbaAtiva, salvarPerfilNoBanco, intCampeao, setIntCampeao, showToast
}) => {
  // O array gigante fica todo escondido aqui dentro!
  const DUELOS = [
    { a: { p: "Redes sociais", i: "📱 Redes Sociais", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400" }, b: { p: "Séries e streaming", i: "🎬 Séries e Filmes", img: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400" } },
    { a: { p: "Inteligência Artificial", i: "🤖 I.A. e Robótica", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400" }, b: { p: "Música", i: "🎸 Produção Musical", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400" } },
    { a: { p: "Esportes", i: "⚽ Prática Esportiva", img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400" }, b: { p: "Cultura geek", i: "📚 HQs e RPG", img: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=400" } },
    { a: { p: "Design e Artes", i: "🎨 Pintura e Design", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400" }, b: { p: "Games", i: "🎮 Videogames", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400" } },
    { a: { p: "Natureza", i: "🌿 Meio Ambiente", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400" }, b: { p: "Tecnologia", i: "💻 Programação", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400" } },
    { a: { p: "Saúde", i: "🩺 Medicina", img: "https://images.unsplash.com/photo-1505751172107-5739a00726b5?w=400" }, b: { p: "Negócios", i: "💰 Empreendedorismo", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" } },
    { a: { p: "Escrita", i: "✍️ Literatura", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400" }, b: { p: "Fotografia", i: "📷 Foto e Vídeo", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" } },
    { a: { p: "Culinária", i: "🍳 Gastronomia", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400" }, b: { p: "Moda", i: "👠 Estilo e Design", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" } },
    { a: { p: "História", i: "🏺 Arqueologia", img: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400" }, b: { p: "Espaço", i: "🚀 Astronomia", img: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=400" } },
    { a: { p: "Dança", i: "💃 Coreografia", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400" }, b: { p: "Teatro", i: "🎭 Atuação", img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400" } },
    { a: { p: "Animais", i: "🐾 Veterinária", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" }, b: { p: "Plantas", i: "🌻 Botânica", img: "https://images.unsplash.com/photo-1416872834464-03f7512822c4?w=400" } },
    { a: { p: "Matemática", i: "📐 Engenharia", img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400" }, b: { p: "Psicologia", i: "🧠 Comportamento", img: "https://images.unsplash.com/photo-1526067766683-99933182883a?w=400" } },
    { a: { p: "Viagens", i: "✈️ Turismo", img: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?w=400" }, b: { p: "Leitura", i: "📖 Bibliotecas", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400" } },
    { a: { p: "Política", i: "🏛️ Direito", img: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400" }, b: { p: "Cinema", i: "📽️ Direção", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400" } },
    { a: { p: "Línguas", i: "🌍 Idiomas", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400" }, b: { p: "Finanças", i: "📈 Investimentos", img: "https://images.unsplash.com/photo-1611974714024-4607755f3074?w=400" } },
    { a: { p: "Arquitetura", i: "🏗️ Construção", img: "https://images.unsplash.com/photo-1487958449913-d9279901873b?w=400" }, b: { p: "Mecânica", i: "⚙️ Robótica", img: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=400" } },
    { a: { p: "Fitness", i: "🏋️ Academia", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400" }, b: { p: "Meditação", i: "🧘 Yoga", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400" } },
    { a: { p: "Gadgets", i: "⌚ Wearables", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" }, b: { p: "Software", i: "🖥️ Aplicativos", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" } },
    { a: { p: "Desenho", i: "✏️ Ilustração", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400" }, b: { p: "Escultura", i: "🗿 Artes Plásticas", img: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=400" } },
    { a: { p: "Notícias", i: "📰 Jornalismo", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400" }, b: { p: "Podcast", i: "🎙️ Áudio", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400" } },
    { a: { p: "Surf", i: "🏄 Esportes Radicais", img: "https://images.unsplash.com/photo-1502680399448-211eaa9f2cb0?w=400" }, b: { p: "Xadrez", i: "♟️ Estratégia", img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400" } },
    { a: { p: "Química", i: "🧪 Laboratório", img: "https://images.unsplash.com/photo-1532187863486-abf9d3a36e98?w=400" }, b: { p: "Biologia", i: "🧬 Genética", img: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=400" } },
    { a: { p: "Moda", i: "👔 Alta Costura", img: "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=400" }, b: { p: "Beleza", i: "💄 Estética", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" } },
    { a: { p: "Carros", i: "🏎️ Automobilismo", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400" }, b: { p: "Barcos", i: "⛵ Navegação", img: "https://images.unsplash.com/photo-1516522973472-f009f23bba59?w=400" } },
    { a: { p: "Física", i: "⚛️ Ciência", img: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400" }, b: { p: "Sociologia", i: "🤝 Sociedade", img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400" } },
    { a: { p: "Filantropia", i: "🎁 Voluntariado", img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400" }, b: { p: "Liderança", i: "📢 Gestão de Pessoas", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400" } },
    { a: { p: "Eletrônica", i: "🔌 Circuitos", img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400" }, b: { p: "Astronomia", i: "🔭 Telescópios", img: "https://images.unsplash.com/photo-1516339901600-2e3a82dc9c45?w=400" } },
    { a: { p: "Geografia", i: "🗺️ Mapas", img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400" }, b: { p: "Meteorologia", i: "☁️ Clima", img: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400" } },
    { a: { p: "Instrumentos", i: "🎹 Piano", img: "https://images.unsplash.com/photo-1520522139311-53648347718e?w=400" }, b: { p: "DJing", i: "🎧 Remixes", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400" } },
    { a: { p: "Camping", i: "🏕️ Aventura", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" }, b: { p: "Museus", i: "🖼️ Exposições", img: "https://images.unsplash.com/photo-1518998053502-53cc8c24b701?w=400" } }
  ];
  
  const [intRound, setIntRound] = useState(0); 
  const [intScores, setIntScores] = useState<Record<string, number>>({}); 
  const [intPulos, setIntPulos] = useState(0); 

  const handleEscolhaInteresse = (profile: string) => { 
    const newScores = { ...intScores, [profile]: (intScores[profile] || 0) + 1 }; 
    setIntScores(newScores); 
    avancarRodada(newScores); 
  };
  
  const pularParInteresse = () => { 
    if (intPulos < 5) { 
      setIntPulos(p => p + 1); 
      avancarRodada(intScores); 
    } else { 
      showToast("Máximo de 5 pulos atingido!", "warning"); 
    } 
  };
  
  const avancarRodada = (currentScores: Record<string, number>) => { 
    if (intRound < DUELOS.length - 1) { 
      setIntRound(p => p + 1); 
    } else { 
      let maxScore = -1; let winner = ""; 
      for (const [prof, score] of Object.entries(currentScores)) { 
        if (score > maxScore) { maxScore = score; winner = prof; } 
      } 
      setIntCampeao(winner || "Generalista"); 
    } 
  };
  
  const reiniciarTorneio = () => { 
    setIntRound(0); setIntScores({}); setIntPulos(0); setIntCampeao(""); 
  };
  
  // Espião de auto-salvamento
  useEffect(() => {
    if (intCampeao !== "") {
      salvarPerfilNoBanco({ peda_aptidoes: intCampeao });
      setAbaAtiva("home");
      showToast(`⭐ Interesse salvo: ${intCampeao}`, "success"); 
    }
  }, [intCampeao]);

  const concluirTorneio = () => { 
    setAbaAtiva("progresso"); 
  };

  return (
    <section className="card">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2>⭐ Torneio de Interesses</h2>
        <p className="mut">Mapeamento de aptidões pedagógicas.</p>
      </div>

      <div style={{ marginBottom: "20px", background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "8px", color: "#e2e8f0", fontSize: "14px", borderLeft: "4px solid #3b82f6", textAlign: "left" }}>
        <strong>Como funciona:</strong> Analise as duas opções abaixo e clique na imagem que mais a atrai. Não pense muito, use a sua intuição para mapearmos o seu perfil!
      </div>

      <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)", textAlign: "center", padding: "20px" }}>
        {intCampeao === "" ? (
          <div>
            <div style={{ width: "100%", height: "6px", background: "#0b1222", borderRadius: "3px", marginBottom: "15px", border: "1px solid #1e3a8a" }}>
              <div style={{ width: `${(intRound / DUELOS.length) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: "3px", transition: "width 0.3s" }}></div>
            </div>
            <div className="mut" style={{ fontSize: "14px", marginBottom: "20px" }}>Par {intRound + 1} de {DUELOS.length} • {intPulos} pulos</div>

            <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "stretch", margin: "0 auto", maxWidth: "1000px", flexDirection: "row", flexWrap: "wrap" }}>
              
              <button className="btn" style={{ flex: "1", minWidth: "280px", maxWidth: "400px", height: "auto", padding: "15px", background: "#0b1222", border: "2px solid #1e3a8a", color: "#fff", cursor: "pointer", borderRadius: "12px", transition: "all 0.2s", display: "flex", flexDirection: "column" }} onClick={() => handleEscolhaInteresse(DUELOS[intRound].a.p)} onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#1e3a8a"}>
                <img src={DUELOS[intRound].a.img} alt="Opção A" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
                <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{DUELOS[intRound].a.i}</div>
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", color: "#3b82f6" }}>VS</div>

              <button className="btn" style={{ flex: "1", minWidth: "280px", maxWidth: "400px", height: "auto", padding: "15px", background: "#0b1222", border: "2px solid #1e3a8a", color: "#fff", cursor: "pointer", borderRadius: "12px", transition: "all 0.2s", display: "flex", flexDirection: "column" }} onClick={() => handleEscolhaInteresse(DUELOS[intRound].b.p)} onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#1e3a8a"}>
                <img src={DUELOS[intRound].b.img} alt="Opção B" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>{DUELOS[intRound].b.i}</div>
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "30px" }}>
              <button className="btn btn-warn" onClick={pularParInteresse}>⏭️ Pular Par</button>
              <button className="btn btn-ok" onClick={() => { setIntCampeao("Generalista"); concluirTorneio(); }}>✅ Finalizar Agora</button>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 1s ease-in-out", padding: "40px 0" }}>
            <div style={{ fontSize: "80px", marginBottom: "10px" }}>🏅</div>
            <h2 style={{ marginBottom: "10px" }}>Perfil Mapeado!</h2>
            <h1 style={{ color: "#eab308", fontSize: "2.5rem", marginBottom: "20px", textShadow: "0 0 20px rgba(234, 179, 8, 0.5)" }}>{intCampeao}</h1>
            <p className="mut" style={{ marginBottom: "30px", maxWidth: "500px", margin: "0 auto 30px auto" }}>Baseado nas suas escolhas, esta é a área que mais combina consigo!</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-sec" onClick={reiniciarTorneio}>🔄 Refazer Teste</button>
              <button className="btn btn-ok" onClick={concluirTorneio}>✅ Salvar Preferência</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};