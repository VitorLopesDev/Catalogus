const API_URL = 'http://localhost:8080';

let livrosCached  = [];
let tituloEditando = null;
let abaAtual       = 'biblioteca';

// ─── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
    carregarUsuario();
    carregarLivros();
    carregarAmigos();
    carregarPendentes();
});

// ─── Usuário ──────────────────────────────────────────────────────────────────

function carregarUsuario() {
    const email    = localStorage.getItem('userEmail');
    const nickname = localStorage.getItem('userNickname');
    if (!email) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('navUserEmail').textContent = nickname;
}

function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    window.location.href = 'index.html';
}

// ─── Amigos — painel ─────────────────────────────────────────────────────────

function togglePainelAmigos() {
    const painel = document.getElementById('painelAmigos');
    const sino   = document.getElementById('painelSino');
    sino.style.display  = 'none';
    painel.style.display = painel.style.display === 'none' ? 'block' : 'none';
}

function toggleSino() {
    const sino   = document.getElementById('painelSino');
    const amigos = document.getElementById('painelAmigos');
    amigos.style.display = 'none';
    sino.style.display   = sino.style.display === 'none' ? 'block' : 'none';
}

// Fecha painéis ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-amigos-wrapper')) {
        document.getElementById('painelAmigos').style.display = 'none';
    }
    if (!e.target.closest('.nav-notif-wrapper')) {
        document.getElementById('painelSino').style.display = 'none';
    }
});

// ─── Amigos — carregar lista ──────────────────────────────────────────────────

