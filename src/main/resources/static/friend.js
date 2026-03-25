const API_URL = 'http://localhost:8080';

let livrosCached = [];
let abaAtual     = 'todos';
let friendNickname = '';


window.addEventListener('load', () => {
    const email = localStorage.getItem('userEmail');
    if (!email) { window.location.href = 'index.html'; return; }

    document.getElementById('navUserEmail').textContent = localStorage.getItem('userNickname');

    const params = new URLSearchParams(window.location.search);
    friendNickname = params.get('nickname') || '';

    if (!friendNickname) { window.location.href = 'dashboard.html'; return; }

    document.getElementById('tituloAmigo').textContent = `Acervo de ${friendNickname}`;
    document.title = `Catalogus — ${friendNickname}`;

    carregarLivrosAmigo();
});

function voltarDashboard() {
    window.location.href = 'dashboard.html';
}


async function carregarLivrosAmigo() {
    const email = localStorage.getItem('userEmail');
    const grid  = document.getElementById('booksGrid');

    grid.innerHTML = `
        <div class="loading-state">
            <span class="loading-quill">✒</span>
            <p>Consultando o acervo...</p>
        </div>`;

    try {
        const response = await fetch(
            `${API_URL}/friends/books?email=${encodeURIComponent(email)}&friendNickname=${encodeURIComponent(friendNickname)}`
        );

        if (response.status === 204 || (await response.clone().json().then(d => Array.isArray(d) && d.length === 0).catch(() => false))) {
            livrosCached = [];
            grid.innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
            atualizarContador(0, 0);
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            grid.innerHTML = `<div class="loading-state"><p>${data.message || 'Erro ao carregar acervo.'}</p></div>`;
            return;
        }

        const livros = await response.json();
        livrosCached = livros;

        if (livros.length === 0) {
            grid.innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
            atualizarContador(0, 0);
            return;
        }

        renderizarAbaAtual();

    } catch (error) {
        console.error('Erro ao carregar livros do amigo:', error);
        grid.innerHTML = `<div class="loading-state"><p>Erro ao carregar o acervo.</p></div>`;
    }
}


function mudarAba(aba) {
    abaAtual = aba;
    document.getElementById('tabTodos').classList.toggle('active',     aba === 'todos');
    document.getElementById('tabLendo').classList.toggle('active',     aba === 'lendo');
    document.getElementById('tabFavoritos').classList.toggle('active', aba === 'favoritos');
    limparBusca();
    renderizarAbaAtual();
}

function renderizarAbaAtual() {
    if (abaAtual === 'todos')      renderizarCards(livrosCached);
    if (abaAtual === 'lendo')      renderizarCards(livrosCached.filter(l => l.status === 'LENDO'));
    if (abaAtual === 'favoritos')  renderizarCards(livrosCached.filter(l => l.favorite));
}


function renderizarCards(livros) {
    const grid       = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    const semResult  = document.getElementById('semResultados');

    grid.innerHTML = '';
    emptyState.style.display = 'none';
    semResult.style.display  = 'none';

    if (livros.length === 0) {
        emptyState.style.display = 'block';
        atualizarContador(0, livrosCached.length);
        return;
    }

    livros.forEach((livro, index) => grid.appendChild(criarCard(livro, index)));
    atualizarContador(livros.length, livrosCached.length);
}

