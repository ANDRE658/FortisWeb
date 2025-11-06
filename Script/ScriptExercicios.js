// (Req 2) Variável global para armazenar a lista completa de exercícios
let todosExercicios = [];

/**
 * (Req 1) Função para renderizar a tabela com uma lista de exercícios
 * @param {Array} exercicios - A lista de exercícios a ser mostrada
 */
function renderizarTabela(exercicios) {
  const tbody = document.querySelector(".table-container table tbody");
  tbody.innerHTML = ""; // Limpa a tabela

  // Se não houver exercícios, mostra uma mensagem
  if (exercicios.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center">Nenhum exercício encontrado.</td></tr>';
    return;
  }

  // Cria uma linha (<tr>) para cada exercício
  exercicios.forEach((exercicio) => {
    // O DTO só tem 'id' e 'nome'.
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
 * (Req 1) Função principal para carregar os exercícios da API
 */
async function carregarExercicios() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Sessão expirada. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  try {
    // Busca no endpoint de listagem
    const response = await fetch("http://localhost:8080/exercicio/listar", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const exercicios = await response.json();
      todosExercicios = exercicios; // Salva na lista global
      renderizarTabela(todosExercicios); // Renderiza a tabela inicial
    } else if (response.status === 403) {
      alert("Sua sessão expirou. Faça o login novamente.");
      window.location.href = "Index.html";
    } else {
      alert("Erro ao carregar exercícios. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Não foi possível conectar à API para listar os exercícios.");
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Carrega o nome do usuário
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 2. (Req 1) Carrega a lista de exercícios da API
  carregarExercicios();

  // 3. (Req 3) Adiciona a lógica da BARRA DE PESQUISA
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function (e) {
    const termoBusca = e.target.value.toLowerCase();

    // Filtra a lista 'todosExercicios'
    const exerciciosFiltrados = todosExercicios.filter((exercicio) =>
      exercicio.nome.toLowerCase().includes(termoBusca)
    );

    // Renderiza a tabela apenas com os exercícios filtrados
    renderizarTabela(exerciciosFiltrados);
  });

  // 4. Lógica de navegação (menus, sair, home)
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

  // 5. Botão "+ Cadastrar Exercício"
  document
    .getElementById("btCadastrarExercicio")
    .addEventListener("click", function () {
      window.location.href = "CadastroExercicio.html";
    });

  // 6. Lógica de edição (funcionalidade futura)
  // Adiciona um listener no 'tbody' (que é fixo) para pegar cliques
  // nos ícones de lápis (que são dinâmicos)
  document.querySelector("tbody").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("action-icon")) {
      const exercicioId = e.target.getAttribute("data-exercicio-id");
      alert(`(Em breve) Editando exercício com ID: ${exercicioId}.`);
      // No futuro, você pode redirecionar para a tela de cadastro:
      // window.location.href = `CadastroExercicio.html?id=${exercicioId}`;
    }
  });
});