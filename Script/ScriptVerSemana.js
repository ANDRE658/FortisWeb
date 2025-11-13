document.addEventListener("DOMContentLoaded", function () {
  // 1. Configuração Básica (Navegação)
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Usuário";
  const elUser = document.getElementById("userName");
  if (elUser) elUser.textContent = nomeUsuario;

  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) window.location.href = pagina;
    });
  });

  const btnSair = document.querySelector(".bi-box-arrow-right");
  if (btnSair) {
    btnSair.addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.clear();
        window.location.href = "Index.html";
      }
    });
  }

  const iconHome = document.getElementById("iconHome");
  if (iconHome) {
    iconHome.addEventListener("click", function () {
      window.location.href = "Home.html";
    });
  }

  // 2. Carregar o Treino
  carregarTreinoCompleto();
});

/**
 * Busca a ficha do aluno logado e renderiza a semana.
 */
async function carregarTreinoCompleto() {
  const token = localStorage.getItem("jwtToken");
  const emailUsuario = localStorage.getItem("usuarioLogado");

  const loadingMessage = document.getElementById("loadingMessage");
  const containerDias = document.getElementById("containerDias");
  const btnEditar = document.getElementById("btnEditarTreino");

  if (!token || !emailUsuario) {
    loadingMessage.innerHTML = "<p style='color:red'>Sessão inválida. Faça o login novamente.</p>";
    return;
  }

  try {
    // 1. Busca TODAS as fichas (endpoint existente)
    // (Idealmente, o back-end teria um endpoint /ficha-treino/minha-ficha)
    const response = await fetch("http://localhost:8080/ficha-treino/listar", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        if (response.status === 204) { // 204 = Lista vazia
            throw new Error("Você ainda não possui uma ficha de treino.");
        }
        throw new Error("Falha ao buscar fichas.");
    }

    const fichas = await response.json();

    // 2. Encontra a ficha deste aluno (pelo email)
    const minhaFicha = fichas.find(f => f.aluno && f.aluno.email === emailUsuario);

    if (!minhaFicha) {
        throw new Error("Você ainda não possui uma ficha de treino.");
    }

    // 3. Busca os detalhes COMPLETOS desta ficha
    const responseFicha = await fetch(`http://localhost:8080/ficha-treino/buscar/${minhaFicha.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    if(!responseFicha.ok) {
        throw new Error("Falha ao carregar detalhes da ficha.");
    }

    const fichaCompleta = await responseFicha.json();

    // 4. Configura o botão "Editar"
    btnEditar.addEventListener("click", () => {
        window.location.href = `CadastroTreino.html?id=${fichaCompleta.id}`;
    });

    // 5. Renderiza os treinos na tela
    renderizarSemana(fichaCompleta.diasDeTreino);
    
    // Mostra o conteúdo e esconde o "carregando"
    loadingMessage.style.display = "none";
    containerDias.style.display = "block";

  } catch (error) {
    console.error("Erro ao carregar treino:", error);
    loadingMessage.innerHTML = `<p style='color:red'>${error.message}</p>`;
    btnEditar.style.display = "none"; // Esconde botão de editar se deu erro
  }
}

/**
 * Preenche a tela com os dados do treino
 */
function renderizarSemana(diasDeTreino) {
  const DIAS = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"];

  DIAS.forEach(diaNome => {
    const nomeContainer = document.getElementById(`nome-${diaNome}`);
    const listaContainer = document.getElementById(`lista-${diaNome}`);

    if (!nomeContainer || !listaContainer) return;

    // Encontra o treino para este dia
    const treinoDoDia = diasDeTreino.find(d => d.diaSemana === diaNome);

    if (treinoDoDia && treinoDoDia.itensTreino && treinoDoDia.itensTreino.length > 0) {
      // Dia com treino
      nomeContainer.textContent = treinoDoDia.nome || "Treino";
      listaContainer.innerHTML = ""; // Limpa

      treinoDoDia.itensTreino.forEach(item => {
        // O endpoint /buscar/ retorna a entidade, então o nome está em item.exercicio.nome
        const nomeExercicio = item.exercicio ? item.exercicio.nome : "Exercício";
        
        const div = document.createElement("div");
        div.className = "exercise-item";
        div.innerHTML = `
            <span class="exercise-name">${nomeExercicio}</span>
            <span class="exercise-details">${item.series}x ${item.repeticoes}</span>
        `;
        listaContainer.appendChild(div);
      });

    } else {
      // Dia de Descanso
      nomeContainer.textContent = "Descanso";
      nomeContainer.style.backgroundColor = "#d4edda"; // Verde claro
      nomeContainer.style.color = "#155724";
      listaContainer.innerHTML = '<p class="empty-day">Nenhum exercício cadastrado.</p>';
    }
  });
}