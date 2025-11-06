/*
 * ARQUIVO: ScriptExercicios.js
 * (Versão unificada com tratamento de erro 403)
 */

// Variável global para armazenar a lista completa de exercícios
let todosExercicios = [];

/**
 * Função para renderizar a tabela com uma lista de exercícios
 * @param {Array} exercicios - A lista de exercícios a ser mostrada
 */
function renderizarTabela(exercicios) {
  const tbody = document.querySelector(".table-container table tbody");
  tbody.innerHTML = ""; // Limpa a tabela

  if (exercicios.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center">Nenhum exercício encontrado.</td></tr>';
    return;
  }

  exercicios.forEach((exercicio) => {
    // O status e o toggle são visuais por enquanto.
    const statusHtml = '<span class="status-ativo">Ativo</span>';

    const newRow = `
      <tr>
        <td>${exercicio.nome}</td>
        <td>${statusHtml}</td>
        <td>
          <label class="switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
          <i class="bi bi-pencil action-icon" data-exercicio-id="${exercicio.id}" title="Editar (Em breve)"></i>
        </td>
      </tr>
    `;
    tbody.innerHTML += newRow;
  });
}

/**
 * Função principal para carregar os exercícios da API
 */
async function carregarExercicios() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Sessão expirada. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/exercicio/listar", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // SUCESSO! A API retornou 200 OK.
      const exercicios = await response.json();
      todosExercicios = exercicios; // Salva na lista global
      renderizarTabela(todosExercicios); // Renderiza a tabela inicial
    
    } else if (response.status === 403) {
      // --- ESTE É O PROVÁVEL PROBLEMA ---
      // Erro 403 (Forbidden) = Usuário logado, mas SEM PERMISSÃO.
      console.error("Erro 403: O usuário não tem permissão para acessar /exercicio/listar.");
      alert("Você não tem permissão para visualizar esta página. Verifique se sua conta é de 'Instrutor' ou 'Gerenciador'.");
      renderizarTabela([]); // Mostra a tabela vazia
    
    } else {
      // Outros erros (500, 404, etc.)
      throw new Error("Erro ao carregar exercícios. Código: " + response.status);
    }
  } catch (error) {
    // Erros de rede (API offline) ou os erros "throw" acima
    console.error("Erro de rede ou na API:", error);
    const tbody = document.querySelector(".table-container table tbody");
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Falha ao conectar com a API. Verifique o console.</td></tr>`;
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // --- 1. LÓGICA DE NAVEGAÇÃO (Menu, Sair, Home) ---
  
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });

  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("instrutorId");
        window.location.href = "Index.html";
      }
    });

  document.getElementById("iconHome").addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  // --- 2. LÓGICA DA PÁGINA DE EXERCÍCIOS ---

  // Lógica da BARRA DE PESQUISA
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function (e) {
    const termoBusca = e.target.value.toLowerCase();
    const exerciciosFiltrados = todosExercicios.filter((exercicio) =>
      exercicio.nome.toLowerCase().includes(termoBusca)
    );
    renderizarTabela(exerciciosFiltrados);
  });

  // Botão "+ Cadastrar Exercício"
  document
    .getElementById("btCadastrarExercicio")
    .addEventListener("click", function () {
      window.location.href = "CadastroExercicio.html";
    });

    // 👇 **** INÍCIO DA ATUALIZAÇÃO ****
  // 6. Lógica de edição (funcionalidade futura)
  // Adiciona um listener no 'tbody' (que é fixo) para pegar cliques
  // nos ícones de lápis (que são dinâmicos)
  document.querySelector("tbody").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("action-icon")) {
      const exercicioId = e.target.getAttribute("data-exercicio-id");
      
      // Remove o alert() e redireciona
      // alert(`(Em breve) Editando exercício com ID: ${exercicioId}.`);
      window.location.href = `CadastroExercicio.html?id=${exercicioId}`;
    }
  });
  // 👆 **** FIM DA ATUALIZAÇÃO ****

  // --- 3. INICIALIZAÇÃO ---
  // Carrega a lista de exercícios da API assim que a página abre
  carregarExercicios();
});