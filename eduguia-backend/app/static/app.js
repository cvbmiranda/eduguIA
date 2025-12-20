// ... (código anterior de Login e Navegação) ...

// ==========================================
// MÓDULO DE CHAT
// ==========================================
const Chat = {
    history: [],
    isLoading: false,

    init() {
        const input = document.getElementById('chatInput');
        const btn = document.getElementById('chatSend');

        // Event Listeners para o Chat
        if (btn) btn.onclick = () => Chat.sendMessage();
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') Chat.sendMessage();
            };
        }
        
        // Se não tiver histórico, mostra saudação
        const log = document.getElementById('chatLog');
        if (log && log.innerHTML.trim() === '') {
            Chat.appendMessage("Olá! Eu sou o Edu. Vamos conversar um pouco para eu montar seu perfil?", 'assistant');
        }
    },

    async sendMessage() {
        if (Chat.isLoading) return;

        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;

        // 1. Mostra mensagem do usuário
        Chat.appendMessage(text, 'user');
        input.value = '';
        Chat.setLoading(true);

        try {
            // 2. Envia para o Backend Python
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${State.token}`
                },
                // Ajuste aqui conforme seu Schema do Pydantic (ChatRequest)
                body: JSON.stringify({ pergunta: text }) 
            });

            if (!res.ok) throw new Error("Erro na comunicação com a IA");

            const data = await res.json();
            
            // 3. Mostra resposta da IA
            // O backend deve retornar { "resposta": "..." }
            Chat.appendMessage(data.resposta, 'assistant');

        } catch (error) {
            console.error(error);
            Chat.appendMessage("Desculpe, tive um problema de conexão. Tente novamente.", 'assistant');
        } finally {
            Chat.setLoading(false);
            // Mantém o foco no input para digitar rápido
            setTimeout(() => input.focus(), 100);
        }
    },

    appendMessage(text, role) {
        const log = document.getElementById('chatLog');
        if (!log) return;

        const div = document.createElement('div');
        // Define a classe CSS baseada no role (user/assistant)
        // No CSS styles.css, certifique-se que existe .msg.user e .msg.assistant
        div.className = `msg ${role}`; 
        
        // Formata quem está falando
        const sender = role === 'user' ? 'Você' : 'Edu';
        
        div.innerHTML = `<strong>${sender}:</strong><br>${escapeHtml(text)}`;
        
        log.appendChild(div);
        
        // Scroll automático para o final
        log.scrollTop = log.scrollHeight;
        
        Chat.history.push({ role, text });
    },

    setLoading(loading) {
        Chat.isLoading = loading;
        const btn = document.getElementById('chatSend');
        const input = document.getElementById('chatInput');
        
        if (loading) {
            btn.disabled = true;
            btn.textContent = "...";
            input.disabled = true;
        } else {
            btn.disabled = false;
            btn.textContent = "Enviar";
            input.disabled = false;
        }
    }
};

// Utilitário de segurança para evitar injeção de HTML
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}