import React, { useState } from 'react';
import { API_URL } from '../../services/api';

interface ManagementTabProps {
  usuarios: any[];
  escolas: any[];
  carregarDadosGestao: () => Promise<void>;
  showToast: (msg: string, type?: "success" | "error" | "warning") => void;
}

export const ManagementTab: React.FC<ManagementTabProps> = ({
  usuarios, escolas, carregarDadosGestao, showToast
}) => {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [msgGestao, setMsgGestao] = useState({ texto: "", erro: false });

  const [textoRecarregarEstudante, setTextoRecarregarEstudante] = useState("⟳ Recarregar");
  const [textoRecarregarEscola, setTextoRecarregarEscola] = useState("⟳ Recarregar");

  const [novoEstudante, setNovoEstudante] = useState({ id: null as number | null, matricula: "", nome: "", role: "student", turma: "", email: "", senha: "", school_id: "", ativo: "Sim" });
  const [novaEscola, setNovaEscola] = useState({ id: null as number | null, nome: "", contato: "", ativa: "Sim" });

  const handleRecarregar = async (tipo: 'estudantes' | 'escolas') => {
    await carregarDadosGestao();
    if (tipo === 'estudantes') {
      setTextoRecarregarEstudante("✅ Atualizado!");
      setTimeout(() => setTextoRecarregarEstudante("⟳ Recarregar"), 2000);
    } else {
      setTextoRecarregarEscola("✅ Atualizado!");
      setTimeout(() => setTextoRecarregarEscola("⟳ Recarregar"), 2000);
    }
  };

  const abrirModalNovoEstudante = () => { setNovoEstudante({ id: null, matricula: "", nome: "", role: "student", turma: "", email: "", senha: "", school_id: "", ativo: "Sim" }); setMsgGestao({ texto: "", erro: false }); setShowStudentModal(true); };
  const abrirModalEditarEstudante = (u: any) => { setNovoEstudante({ id: u.id, matricula: u.matricula || "", nome: u.nome, role: u.role, turma: u.turma || "", email: u.email, senha: "", school_id: u.school_id ? String(u.school_id) : "", ativo: u.is_active ? "Sim" : "Não" }); setMsgGestao({ texto: "", erro: false }); setShowStudentModal(true); };
  
  const handleSalvarEstudante = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setMsgGestao({ texto: "A guardar...", erro: false }); 
    const token = localStorage.getItem("edg_token"); 
    const isEdit = novoEstudante.id !== null; 
    const url = isEdit ? `${API_URL}/users/${novoEstudante.id}` : `${API_URL}/users/`; 
    try { 
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(novoEstudante) }); 
      if (res.ok) { 
        setMsgGestao({ texto: "✅ Guardado com sucesso!", erro: false }); 
        carregarDadosGestao(); 
        setTimeout(() => setShowStudentModal(false), 1000); 
      } else { 
        const data = await res.json(); 
        setMsgGestao({ texto: `❌ Erro: ${data.detail}`, erro: true }); 
      } 
    } catch (err) { 
      setMsgGestao({ texto: "❌ Erro de ligação.", erro: true }); 
    } 
  };
  
  const handleExcluirUsuario = async (id: number, nome: string) => { 
    if (!confirm(`Apagar ${nome}?`)) return; 
    const t = localStorage.getItem("edg_token"); 
    await fetch(`${API_URL}/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); 
    carregarDadosGestao(); 
  };

  const abrirModalNovaEscola = () => { setNovaEscola({ id: null, nome: "", contato: "", ativa: "Sim" }); setMsgGestao({ texto: "", erro: false }); setShowSchoolModal(true); };
  const abrirModalEditarEscola = (e: any) => { setNovaEscola({ id: e.id, nome: e.nome, contato: e.contato || "", ativa: e.ativa }); setMsgGestao({ texto: "", erro: false }); setShowSchoolModal(true); };
  
  const handleSalvarEscola = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    const token = localStorage.getItem("edg_token"); 
    const isEdit = novaEscola.id !== null; 
    const url = isEdit ? `${API_URL}/schools/${novaEscola.id}` : `${API_URL}/schools/`; 
    try { 
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ nome: novaEscola.nome, contato: novaEscola.contato, ativa: novaEscola.ativa }) }); 
      if (res.ok) { 
        showToast("✅ Escola guardada!", "success"); 
        setShowSchoolModal(false); 
        carregarDadosGestao(); 
      } else { 
        showToast("❌ Erro ao guardar escola", "error"); 
      } 
    } catch (err) { 
      showToast("❌ Erro de ligação.", "error"); 
    } 
  };
  
  const handleExcluirEscola = async (id: number, nome: string) => { 
    if (!confirm(`Apagar escola ${nome}?`)) return; 
    const t = localStorage.getItem("edg_token"); 
    await fetch(`${API_URL}/schools/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); 
    carregarDadosGestao(); 
  };

  return (
    <section className="card" style={{ position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <h2>🗂️ Gestão</h2>
        <p className="mut">Gerencie estudantes e, se for admin, também escolas.</p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
          <button 
            onClick={() => {
              showToast("A transferir relatório...", "success");
              window.open(`${API_URL}/export/students`, "_blank");
            }}
            style={{ background: "#10b981", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
          >
            ⬇️ Exportar Relatório Excel (CSV)
          </button>
        </div>
      </div>

      {/* CARD ESTUDANTES */}
      <div className="card" style={{ background: "var(--bg2)", marginBottom: "20px" }}>
        <div className="hdr" style={{ marginBottom: "8px" }}>
          <h3>👥 Estudantes</h3>
          <div className="toolbar">
            <button className="btn btn-primary btn-sm" type="button" onClick={abrirModalNovoEstudante}>➕ Novo Estudante</button>
            <button className="btn btn-sec btn-sm" type="button" onClick={() => handleRecarregar('estudantes')}>{textoRecarregarEstudante}</button>
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

      {/* CARD ESCOLAS */}
      <div className="card" style={{ background: "var(--bg2)" }}>
        <div className="hdr" style={{ marginBottom: "8px" }}>
          <h3>🏫 Escolas</h3>
          <div className="toolbar">
            <button className="btn btn-primary btn-sm" type="button" onClick={abrirModalNovaEscola}>➕ Nova Escola</button>
            <button className="btn btn-sec btn-sm" type="button" onClick={() => handleRecarregar('escolas')}>{textoRecarregarEscola}</button>
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
  );
};