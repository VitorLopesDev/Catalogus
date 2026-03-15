

const API_URL = 'http://localhost:8080';

let livrosCached = [];
let tituloEditando = null;

function carregarUsuario() {
    const email = localStorage.getItem('userEmail');
    const nickname = localStorage.getItem('userNickname');

    if (!email) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('navUserEmail').textContent = nickname;
}

function fecharModalDetalhes(event) {
    if (!event || event.target.id === 'modalDetalhesOverlay') {
        document.getElementById('modalDetalhesOverlay').classList.remove('aberto');
    }
}

async function abrirModalDetalhes(livro) {
      document.getElementById('detalhesTitulo').textContent    = livro.title;
      document.getElementById('detalhesAutor').textContent     = livro.author;
      document.getElementById('detalhesIsbn').textContent      = livro.isbn || 'Não informado';
      document.getElementById('detalhesAno').textContent       = livro.publishYear || 'Não informado';
      document.getElementById('detalhesEditora').textContent   = livro.publisher || 'Não informado';
      document.getElementById('detalhesPaginas').textContent   = livro.pages || 'Não informado';
      document.getElementById('detalhesStatus').textContent    = livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido';
      document.getElementById('detalhesDescricao').textContent = livro.description || 'Sem descrição';
      document.getElementById('detalhesCapa').src              = livro.coverUrl || '';

      document.getElementById('modalDetalhesOverlay').classList.add('aberto');
    if (livro.isbn) {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${livro.isbn}&format=json&jscmd=data`);
            const data = await response.json();
            const info = data[`ISBN:${livro.isbn}`];

            if (info) {
                document.getElementById('detalhesAno').textContent     = info.publish_date || 'Não encontrado';
                document.getElementById('detalhesEditora').textContent = info.publishers?.[0]?.name || 'Não encontrado';
                document.getElementById('detalhesPaginas').textContent = info.number_of_pages || 'Não encontrado';
            } else {
                document.getElementById('detalhesAno').textContent     = 'Não encontrado';
                document.getElementById('detalhesEditora').textContent = 'Não encontrado';
                document.getElementById('detalhesPaginas').textContent = 'Não encontrado';
            }
        } catch (error) {
            document.getElementById('detalhesAno').textContent     = 'Erro ao buscar';
            document.getElementById('detalhesEditora').textContent = 'Erro ao buscar';
            document.getElementById('detalhesPaginas').textContent = 'Erro ao buscar';
        }
    } else {
        document.getElementById('detalhesAno').textContent     = 'ISBN necessário';
        document.getElementById('detalhesEditora').textContent = 'ISBN necessário';
        document.getElementById('detalhesPaginas').textContent = 'ISBN necessário';
    }
}

function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

async function carregarLivros() {
    const grid       = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = `
        <div class="loading-state">
            <span class="loading-quill">✒</span>
            <p>Consultando o acervo...</p>
        </div>`;
    emptyState.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/book/list`);

        if (response.status === 204) {
            livrosCached = [];
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            atualizarEstatisticas([]);
            atualizarContador(0, 0);
            return;
        }

        const livros = await response.json();

        livrosCached = livros;

        atualizarEstatisticas(livros);

        if (livros.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            atualizarContador(0, 0);
            return;
        }

        renderizarCards(livros);

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        grid.innerHTML = `
            <div class="loading-state">
                <p>Erro ao carregar o acervo. Verifique o servidor.</p>
            </div>`;
    }
}


function renderizarCards(livros) {
    const grid       = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    const semResult  = document.getElementById('semResultados');

    grid.innerHTML = '';
    emptyState.style.display = 'none';
    semResult.style.display  = 'none';

    livros.forEach((livro, index) => {
        const card = criarCard(livro, index);
        grid.appendChild(card);
    });
}

function criarCard(livro, index = 0) {
    const card = document.createElement('div');
    card.className = 'book-card';


    card.style.animationDelay = `${index * 80}ms`;

card.innerHTML = `
    <div class="book-spine"></div>
    <div class="book-content">
        <div class="book-info">
            <span class="book-status status-${livro.status || 'NAO_LIDO'}">
                ${livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido'}
            </span>
            <h3 class="book-title"></h3>
            <p class="book-meta"><strong>Autor: </strong><span class="js-autor"></span></p>
            <p class="book-meta"><strong>ISBN: </strong><span class="js-isbn"></span></p>
            <span class="book-rating">${exibirEstrelas(livro.rating)}</span>
            <div class="book-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calcularProgresso(livro.currentPage, livro.pages)}%"></div>
                </div>
                <span class="progress-label">${calcularProgresso(livro.currentPage, livro.pages)}%</span>
            </div>
            <p class="book-description"></p>
            <div class="book-actions">
                <button class="btn-editar">✏ Editar</button>
                <button class="btn-deletar">✕ Remover</button>
            </div>
        </div>
        <div class="book-cover">
            <img
                src="https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg"
                alt="Capa de ${livro.title}"
                onerror="this.style.display='none'"
            >
        </div>
    </div>`;

    card.querySelector('.book-title').textContent       = livro.title;
    card.querySelector('.js-autor').textContent         = livro.author;
    card.querySelector('.js-isbn').textContent          = livro.isbn || 'Não informado';
    card.querySelector('.book-description').textContent = livro.description || '';

    card.querySelector('.btn-editar').addEventListener('click', () => abrirModalEdicao(livro));
    card.querySelector('.btn-deletar').addEventListener('click', () => deletarLivro(livro.title));
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-editar') && !e.target.closest('.btn-deletar')) {
            abrirModalDetalhes(livro);
        }
    });

    return card;
}

