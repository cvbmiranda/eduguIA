/**
 * adapter.js
 * Objetivo: Simular o google.script.run para conectar com o FastAPI
 */

const API_BASE = ""; // Vazio = usa a mesma origem (localhost:8000)

// Cria o objeto global mockado
window.google = window.google || {};
window.google.script = window.google.script || {};

window.google.script.run = {
    _success: null,
    _failure: null,

    withSuccessHandler: function(cb) { this._success = cb; return this; },
    withFailureHandler: function(cb) { this._failure = cb; return this; },

    // --- 1. LOGIN ---
    login: async function(matricula, senha) {
        console.log("Tentando login via Adapter...");
        try {
            // FastAPI OAuth2 espera Form Data por padrão
            const formData = new URLSearchParams();
            formData.append('username', matricula);
            formData.append('password', senha);

            const res = await fetch(`${API_BASE}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || "Erro de autenticação");

            // Salva token para uso futuro
            localStorage.setItem('edg_token', data.access_token);

            // Retorna no formato que o frontend antigo espera: {ok: true, token: ..., user: ...}
            const responseLegacy = {
                ok: true,
                token: data.access_token,
                user: { matricula: matricula, nome: "Estudante (Via API)", role: "student" }
            };

            if (this._success) this._success(responseLegacy);

        } catch (e) {
            console.error("Erro Adapter Login:", e);
            if (this._failure) this._failure(e);
        }
    },

    // --- 2. CHAT ---
    chatSend: async function(token, msg, sessionId) {
        try {
            const res = await fetch(`${API_BASE}/chat`, { // Assumindo que sua rota é /chat
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: msg, session_id: sessionId })
            });

            const data = await res.json();
            // O frontend espera { resposta: "...", etapa: "..." }
            if (this._success) this._success(data);

        } catch (e) {
            if (this._failure) this._failure(e);
        }
    },

    // --- 3. UTILITÁRIOS ---
    ping: async function() {
        if(this._success) this._success({ok: true});
    },
    
    getCurrentUser: async function(token) {
        // Simula validação de token
        if(token) {
             if(this._success) this._success({ ok: true, user: { role: 'student', matricula: '123' } });
        } else {
             if(this._failure) this._failure("Sem token");
        }
    }
};