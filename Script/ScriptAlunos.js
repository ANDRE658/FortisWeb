// Variável global para armazenar a lista completa de alunos
let todosAlunos = [];

// Função para renderizar a tabela com uma lista de alunos
function renderizarTabela(alunos) {
  const tbody = document.querySelector(".table-container table tbody");
  tbody.innerHTML = ""; // Limpa a tabela

  if (alunos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum aluno encontrado.</td></tr>';
    return;
  }

  alunos.forEach(aluno => {
    // Tenta pegar o nome do plano. O Aluno.java tem matriculaList
    // A Matricula.java tem Plano. O Plano.java tem nome.
    // Isso é complexo e o JSON pode não trazer tudo.
    // Vamos simplificar por enquanto (e melhorar depois, se necessário):
    const planoNome = aluno.matriculaList && aluno.matriculaList.length > 0 
                      ? "Plano Ativo" // Você pode ajustar isso
                      : "Sem Plano";

    // O modelo Aluno.java não tem "status". Vamos simular.
    const statusHtml = '<span class="status-ativo">Ativo</span>';

    const newRow = `
      <tr>
        <td>${aluno.nome}</td>
        <td>${planoNome}</td>
        <td>${statusHtml}</td>
        <td>
          <label class="switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
          <i class="bi bi-pencil action-icon" data-aluno-id="${aluno.id}"></i>
        </td>
      </tr>
    `;
    tbody.innerHTML += newRow;
  });
}

// Função principal para carregar os alunos da API
async function carregarAlunos() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    alert("Sessão expirada. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/aluno/listar', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const alunos = await response.json();
      todosAlunos = alunos; // Salva na lista global
      renderizarTabela(todosAlunos); // Renderiza a tabela
    } else if (response.status === 403) {
      alert("Sua sessão expirou. Faça o login novamente.");
      window.location.href = "Index.html";
    } else {
      alert("Erro ao carregar alunos. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Não foi possível conectar à API para listar os alunos.");
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Carrega o nome do usuário (como no seu código original)
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 2. Carrega a lista de alunos da API
  carregarAlunos();

  // 3. Adiciona a lógica da BARRA DE BUSCA
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function (e) {
    const termoBusca = e.target.value.toLowerCase();
    
    // Filtra a lista 'todosAlunos'
    const alunosFiltrados = todosAlunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(termoBusca)
    );
    
    // Renderiza a tabela apenas com os alunos filtrados
    renderizarTabela(alunosFiltrados);
  });

  // 4. Lógica de navegação (do seu código original)
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function(event) {
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

  // 7. Botão Cadastrar Aluno (do seu código original)
  document.getElementById("btCadastrarAluno").addEventListener("click", function () {
    window.location.href = "CadastroAluno.html";
  });

  // 8. Lógica de edição (do seu código original, mas agora em um listener dinâmico)
  // Como os ícones são criados dinamicamente, temos que usar um listener "delegado"
  document.querySelector("tbody").addEventListener("click", function(e) {
    if (e.target && e.target.classList.contains('action-icon')) {
      const alunoId = e.target.getAttribute('data-aluno-id');
      alert(`Editando aluno com ID: ${alunoId}. (Implementação futura)`);
      // Aqui você pode redirecionar para a tela de cadastro passando o ID
      // window.location.href = `CadastroAluno.html?id=${alunoId}`;
    }
  });

});