function exibirEstrelas(rating) {
    if (!rating) return '⯪⯪⯪⯪⯪';
    const cheias = Math.floor(rating);
    const meia = rating % 1 >= 0.5 ? '⯪' : '';
    const vazias = 5 - cheias - (meia ? 1 : 0);
    return '★'.repeat(cheias) + meia + '⯪'.repeat(vazias);
}

function atualizarEstatisticas(livros) {
    const total = livros.length;

    const autoresUnicos = new Set(livros.map(l => l.author.trim())).size;

    const comIsbn = livros.filter(l => l.isbn && l.isbn.trim() !== '').length;

    animarNumero('statTotal',   total);
    animarNumero('statAutores', autoresUnicos);
    animarNumero('statIsbn',    comIsbn);
}

function animarNumero(elementId, valorFinal) {
    const el       = document.getElementById(elementId);
    const duracao  = 600;
    const intervalo = 16;
    const passos   = duracao / intervalo;
    const incremento = valorFinal / passos;

    let atual = 0;
    const timer = setInterval(() => {
        atual += incremento;
        if (atual >= valorFinal) {
            atual = valorFinal;
            clearInterval(timer);
        }
        el.textContent = Math.floor(atual);
    }, intervalo);
}


function filtrarLivros(termo) {
    const grid      = document.getElementById('booksGrid');
    const semResult = document.getElementById('semResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');

    btnLimpar.style.display = termo.length > 0 ? 'flex' : 'none';

    const termoNorm = termo.toLowerCase().trim();

    if (!termoNorm) {
        semResult.style.display = 'none';
        renderizarCards(livrosCached);
        atualizarContador(livrosCached.length, livrosCached.length);
        return;
    }

    const resultado = livrosCached.filter(livro =>
        livro.title.toLowerCase().includes(termoNorm) ||
        livro.author.toLowerCase().includes(termoNorm)
    );

    if (resultado.length === 0) {
        grid.innerHTML   = '';
        semResult.style.display = 'block';
        atualizarContador(0, livrosCached.length);
        return;
    }

    semResult.style.display = 'none';
    renderizarCards(resultado);
    atualizarContador(resultado.length, livrosCached.length);
}

function limparBusca() {
    const campo = document.getElementById('campoBusca');
    campo.value = '';
    campo.focus();
    filtrarLivros('');
}

function atualizarContador(visiveis, total) {
    const el = document.getElementById('bookCount');
    if (visiveis === total) {
        el.textContent = total === 1 ? '1 obra' : `${total} obras`;
    } else {
        el.textContent = `${visiveis} de ${total} obras`;
    }
}


function abrirModal() {
    tituloEditando = null;
    document.getElementById('modalTitulo').textContent    = 'Nova Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Registrar Obra';
    document.getElementById('livroForm').reset();
    document.getElementById('modalOverlay').classList.add('aberto');
}

function calcularProgresso(currentPage, totalPages) {
    if (!currentPage || !totalPages) return 0;
    const progresso = Math.round((currentPage / totalPages) * 100);
    return Math.min(progresso, 100);
}

function abrirModalEdicao(livro) {
    tituloEditando = livro.title;
    document.getElementById('modalTitulo').textContent    = 'Editar Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Salvar Alterações';
    document.getElementById('campoTitulo').value    = livro.title;
    document.getElementById('campoAutor').value     = livro.author;
    document.getElementById('campoIsbn').value      = livro.isbn || '';
    document.getElementById('campoDescricao').value = livro.description || '';
    document.getElementById('campoStatus').value = livro.status || 'NAO_LIDO';
    document.getElementById('modalOverlay').classList.add('aberto');
    document.getElementById('campoRating').value = livro.rating || '';
    document.getElementById('campoCurrentPage').value = livro.currentPage || '';
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('aberto');
    tituloEditando = null;
}

function fecharModalFora(event) {
    if (event.target.id === 'modalOverlay') fecharModal();
}

async function salvarLivro() {
    const titulo    = document.getElementById('campoTitulo').value.trim();
    const autor     = document.getElementById('campoAutor').value.trim();
    const status    = document.getElementById('campoStatus').value.trim();
    const isbn      = document.getElementById('campoIsbn').value.trim();
    const descricao = document.getElementById('campoDescricao').value.trim();
    const rating    = document.getElementById('campoRating').value.trim();
    const currentPage = document.getElementById('campoCurrentPage').value.trim();
    const email = localStorage.getItem('userEmail');

    const payload = { title: titulo, author: autor, isbn, description: descricao, ownerEmail: email, status, rating, currentPage };

    if (!titulo || !autor) {
        mostrarMensagem('Título e autor são obrigatórios.', 'error');
        return;
    }

    try {
        let response;

        if (tituloEditando) {
            response = await fetch(
                `${API_URL}/book/${encodeURIComponent(tituloEditando)}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );
        } else {
            response = await fetch(`${API_URL}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            mostrarMensagem(
                tituloEditando ? 'Obra atualizada!' : 'Obra adicionada ao acervo!',
                'success'
            );
            fecharModal();
            limparBusca();
            await carregarLivros();
        } else {
            const data = await response.json().catch(() => ({}));
            mostrarMensagem(data.message || 'Erro ao salvar.', 'error');
        }

    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

async function deletarLivro(titulo) {
    if (!confirm(`Deseja remover "${titulo}" do acervo?`)) return;

    try {
        const response = await fetch(
            `${API_URL}/book/${encodeURIComponent(titulo)}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            mostrarMensagem('Obra removida do acervo.', 'success');
            await carregarLivros();
        } else {
            mostrarMensagem('Erro ao remover a obra.', 'error');
        }

    } catch (error) {
        console.error('Erro ao deletar:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}
function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent = texto;
    el.className = `message ${tipo}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
window.addEventListener('load', () => {
    carregarUsuario();
    carregarLivros();
});