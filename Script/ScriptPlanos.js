// Variável global para armazenar a lista completa de planos
let todosPlanos = [];

// Função para formatar o valor como Moeda (BRL)
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Função para renderizar a tabela com uma lista de planos
function renderizarTabela(planos) {
  const tbody = document.querySelector(".table-container table tbody");
  tbody.innerHTML = ""; // Limpa a tabela

  if (planos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">Nenhum plano cadastrado.</td></tr>';
    return;
  }

  planos.forEach((plano) => {
    // O modelo Plano.java não tem "status",
    // então vamos assumir 'Ativo' como padrão, como no seu HTML estático.
    const statusHtml = '<span class="status-ativo">Ativo</span>';

    const newRow = `
      <tr>
        <td>${plano.nome}</td>
        <td>${statusHtml}</td>
        <td>${formatarMoeda(plano.valor)}</td>
        <td>
          <i class="bi bi-pencil action-icon" data-plano-id="${plano.id}"></i>
          <label class="switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </td>
      </tr>
    `;
    tbody.innerHTML += newRow;
  });
}

// Função principal para carregar os planos da API
async function carregarPlanos() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Sessão expirada. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/plano/listar", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const planos = await response.json();
      todosPlanos = planos; // Salva na lista global
      renderizarTabela(todosPlanos); // Renderiza a tabela
    } else if (response.status === 403) {
      alert("Sua sessão expirou. Faça o login novamente.");
      window.location.href = "Index.html";
    } else {
      alert("Erro ao carregar planos. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Não foi possível conectar à API para listar os planos.");
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  // 1. Carrega o nome do usuário (como no seu código original)
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 2. Carrega a lista de planos da API
  carregarPlanos();

  // 3. Adiciona a lógica da BARRA DE BUSCA
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function (e) {
    const termoBusca = e.target.value.toLowerCase();

    // Filtra a lista 'todosPlanos'
    const planosFiltrados = todosPlanos.filter((plano) =>
      plano.nome.toLowerCase().includes(termoBusca)
    );

    // Renderiza a tabela apenas com os planos filtrados
    renderizarTabela(planosFiltrados);
  });

  // 4. Lógica de navegação (do seu código original)
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });

  // 5. Botão de sair (do seu código original)
  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("jwtToken"); // Limpa o token
        window.location.href = "Index.html";
      }
    });

  // 6. Botão de Home (do seu código original)
  document.getElementById("iconHome").addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  // 7. Botão Cadastrar Plano (do seu código original)
  document
    .getElementById("btCadastrarPlano")
    .addEventListener("click", function () {
      window.location.href = "CadastroPlano.html";
    });
  // 8. Lógica de edição (NOVO: torna os ícones de lápis funcionais)
  document.querySelector("tbody").addEventListener("click", function (e) {
    // Verifica se o que foi clicado é o ícone de lápis
    if (e.target && e.target.classList.contains("action-icon")) {
      // Pega o ID do plano que colocamos no 'data-plano-id'
      const planoId = e.target.getAttribute("data-plano-id");

      // Redireciona para a tela de cadastro, passando o ID na URL
      window.location.href = `CadastroPlano.html?id=${planoId}`;
    }
  });

  // 9. Lógica de edição (do seu código original, agora dinâmica)
  document.querySelector("tbody").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("action-icon")) {
      const planoId = e.target.getAttribute("data-plano-id");
      alert(`Editando plano com ID: ${planoId}. (Implementação futura)`);
      // window.location.href = `CadastroPlano.html?id=${planoId}`;
    }
  });
});
