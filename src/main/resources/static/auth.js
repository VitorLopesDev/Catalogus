// Configuração da API
const API_URL = 'http://localhost:8080';

// Função para mostrar mensagens
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}

// Alternar entre formulários
function showRegisterForm(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Manipular Login
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.text();
        
        if (data.includes('sucesso')) {
            // Salvar email no localStorage para identificar usuário logado
            localStorage.setItem('userEmail', email);
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar para o dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage('Email ou senha incorretos!', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showMessage('Erro ao conectar com o servidor. Verifique se o backend está rodando.', 'error');
    }
});

// Manipular Registro
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    
    // Validar se as senhas coincidem
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem!', 'error');
        return;
    }
    
    // Validar tamanho mínimo da senha
    if (password.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.text();
        
        if (data.includes('sucesso')) {
            showMessage('Cadastro realizado com sucesso! Faça login.', 'success');
            
            // Limpar formulário
            document.getElementById('registerFormElement').reset();
            
            // Voltar para o formulário de login
            setTimeout(() => {
                showLoginForm(new Event('click'));
            }, 2000);
        } else {
            showMessage(data, 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer registro:', error);
        showMessage('Erro ao conectar com o servidor. Verifique se o backend está rodando.', 'error');
    }
});

// Verificar se já está logado ao carregar a página
window.addEventListener('load', () => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        // Se já está logado, redirecionar para o dashboard
        window.location.href = 'dashboard.html';
    }
});
