// ============================================================
// auth.js — Lógica de autenticação
//
// Responsabilidades deste arquivo:
// 1. Alternar entre os painéis de Login e Cadastro
// 2. Enviar o formulário de login para o backend
// 3. Enviar o formulário de cadastro para o backend
// 4. Redirecionar para o dashboard após login bem-sucedido
// ============================================================

const API_URL = 'http://localhost:8080';

// ============================================================
// ALTERNÂNCIA DE PAINÉIS (abas)
//
// Cada aba chama showTab() passando qual painel mostrar.
// A função esconde todos os painéis e mostra apenas o escolhido.
// ============================================================
function showTab(tabName, btnClicado) {
    // Remove .active de todos os painéis e botões
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Ativa o painel e o botão corretos
    document.getElementById(tabName + 'Panel').classList.add('active');
    btnClicado.classList.add('active');

    // Limpa qualquer mensagem anterior ao trocar de aba
    esconderMensagem();
}

// ============================================================
// MENSAGENS DE FEEDBACK
// ============================================================
function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent = texto;
    // Define a classe para colorir corretamente (success / error / info)
    el.className = `message ${tipo}`;
    el.style.display = 'block';

    // Some automaticamente após 4 segundos
    setTimeout(esconderMensagem, 4000);
}

function esconderMensagem() {
    const el = document.getElementById('message');
    el.style.display = 'none';
    el.className = 'message';
}

// ============================================================
// SUBMIT — LOGIN
//
// Correção Bug 1: antes usava response.text() e verificava
// se continha a string 'sucesso'. Agora usamos response.json()
// e verificamos o status HTTP com response.ok (true se 200-299).
// ============================================================
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault(); // impede o reload padrão do formulário

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // response.json() lê o corpo da resposta como JSON
        const data = await response.json();

        if (response.ok) {
            // Correção Bug 2: guardamos o email que veio do backend,
            // não o que o usuário digitou (mais seguro e consistente)
            localStorage.setItem('userEmail', data.email);
            mostrarMensagem('Acervo aberto com sucesso!', 'success');

            // Aguarda 1s para o usuário ler a mensagem antes de redirecionar
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // response.ok é false para status 400, 401, 409, 500, etc.
            mostrarMensagem(data.message || 'Credenciais inválidas.', 'error');
        }

    } catch (error) {
        // O catch captura erros de rede (backend fora do ar, CORS, etc.)
        console.error('Erro ao fazer login:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
});

// ============================================================
// SUBMIT — CADASTRO
//
// Validações feitas no frontend antes de chamar o backend:
// - Senhas coincidem?
// - Senha tem ao menos 6 caracteres?
// Isso evita chamadas desnecessárias ao servidor.
// ============================================================
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email           = document.getElementById('registerEmail').value.trim();
    const password        = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;

    // Validação local — antes de chamar o backend
    if (password !== confirmPassword) {
        mostrarMensagem('As senhas não coincidem.', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarMensagem('A senha deve ter ao menos 6 caracteres.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensagem('Conta criada! Faça login para continuar.', 'success');
            document.getElementById('registerFormElement').reset();

            // Volta para a aba de login após 2 segundos
            setTimeout(() => {
                showTab('login', document.querySelector('.tab-btn'));
            }, 2000);
        } else {
            // 409 Conflict = usuário já existe (tratado pelo backend)
            mostrarMensagem(data.message || 'Erro ao criar conta.', 'error');
        }

    } catch (error) {
        console.error('Erro ao registrar:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
});

// ============================================================
// VERIFICAÇÃO DE SESSÃO
//
// Se o usuário já está logado (tem email no localStorage),
// redireciona direto para o dashboard sem mostrar o login.
// ============================================================
window.addEventListener('load', () => {
    if (localStorage.getItem('userEmail')) {
        window.location.href = 'dashboard.html';
    }
});