async function carregarAmigos() {
    const email = localStorage.getItem('userEmail');
    try {
        const response = await fetch(`${API_URL}/friends/list?email=${encodeURIComponent(email)}`);
        if (!response.ok) return;

        const amigos = await response.json();
        const lista  = document.getElementById('listaAmigos');

        if (amigos.length === 0) {
            lista.innerHTML = '<p class="painel-vazio">Nenhum amigo ainda</p>';
            return;
        }

        lista.innerHTML = amigos.map(amigo => `
            <div class="amigo-item" onclick="verAcervoAmigo('${amigo.nickName}')">
                <span class="amigo-avatar">👤</span>
                <span class="amigo-nome">${amigo.nickName}</span>
                <span class="amigo-seta">→</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar amigos:', error);
    }
}

// ─── Amigos — pendentes ───────────────────────────────────────────────────────

async function carregarPendentes() {
    const email = localStorage.getItem('userEmail');
    try {
        const response = await fetch(`${API_URL}/friends/pending?email=${encodeURIComponent(email)}`);
        if (!response.ok) return;

        const pendentes  = await response.json();
        const contador   = document.getElementById('sinoContador');
        const lista      = document.getElementById('listaPendentes');

        if (pendentes.length === 0) {
            contador.style.display = 'none';
            lista.innerHTML = '<p class="painel-vazio">Nenhuma solicitação pendente</p>';
            return;
        }

        contador.style.display  = 'flex';
        contador.textContent    = pendentes.length;

        lista.innerHTML = pendentes.map(p => `
            <div class="pendente-item">
                <span class="amigo-avatar">👤</span>
                <span class="amigo-nome">${p.sender.nickName}</span>
                <div class="pendente-acoes">
                    <button class="btn-aceitar" onclick="aceitarSolicitacao(${p.id})">✓</button>
                    <button class="btn-recusar" onclick="recusarSolicitacao(${p.id})">✕</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar pendentes:', error);
    }
}

// ─── Amigos — ações ───────────────────────────────────────────────────────────

function abrirModalAmigo() {
    document.getElementById('painelAmigos').style.display = 'none';
    document.getElementById('campoNicknameAmigo').value   = '';
    document.getElementById('modalAmigoOverlay').classList.add('aberto');
}

function fecharModalAmigo() {
    document.getElementById('modalAmigoOverlay').classList.remove('aberto');
}

function fecharModalAmigoFora(event) {
    if (event.target.id === 'modalAmigoOverlay') fecharModalAmigo();
}

async function enviarSolicitacao() {
    const email    = localStorage.getItem('userEmail');
    const nickname = document.getElementById('campoNicknameAmigo').value.trim();

    if (!nickname) {
        mostrarMensagem('Digite o nickname do amigo.', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/friends/request?senderEmail=${encodeURIComponent(email)}&receiverNickname=${encodeURIComponent(nickname)}`,
            { method: 'POST' }
        );

        const data = await response.json();

        if (response.ok) {
            mostrarMensagem('Solicitação enviada!', 'success');
            fecharModalAmigo();
        } else {
            mostrarMensagem(data.message || 'Erro ao enviar solicitação.', 'error');
        }

    } catch (error) {
        console.error('Erro ao enviar solicitação:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

async function aceitarSolicitacao(id) {
    const email = localStorage.getItem('userEmail');
    try {
        const response = await fetch(
            `${API_URL}/friends/${id}/accept?email=${encodeURIComponent(email)}`,
            { method: 'PATCH' }
        );

        if (response.ok) {
            mostrarMensagem('Solicitação aceita!', 'success');
            carregarAmigos();
            carregarPendentes();
        } else {
            mostrarMensagem('Erro ao aceitar solicitação.', 'error');
        }
    } catch (error) {
        console.error('Erro ao aceitar:', error);
    }
}

async function recusarSolicitacao(id) {
    const email = localStorage.getItem('userEmail');
    try {
        const response = await fetch(
            `${API_URL}/friends/${id}/refuse?email=${encodeURIComponent(email)}`,
            { method: 'PATCH' }
        );

        if (response.ok) {
            mostrarMensagem('Solicitação recusada.', 'info');
            carregarPendentes();
        } else {
            mostrarMensagem('Erro ao recusar solicitação.', 'error');
        }
    } catch (error) {
        console.error('Erro ao recusar:', error);
    }
}

function verAcervoAmigo(nickname) {
    document.getElementById('painelAmigos').style.display = 'none';
    window.location.href = `friend.html?nickname=${encodeURIComponent(nickname)}`;
}

// ─── Abas ─────────────────────────────────────────────────────────────────────

function mudarAba(aba) {
    abaAtual = aba;
    document.getElementById('tabBiblioteca').classList.toggle('active', aba === 'biblioteca');
    document.getElementById('tabFavoritos').classList.toggle('active',  aba === 'favoritos');
    limparBusca();
    renderizarAbaAtual();
}

function renderizarAbaAtual() {
    if (abaAtual === 'biblioteca') {
        renderizarCards(livrosCached);
    } else {
        renderizarCards(livrosCached.filter(l => l.favorite), true);
    }
}

// ─── Favoritar ────────────────────────────────────────────────────────────────

async function toggleFavorito(titulo, event) {
    event.stopPropagation();
    const email = localStorage.getItem('userEmail');

    try {
        const response = await fetch(
            `${API_URL}/book/${encodeURIComponent(titulo)}/favorite?email=${encodeURIComponent(email)}`,
            { method: 'PATCH' }
        );

        if (response.ok) {
            const atualizado = await response.json();
            const idx = livrosCached.findIndex(l => l.title === titulo);
            if (idx !== -1) livrosCached[idx].favorite = atualizado.favorite;
            renderizarAbaAtual();
        } else {
            mostrarMensagem('Erro ao atualizar favorito.', 'error');
        }
    } catch (error) {
        console.error('Erro ao favoritar:', error);
    }
}

// ─── Modal Detalhes ───────────────────────────────────────────────────────────

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
    document.getElementById('detalhesRating').textContent    = livro.rating ? exibirEstrelas(livro.rating) : 'Sem avaliação';
    document.getElementById('detalhesDescricao').textContent = livro.description || 'Nenhum comentário';
    document.getElementById('detalhesCapa').src              = livro.coverUrl || '';
    document.getElementById('modalDetalhesOverlay').classList.add('aberto');
}

// ─── Carregar livros ──────────────────────────────────────────────────────────

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
        const email    = localStorage.getItem('userEmail');
        const response = await fetch(`${API_URL}/book/list?email=${encodeURIComponent(email)}`);

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

        renderizarAbaAtual();

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        grid.innerHTML = `<div class="loading-state"><p>Erro ao carregar o acervo. Verifique o servidor.</p></div>`;
    }
}

// ─── Renderizar cards ─────────────────────────────────────────────────────────

function renderizarCards(livros, isFavoritos = false) {
    const grid       = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    const emptyFav   = document.getElementById('emptyFavoritos');
    const semResult  = document.getElementById('semResultados');

    grid.innerHTML = '';
    emptyState.style.display = 'none';
    emptyFav.style.display   = 'none';
    semResult.style.display  = 'none';

    if (livros.length === 0) {
        isFavoritos ? emptyFav.style.display = 'block' : emptyState.style.display = 'block';
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

    const dataLeitura  = livro.status === 'LIDO' && livro.readDate
        ? `<p class="book-meta"><strong>Lido em: </strong><span>${formatarData(livro.readDate)}</span></p>`
        : '';
    const estrelaCls   = livro.favorite ? 'btn-favorito ativo' : 'btn-favorito';
    const estrelaLabel = livro.favorite ? '⭐' : '☆';

    card.innerHTML = `
    <div class="book-spine"></div>
    <div class="book-content">
        <div class="book-info">
            <div class="book-top-row">
                <span class="book-status status-${livro.status || 'NAO_LIDO'}">
                    ${livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido'}
                </span>
                <button class="${estrelaCls}" title="${livro.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${estrelaLabel}</button>
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
            <p class="book-description"></p>
            <div class="book-actions">
                <button class="btn-editar">✏ Editar</button>
                <button class="btn-deletar">✕ Remover</button>
            </div>
        </div>
        <div class="book-cover">
            <img src="https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg"
                 alt="Capa de ${livro.title}" onerror="this.style.display='none'">
        </div>
    </div>`;

    card.querySelector('.book-title').textContent       = livro.title;
    card.querySelector('.js-autor').textContent         = livro.author;
    card.querySelector('.js-isbn').textContent          = livro.isbn || 'Não informado';
    card.querySelector('.book-description').textContent = livro.description || '';

    card.querySelector('.btn-favorito').addEventListener('click', (e) => toggleFavorito(livro.title, e));
    card.querySelector('.btn-editar').addEventListener('click',   () => abrirModalEdicao(livro));
    card.querySelector('.btn-deletar').addEventListener('click',  () => deletarLivro(livro.title));
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-editar') && !e.target.closest('.btn-deletar') && !e.target.closest('.btn-favorito')) {
            abrirModalDetalhes(livro);
        }
    });

    return card;
}

// ─── Status / Rating ──────────────────────────────────────────────────────────

function atualizarCampoPagina() {
    const status = document.getElementById('campoStatus').value;
    document.getElementById('grupoPaginaAtual').style.display = status === 'LENDO' ? 'block' : 'none';
    document.getElementById('grupoDataLeitura').style.display = status === 'LIDO'  ? 'block' : 'none';
}

function exibirEstrelas(rating) {
    if (!rating) return '';
    rating = parseFloat(rating);
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⯪' : '');
}

// ─── Estatísticas ─────────────────────────────────────────────────────────────

function atualizarEstatisticas(livros) {
    animarNumero('statTotal',   livros.length);
    animarNumero('statAutores', new Set(livros.map(l => l.author.trim())).size);
    animarNumero('statIsbn',    livros.filter(l => l.isbn && l.isbn.trim() !== '').length);
}

function animarNumero(elementId, valorFinal) {
    const el = document.getElementById(elementId);
    const incremento = valorFinal / (600 / 16);
    let atual = 0;
    const timer = setInterval(() => {
        atual += incremento;
        if (atual >= valorFinal) { atual = valorFinal; clearInterval(timer); }
        el.textContent = Math.floor(atual);
    }, 16);
}

// ─── Busca ────────────────────────────────────────────────────────────────────

function filtrarLivros(termo) {
    const btnLimpar = document.getElementById('btnLimparBusca');
    btnLimpar.style.display = termo.length > 0 ? 'flex' : 'none';

    const termoNorm = termo.toLowerCase().trim();
    const base      = abaAtual === 'favoritos' ? livrosCached.filter(l => l.favorite) : livrosCached;

    if (!termoNorm) {
        document.getElementById('semResultados').style.display = 'none';
        renderizarCards(base, abaAtual === 'favoritos');
        return;
    }

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
    renderizarCards(resultado, abaAtual === 'favoritos');
}

function limparBusca() {
    const campo = document.getElementById('campoBusca');
    campo.value = '';
    document.getElementById('btnLimparBusca').style.display = 'none';
    document.getElementById('semResultados').style.display  = 'none';
}

function atualizarContador(visiveis, total) {
    const el = document.getElementById('bookCount');
    el.textContent = visiveis === total
        ? (total === 1 ? '1 obra' : `${total} obras`)
        : `${visiveis} de ${total} obras`;
}

// ─── ISBN ─────────────────────────────────────────────────────────────────────

async function buscarPorIsbn() {
    const isbn = document.getElementById('campoIsbn').value.trim();
    if (!isbn) { mostrarMensagem('Digite um ISBN para buscar.', 'error'); return; }

    mostrarMensagem('Buscando livro...', 'info');

    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const data     = await response.json();
        const info     = data[`ISBN:${isbn}`];

        if (!info) { mostrarMensagem('ISBN não encontrado na base de dados.', 'error'); return; }

        document.getElementById('campoTitulo').value = info.title || '';
        document.getElementById('campoAutor').value  = info.authors?.[0]?.name || '';
        document.getElementById('dadosLivro').style.display = 'block';
        mostrarMensagem('Livro encontrado!', 'success');

    } catch (error) {
        mostrarMensagem('Erro ao conectar com a base de dados.', 'error');
    }
}

// ─── Modal Adicionar/Editar ───────────────────────────────────────────────────

function abrirModal() {
    tituloEditando = null;
    document.getElementById('modalTitulo').textContent    = 'Nova Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Registrar Obra';
    document.getElementById('livroForm').reset();
    document.getElementById('dadosLivro').style.display = 'none';
    document.getElementById('campoReadDate').max = new Date().toISOString().split('T')[0];
    document.getElementById('modalOverlay').classList.add('aberto');
    atualizarCampoPagina();
}

function calcularProgresso(currentPage, totalPages) {
    if (!currentPage || !totalPages) return 0;
    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
}

function abrirModalEdicao(livro) {
    tituloEditando = livro.title;
    document.getElementById('modalTitulo').textContent    = 'Editar Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Salvar Alterações';
    document.getElementById('campoIsbn').value            = livro.isbn || '';
    document.getElementById('campoTitulo').value          = livro.title;
    document.getElementById('campoAutor').value           = livro.author;
    document.getElementById('campoDescricao').value       = livro.description || '';
    document.getElementById('campoStatus').value          = livro.status || 'NAO_LIDO';
    document.getElementById('campoRating').value          = livro.rating || '';
    document.getElementById('campoCurrentPage').value     = livro.currentPage || '';
    document.getElementById('campoReadDate').value        = livro.readDate || '';
    document.getElementById('campoReadDate').max          = new Date().toISOString().split('T')[0];
    document.getElementById('dadosLivro').style.display  = 'block';
    document.getElementById('modalOverlay').classList.add('aberto');
    atualizarCampoPagina();
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('aberto');
    tituloEditando = null;
}

function fecharModalFora(event) {
    if (event.target.id === 'modalOverlay') fecharModal();
}

// ─── Salvar ───────────────────────────────────────────────────────────────────

async function salvarLivro() {
    const titulo      = document.getElementById('campoTitulo').value.trim();
    const autor       = document.getElementById('campoAutor').value.trim();
    const status      = document.getElementById('campoStatus').value.trim();
    const isbn        = document.getElementById('campoIsbn').value.trim();
    const rating      = document.getElementById('campoRating').value.trim();
    const currentPage = document.getElementById('campoCurrentPage').value.trim();
    const description = document.getElementById('campoDescricao').value.trim();
    const readDate    = document.getElementById('campoReadDate').value || null;
    const email       = localStorage.getItem('userEmail');

    if (!titulo || !autor) { mostrarMensagem('Título e autor são obrigatórios.', 'error'); return; }

    const payload = { title: titulo, author: autor, isbn, ownerEmail: email, status, rating, currentPage, description, readDate };

    try {
        const response = tituloEditando
            ? await fetch(`${API_URL}/book/${encodeURIComponent(tituloEditando)}`,
                { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            : await fetch(`${API_URL}/book`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (response.ok) {
            mostrarMensagem(tituloEditando ? 'Obra atualizada!' : 'Obra adicionada ao acervo!', 'success');
            fecharModal();
            limparBusca();
            await carregarLivros();
        } else {
            const data = await response.json().catch(() => ({}));
            mostrarMensagem(data.message || 'Erro ao salvar.', 'error');
        }
    } catch (error) {
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

// ─── Deletar ──────────────────────────────────────────────────────────────────

async function deletarLivro(titulo) {
    if (!confirm(`Deseja remover "${titulo}" do acervo?`)) return;
    const email = localStorage.getItem('userEmail');

    try {
        const response = await fetch(
            `${API_URL}/book/${encodeURIComponent(titulo)}?email=${encodeURIComponent(email)}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            mostrarMensagem('Obra removida do acervo.', 'success');
            await carregarLivros();
        } else {
            mostrarMensagem('Erro ao remover a obra.', 'error');
        }
    } catch (error) {
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

// ─── Mensagem ─────────────────────────────────────────────────────────────────

function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent   = texto;
    el.className     = `message ${tipo}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
