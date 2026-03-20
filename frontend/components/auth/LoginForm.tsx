import React, { useState } from 'react';
import { API_URL } from '../../services/api';

interface LoginFormProps {
  onLoginSuccess: (token: string, userData: any, profileData: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    if (!matricula || !senha) {
      setErro("Preencha matrícula e palavra-passe.");
      setCarregando(false);
      return;
    }

    try {
      // 1. Validar a Matrícula e obter o Token
      const fd = new URLSearchParams();
      fd.append("username", matricula);
      fd.append("password", senha);

      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: fd.toString(),
      });

      if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Falha no Login: ${errText}`);
      }
      
      const data = await res.json();
      const token = data.access_token;
      localStorage.setItem("edg_token", token);

      // 2. Buscar os dados do utilizador logado
      const resMe = await fetch(`${API_URL}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      // 👇 O DETETIVE ENTRA AQUI!
      if (!resMe.ok) {
        const errText = await resMe.text();
        console.error("ERRO DO BACKEND:", errText);
        throw new Error(`ERRO DO BACKEND: ${errText}`); 
      }
      
      const userData = await resMe.json();

      // 3. Buscar o progresso (Perfil) do utilizador
      let profileData = null;
      const resProfile = await fetch(`${API_URL}/profiles/${userData.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resProfile.ok) {
        profileData = await resProfile.json();
      }

      // 4. Enviar os dados para o ficheiro principal (page.tsx)
      onLoginSuccess(token, userData, profileData);

    } catch (err: any) {
      setErro(err.message === "Failed to fetch" ? "Erro de ligação ao servidor" : err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="brand" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>EduGuIA</h1>
        <p className="mut" style={{ marginBottom: '16px' }}>Sistema de Perfil Educacional</p>
        
        {erro && <div className="alert a-err">{erro}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input className="input" type="text" placeholder="Matrícula (Ex: admin)" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
          <input className="input" type="password" placeholder="Palavra-passe" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={carregando} style={{ justifyContent: 'center' }}>
            {carregando ? "A iniciar sessão..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};