function formatarData(dataISO) {
    if (!dataISO) return null;
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function criarCard(livro, index = 0) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.animationDelay = `${index * 80}ms`;

    const dataLeitura = livro.status === 'LIDO' && livro.readDate
        ? `<p class="book-meta"><strong>Lido em: </strong><span>${formatarData(livro.readDate)}</span></p>`
        : '';

    const favIcon = livro.favorite ? '<span class="fav-readonly">⭐</span>' : '';

    card.innerHTML = `
    <div class="book-spine"></div>
    <div class="book-content">
        <div class="book-info">
            <div class="book-top-row">
                <span class="book-status status-${livro.status || 'NAO_LIDO'}">
                    ${livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido'}
                </span>
                ${favIcon}
            </div>
            <h3 class="book-title"></h3>
            <p class="book-meta"><strong>Autor: </strong><span class="js-autor"></span></p>
            <p class="book-meta"><strong>ISBN: </strong><span class="js-isbn"></span></p>
            <span class="book-rating">${exibirEstrelas(livro.rating)}</span>
            ${dataLeitura}
            <div class="book-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calcularProgresso(livro.currentPage, livro.pages)}%"></div>
                </div>
                <span class="progress-label">${calcularProgresso(livro.currentPage, livro.pages)}%</span>
            </div>
        </div>
        <div class="book-cover">
            <img src="https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg"
                 alt="Capa de ${livro.title}" onerror="this.style.display='none'">
        </div>
    </div>`;

    card.querySelector('.book-title').textContent = livro.title;
    card.querySelector('.js-autor').textContent   = livro.author;
    card.querySelector('.js-isbn').textContent    = livro.isbn || 'Não informado';

    card.addEventListener('click', () => abrirModalDetalhes(livro));

    return card;
}


function fecharModalDetalhes(event) {
    if (!event || event.target.id === 'modalDetalhesOverlay') {
        document.getElementById('modalDetalhesOverlay').classList.remove('aberto');
    }
}

function abrirModalDetalhes(livro) {
    document.getElementById('detalhesTitulo').textContent    = livro.title;
    document.getElementById('detalhesAutor').textContent     = livro.author;
    document.getElementById('detalhesIsbn').textContent      = livro.isbn || 'Não informado';
    document.getElementById('detalhesAno').textContent       = livro.publishYear || 'Não informado';
    document.getElementById('detalhesEditora').textContent   = livro.publisher || 'Não informado';
    document.getElementById('detalhesPaginas').textContent   = livro.pages || 'Não informado';
    document.getElementById('detalhesStatus').textContent    = livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido';
    document.getElementById('detalhesRating').textContent    = livro.rating ? exibirEstrelas(livro.rating) : 'Sem avaliação';
    document.getElementById('detalhesDescricao').textContent = livro.description || 'Nenhum comentário';
    document.getElementById('detalhesCapa').src              = livro.coverUrl || '';
    document.getElementById('modalDetalhesOverlay').classList.add('aberto');
}


function exibirEstrelas(rating) {
    if (!rating) return '';
    rating = parseFloat(rating);
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⯪' : '');
}

function calcularProgresso(currentPage, totalPages) {
    if (!currentPage || !totalPages) return 0;
    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
}

function atualizarContador(visiveis, total) {
    const el = document.getElementById('bookCount');
    el.textContent = visiveis === total
        ? (total === 1 ? '1 obra' : `${total} obras`)
        : `${visiveis} de ${total} obras`;
}

function filtrarLivros(termo) {
    document.getElementById('btnLimparBusca').style.display = termo.length > 0 ? 'flex' : 'none';
    const termoNorm = termo.toLowerCase().trim();

    const base = abaAtual === 'lendo'     ? livrosCached.filter(l => l.status === 'LENDO')
               : abaAtual === 'favoritos' ? livrosCached.filter(l => l.favorite)
               : livrosCached;

    if (!termoNorm) { renderizarCards(base); return; }

    const resultado = base.filter(l =>
        l.title.toLowerCase().includes(termoNorm) ||
        l.author.toLowerCase().includes(termoNorm)
    );

    if (resultado.length === 0) {
        document.getElementById('booksGrid').innerHTML = '';
        document.getElementById('semResultados').style.display = 'block';
        atualizarContador(0, livrosCached.length);
        return;
    }

    document.getElementById('semResultados').style.display = 'none';
    renderizarCards(resultado);
}

function limparBusca() {
    document.getElementById('campoBusca').value = '';
    document.getElementById('btnLimparBusca').style.display = 'none';
    document.getElementById('semResultados').style.display  = 'none';
}

function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent   = texto;
    el.className     = `message ${tipo}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
