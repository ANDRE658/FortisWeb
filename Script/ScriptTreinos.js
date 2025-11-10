// Variável global para armazenar a lista completa de fichas
let todasFichas = [];

/**
 * Função para renderizar a tabela com uma lista de Fichas de Treino
 * @param {Array} fichas - A lista de Fichas a ser mostrada
 */
function renderizarTabela(fichas) {
  const tbody = document.querySelector(".table-container table tbody");
  tbody.innerHTML = ""; // Limpa a tabela

  if (fichas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">Nenhum treino (ficha) encontrado.</td></tr>';
    return;
  }

  fichas.forEach((ficha) => {
    // O backend já nos mandou o Aluno junto com a Ficha
    const nomeAluno = ficha.aluno ? ficha.aluno.nome : "Aluno não encontrado";
    const nomeTreino = ficha.nome; // Ex: "Upper / Lower"
    
    // Status (simulado, pois não temos no backend)
    const statusHtml = '<span class="status-ativo">Ativo</span>';

    const newRow = `
      <tr>
        <td>${nomeAluno}</td>
        <td>${nomeTreino}</td>
        <td>${statusHtml}</td>
        <td>
          <i class="bi bi-pencil action-icon" data-ficha-id="${ficha.id}" title="Editar / Ver Treino"></i>
        </td>
      </tr>
    `;
    tbody.innerHTML += newRow;
  });
}

/**
 * Função principal para carregar as Fichas de Treino da API
 */
async function carregarFichasDeTreino() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Sessão expirada. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/ficha-treino/listar", { // <-- NOSSO NOVO ENDPOINT
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const fichas = await response.json();
      todasFichas = fichas; // Salva na lista global
      renderizarTabela(todasFichas); // Renderiza a tabela
    } else if (response.status === 204) {
      // 204 No Content (lista vazia)
      renderizarTabela([]); // Renderiza a tabela com a mensagem "Nenhum treino"
    } else if (response.status === 403) {
      alert("Sua sessão expirou ou você não tem permissão. Faça o login novamente.");
      window.location.href = "Index.html";
    } else {
      alert("Erro ao carregar treinos. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Não foi possível conectar à API para listar os treinos.");
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Carrega o nome do usuário
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 2. Lógica de navegação (Menu, Sair, Home)
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
        localStorage.clear();
        window.location.href = "Index.html";
      }
    });

  document.getElementById("iconHome").addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  // 3. Botão "+ CRIAR TREINO"
  document.getElementById("btnCriarTreino").addEventListener("click", function () {
      // Redireciona para a tela de cadastro SEM ID (modo de criação)
      window.location.href = "CadastroTreino.html";
  });

  // 4. Lógica de Edição (Clique no Lápis)
  // Usamos "event delegation" pois os ícones são criados dinamicamente
  document.querySelector("tbody").addEventListener("click", function(e) {
    if (e.target && e.target.classList.contains('action-icon')) {
      const fichaId = e.target.getAttribute('data-ficha-id');
      
      // Redireciona para a tela de cadastro COM ID (modo de edição/visualização)
      window.location.href = `CadastroTreino.html?id=${fichaId}`;
    }
  });

  // 5. INICIALIZAÇÃO: Carrega as fichas da API
  carregarFichasDeTreino();
});