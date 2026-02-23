# 📚 Catalogus - Sistema de Gerenciamento de Livros

Sistema completo de gerenciamento de livros com autenticação de usuários, desenvolvido com **Java + Spring Boot** no backend e **HTML/CSS/JavaScript** puro no frontend.

---

## 🚀 Tecnologias Utilizadas

### Backend
- Java 17+
- Spring Boot
- Spring Security
- Spring Data JPA
- H2 Database (desenvolvimento)
- Lombok
- BCrypt (criptografia de senhas)

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API

---

## 📋 Funcionalidades

### Autenticação
- ✅ Registro de usuário
- ✅ Login com email e senha
- ✅ Criptografia de senhas com BCrypt
- ✅ Persistência de sessão com localStorage

### Gerenciamento de Livros
- ✅ Listar todos os livros
- ✅ Adicionar novo livro
- ✅ Editar livro existente
- ✅ Deletar livro
- ✅ Buscar livro por título

---

## 🔧 Configuração e Instalação

### Passo 1: Configurar o Backend

1. **Adicione o CORS no BookController**
   
   Abra o arquivo `BookController.java` e adicione a anotação `@CrossOrigin("*")` antes de `@RestController`:

   ```java
   @CrossOrigin("*")  // ← ADICIONE ESTA LINHA
   @RestController
   @RequestMapping("/book")
   public class BookController {
       // ... resto do código
   }
   ```

2. **Execute o projeto Spring Boot**
   
   ```bash
   # Via Maven
   mvn spring-boot:run
   
   # Ou via IDE (IntelliJ, Eclipse, VSCode)
   # Clique com botão direito no arquivo principal e escolha "Run"
   ```

3. **Verifique se está rodando**
   
   O backend deve estar rodando em: `http://localhost:8080`

### Passo 2: Configurar o Frontend

1. **Coloque todos os arquivos HTML, CSS e JS na mesma pasta:**
   - `index.html` (página de login)
   - `dashboard.html` (página principal)
   - `styles.css` (estilos)
   - `auth.js` (lógica de autenticação)
   - `dashboard.js` (lógica do dashboard)

2. **Abra o arquivo `index.html` no navegador**
   
   Você pode:
   - Dar duplo clique no arquivo `index.html`
   - Ou usar a extensão **Live Server** do VSCode
   - Ou usar qualquer servidor HTTP simples

### Passo 3: Testar a Aplicação

1. **Registre um novo usuário:**
   - Email: `teste@email.com`
   - Senha: `123456`

2. **Faça login com as credenciais criadas**

3. **Adicione alguns livros para testar:**
   - Título: `Dom Casmurro`
   - Autor: `Machado de Assis`
   - ISBN: `978-8535908770`

---

## 🌐 Endpoints da API

### Autenticação

**POST** `/auth/register`
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**POST** `/auth/login`
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Livros

**GET** `/book/list` - Listar todos os livros

**GET** `/book/{titulo}` - Buscar livro por título

**POST** `/book` - Adicionar novo livro
```json
{
  "title": "Nome do Livro",
  "author": "Nome do Autor",
  "isbn": "978-1234567890"
}
```

**PUT** `/book/{id}` - Atualizar livro
```json
{
  "title": "Nome Atualizado",
  "author": "Autor Atualizado",
  "isbn": "978-0987654321"
}
```

**DELETE** `/book/{titulo}` - Deletar livro

---

## 📁 Estrutura do Projeto

```
catalogus/
├── backend/
│   ├── src/main/java/io/thalita/vitor/catalogus/
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── BookController.java
│   │   │   ├── LoginRequest.java
│   │   │   └── RegisterRequest.java
│   │   ├── dto/
│   │   │   ├── BookRequestDTO.java
│   │   │   └── BookResponseDTO.java
│   │   ├── model/
│   │   │   ├── Book.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── BookRepository.java
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   └── SecurityConfig.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── CustomUserDetailsService.java
│   │       └── UserService.java
│   └── application.properties
│
└── frontend/
    ├── index.html
    ├── dashboard.html
    ├── styles.css
    ├── auth.js
    └── dashboard.js
```

---

## 🎨 Design e Interface

O frontend foi projetado com:
- Design moderno e responsivo
- Gradientes coloridos
- Animações suaves
- Feedback visual para ações do usuário
- Cards interativos para os livros
- Formulários com validação

---

## ⚠️ Possíveis Problemas e Soluções

### Erro de CORS
**Problema:** Frontend não consegue fazer requisições ao backend

**Solução:** 
- Certifique-se de adicionar `@CrossOrigin("*")` no `BookController`
- Verifique se o backend está rodando na porta 8080

### Erro 404
**Problema:** Endpoints não encontrados

**Solução:**
- Confirme que o backend está rodando
- Verifique se a URL no arquivo JavaScript está correta (`http://localhost:8080`)

### Livros não aparecem
**Problema:** Lista vazia mesmo depois de adicionar livros

**Solução:**
- Abra o Console do navegador (F12) e verifique erros
- Confirme que o banco de dados H2 está configurado corretamente
- Teste os endpoints diretamente usando Postman ou Insomnia

---

## 🔐 Segurança

- Senhas criptografadas com BCrypt
- Validação de entrada nos formulários
- Proteção contra injeção SQL (JPA)
- CORS configurado para ambiente de desenvolvimento

**⚠️ IMPORTANTE:** Esta é uma versão de desenvolvimento. Para produção, você deve:
- Implementar JWT (JSON Web Tokens)
- Configurar CORS apenas para domínios específicos
- Usar HTTPS
- Adicionar validação mais robusta
- Implementar rate limiting

---

## 📚 Próximos Passos para Melhorar o Projeto

1. **Adicionar mais campos ao livro:**
   - Ano de publicação
   - Editora
   - Número de páginas
   - Categoria/Gênero
   - Capa do livro (upload de imagem)

2. **Implementar busca e filtros:**
   - Buscar por autor
   - Filtrar por categoria
   - Ordenar por título/autor

3. **Adicionar paginação:**
   - Limitar quantidade de livros por página
   - Implementar navegação entre páginas

4. **Melhorar autenticação:**
   - Implementar JWT
   - Adicionar "Esqueci minha senha"
   - Adicionar verificação de email

5. **Dashboard mais completo:**
   - Estatísticas (total de livros, autores, etc.)
   - Gráficos
   - Livros favoritos

---

## 👨‍💻 Como Contribuir

Este é um projeto de aprendizado! Sinta-se livre para:
- Adicionar novas funcionalidades
- Melhorar o design
- Corrigir bugs
- Otimizar o código

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Spring Boot
3. Teste os endpoints com Postman/Insomnia
4. Revise este README

---

## ✅ Checklist de Verificação

- [ ] Backend rodando na porta 8080
- [ ] CORS adicionado no BookController
- [ ] Todos os arquivos frontend na mesma pasta
- [ ] index.html abre no navegador
- [ ] Consegue registrar novo usuário
- [ ] Consegue fazer login
- [ ] Consegue adicionar livros
- [ ] Consegue ver lista de livros
- [ ] Consegue editar livros
- [ ] Consegue deletar livros

---

Desenvolvido com ❤️ para aprendizado de integração Frontend + Backend
