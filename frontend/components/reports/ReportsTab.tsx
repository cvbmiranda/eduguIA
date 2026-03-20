import React, { useState } from 'react';
import { API_URL } from '../../services/api';

interface ReportsTabProps {
  usuarios: any[];
  relView: 'selecao' | 'turma' | 'individual';
  setRelView: (view: 'selecao' | 'turma' | 'individual') => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ usuarios, relView, setRelView }) => {
  const [relTurmaSel, setRelTurmaSel] = useState("");
  const [relAlunoSel, setRelAlunoSel] = useState<any>(null);
  const [perfilAluno, setPerfilAluno] = useState<any>(null);
  
  // 👇 NOVO: Onde vamos guardar os dados reias da Turma
  const [dadosTurma, setDadosTurma] = useState<any>(null);
  const [loadingTurma, setLoadingTurma] = useState(false);

  const turmasDisponiveis = Array.from(new Set(usuarios.filter(u => u.turma).map(u => u.turma)));
  const alunosDaTurma = usuarios.filter(u => u.turma === relTurmaSel && u.role === 'student');

  const carregarPerfilAluno = async (id: number) => {
    const token = localStorage.getItem("edg_token");
    try {
      const res = await fetch(`${API_URL}/profiles/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setPerfilAluno(await res.json());
      else setPerfilAluno(null);
    } catch (e) { setPerfilAluno(null); }
  };

  // 👇 NOVO: Função que vai buscar a estatística agregada ao Python
  const carregarDadosDaTurma = async (turma: string) => {
    setLoadingTurma(true);
    const token = localStorage.getItem("edg_token");
    try {
      const res = await fetch(`${API_URL}/reports/turma/${turma}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        setDadosTurma(await res.json());
        setRelView('turma');
      } else {
        alert("Ainda não existem perfis suficientes gerados pela IA para esta turma!");
      }
    } catch (e) {
      alert("Erro ao calcular os dados da turma.");
    } finally {
      setLoadingTurma(false);
    }
  };

  return (
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

      {relView === 'selecao' && (
        <div className="grid grid-auto" style={{ gap: "20px" }}>
          <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
            <h3>Relatório de Turma (Grupo)</h3>
            <p className="mut" style={{ marginBottom: "15px", fontSize: "14px" }}>Análise agregada de perfil, inteligência e estratégias sugeridas para uma sala de aula específica.</p>
            
            <label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Selecione a Turma</label>
            <select className="input" style={{ width: "100%", marginBottom: "15px", background: "var(--bg1)" }} value={relTurmaSel} onChange={(e) => setRelTurmaSel(e.target.value)}>
              <option value="">-- Selecione --</option>
              {turmasDisponiveis.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
            </select>
            
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={!relTurmaSel || loadingTurma} onClick={() => carregarDadosDaTurma(relTurmaSel)}>
              {loadingTurma ? "A Processar IA..." : "Gerar Relatório da Turma"}
            </button>
          </div>

          <div className="card" style={{ background: "var(--bg2)", border: "1px solid var(--b1)" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👤</div>
            <h3>Pasta do Estudante (Individual)</h3>
            <p className="mut" style={{ marginBottom: "15px", fontSize: "14px" }}>Diagnóstico completo puxado diretamente do banco de dados.</p>
            
            <label className="mut" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>1. Turma do Aluno</label>
            <select className="input" style={{ width: "100%", marginBottom: "10px", background: "var(--bg1)" }} value={relTurmaSel} onChange={(e) => { setRelTurmaSel(e.target.value); setRelAlunoSel(null); setPerfilAluno(null); }}>
              <option value="">-- Selecione a Turma --</option>
              {turmasDisponiveis.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
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

      {relView === 'individual' && relAlunoSel && perfilAluno && (
        <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
          <div className="card" style={{ background: "linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)", borderLeft: "4px solid #3b82f6", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div><h2 style={{ color: "#fff", margin: 0 }}>{relAlunoSel.nome}</h2><div className="mut" style={{ color: "#94a3b8", marginTop: "5px" }}>Matrícula: {relAlunoSel.matricula || "N/A"} | Email: {relAlunoSel.email}</div></div>
            <div style={{ textAlign: "right" }}><span className="badge" style={{ fontSize: "16px", background: "#3b82f6", color: "#fff" }}>Turma {relAlunoSel.turma}</span></div>
          </div>
          <div className="grid grid-auto" style={{ gap: "15px" }}>
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

      {relView === 'turma' && dadosTurma && relTurmaSel && (
        <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
          <div className="card" style={{ background: "linear-gradient(90deg, #7c3aed 0%, #0f172a 100%)", borderLeft: "4px solid #8b5cf6", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div><h2 style={{ color: "#fff", margin: 0 }}>Análise Macro: Turma {relTurmaSel}</h2><div className="mut" style={{ color: "#cbd5e1", marginTop: "5px" }}>EduGuIA Analytics - Visão Consolidada</div></div>
            <div style={{ textAlign: "right" }}><span className="badge" style={{ fontSize: "16px", background: "#8b5cf6", color: "#fff" }}>Dados Processados pela IA</span></div>
          </div>

          <div className="grid grid-auto" style={{ gap: "15px" }}>
            <div className="card" style={{ background: "var(--bg2)" }}>
              <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#3b82f6" }}>📊 Visão Socioeconômica</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Espaço de Estudo Frequente:</span> <strong>{dadosTurma.socioeconomico.tempoMedio}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Acesso à Internet:</span> <strong>{dadosTurma.socioeconomico.acessoInternet}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mut">Renda Média Dominante:</span> <strong>{dadosTurma.socioeconomico.possuiEquip}</strong></div>
            </div>

            <div className="card" style={{ background: "var(--bg2)" }}>
              <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#ef4444" }}>⚖️ Clima Psicológico</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Risco de Evasão Coletivo:</span> <strong style={{ color: "#ef4444" }}>{dadosTurma.psicologico.vulnerabilidade}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Nível de Autoestima:</span> <strong>{dadosTurma.psicologico.confianca}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="mut">Qualidade das Relações:</span> <strong style={{ color: "#22c55e" }}>{dadosTurma.psicologico.bullying}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mut">Foco/Atenção Geral:</span> <strong>{dadosTurma.psicologico.atencao}</strong></div>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1", background: "var(--bg2)" }}>
              <h3 style={{ borderBottom: "1px solid var(--b1)", paddingBottom: "8px", marginBottom: "12px", color: "#eab308" }}>⚙️ Perfil Pedagógico Dominante</h3>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                <div><span className="mut" style={{ display: "block" }}>Inteligências Dominantes</span><strong>{dadosTurma.pedagogico.intelDominantes}</strong></div>
                <div><span className="mut" style={{ display: "block" }}>Estilos de Aprendizagem</span><strong>{dadosTurma.pedagogico.aprendizado}</strong></div>
                <div><span className="mut" style={{ display: "block" }}>Metodologias Sugeridas</span><strong>{dadosTurma.pedagogico.metEficazes}</strong></div>
                <div><span className="mut" style={{ display: "block" }}>Aptidões em Alta</span><strong>{dadosTurma.pedagogico.aptidoes}</strong></div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1", background: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6" }}>
              <h3 style={{ borderBottom: "1px solid #3b82f6", paddingBottom: "8px", marginBottom: "12px", color: "#3b82f6" }}>📘 Guia Prático de Abordagem para o Professor</h3>
              <p className="mut" style={{ marginBottom: "10px" }}>Baseado no mapeamento IA real desta turma, esta é a forma mais eficaz de lecionar:</p>
              <ul style={{ listStyle: "circle", paddingLeft: "20px", color: "var(--fg)" }}>
                <li style={{ marginBottom: "8px" }}><strong>Linguagem Recomendada:</strong> {dadosTurma.abordagem.linguagem}</li>
                <li style={{ marginBottom: "8px" }}><strong>Recursos Sugeridos:</strong> {dadosTurma.abordagem.recursos}</li>
                <li style={{ marginBottom: "8px" }}><strong>Nível de Autonomia Geral:</strong> {dadosTurma.pedagogico.autonomia}.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};