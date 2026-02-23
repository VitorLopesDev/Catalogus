// Configuração da API
const API_URL = 'http://localhost:8080';

// Verificar se o usuário está logado
function checkAuth() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = 'index.html';
    }
}

// Executar verificação ao carregar a página
checkAuth();

// Função para logout
function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

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

// Mostrar/ocultar formulário de livro
function showAddBookForm() {
    document.getElementById('formTitle').textContent = 'Adicionar Novo Livro';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookFormContainer').style.display = 'flex';
}

function hideBookForm() {
    document.getElementById('bookFormContainer').style.display = 'none';
}

// Carregar lista de livros
async function loadBooks() {
    const container = document.getElementById('booksContainer');
    const emptyState = document.getElementById('emptyState');
    
    try {
        const response = await fetch(`${API_URL}/book/list`);
        
        if (response.status === 204) {
            // Sem conteúdo - lista vazia
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        const books = await response.json();
        
        if (books.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        books.forEach(book => {
            const bookCard = createBookCard(book);
            container.appendChild(bookCard);
        });
        
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        container.innerHTML = '<div class="loading">Erro ao carregar livros. Verifique se o backend está rodando.</div>';
    }
}

// Criar card de livro
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    card.innerHTML = `
        <h3>${book.title}</h3>
        <p class="book-info"><strong>Autor:</strong> ${book.author}</p>
        <p class="book-info"><strong>ISBN:</strong> ${book.isbn || 'Não informado'}</p>
        <div class="book-actions">
            <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', '${book.isbn || ''}')" class="btn btn-edit">
                ✏️ Editar
            </button>
            <button onclick="deleteBook('${book.title}')" class="btn btn-danger">
                🗑️ Deletar
            </button>
        </div>
    `;
    
    return card;
}

// Adicionar ou atualizar livro
document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const isbn = document.getElementById('bookIsbn').value;
    
    const bookData = {
        title: title,
        author: author,
        isbn: isbn
    };
    
    try {
        if (id) {
            // Atualizar livro existente
            const response = await fetch(`${API_URL}/book/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });
            
            if (response.ok) {
                showMessage('Livro atualizado com sucesso!', 'success');
                hideBookForm();
                loadBooks();
            } else {
                const errorText = await response.text();
                showMessage(errorText || 'Erro ao atualizar livro', 'error');
            }
        } else {
            // Adicionar novo livro
            const response = await fetch(`${API_URL}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });
            
            if (response.status === 201) {
                showMessage('Livro adicionado com sucesso!', 'success');
                hideBookForm();
                loadBooks();
            } else {
                const errorText = await response.text();
                showMessage(errorText || 'Erro ao adicionar livro', 'error');
            }
        }
    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        showMessage('Erro ao conectar com o servidor', 'error');
    }
});

// Editar livro
function editBook(id, title, author, isbn) {
    document.getElementById('formTitle').textContent = 'Editar Livro';
    document.getElementById('bookId').value = id;
    document.getElementById('bookTitle').value = title;
    document.getElementById('bookAuthor').value = author;
    document.getElementById('bookIsbn').value = isbn;
    document.getElementById('bookFormContainer').style.display = 'flex';
}

// Deletar livro
async function deleteBook(title) {
    if (!confirm(`Tem certeza que deseja deletar o livro "${title}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/book/${encodeURIComponent(title)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Livro deletado com sucesso!', 'success');
            loadBooks();
        } else {
            const errorText = await response.text();
            showMessage(errorText || 'Erro ao deletar livro', 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        showMessage('Erro ao conectar com o servidor', 'error');
    }
}

// Fechar formulário ao clicar fora dele
document.getElementById('bookFormContainer').addEventListener('click', (e) => {
    if (e.target.id === 'bookFormContainer') {
        hideBookForm();
    }
});

// Carregar livros ao iniciar
window.addEventListener('load', () => {
    loadBooks();
});
