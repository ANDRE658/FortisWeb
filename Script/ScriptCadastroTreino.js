// === VARIÁVEIS GLOBAIS ===
let exerciciosCatalogo = [];
const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"];

// Variáveis para o Modo Edição
let modoEdicao = false;
let fichaIdParaEditar = null;

/**
 * Carrega os Alunos (Dropdown)
 */
async function carregarAlunos() {
  const token = localStorage.getItem("jwtToken");
  const select = document.getElementById("alunoSelect");
  if (!token) {
    alert("Sessão expirada. Faça o login.");
    window.location.href = "Index.html";
    return Promise.reject(new Error("Sem token"));
  }

  try {
    const response = await fetch("http://localhost:8080/aluno/listar", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 204) {
      select.innerHTML = '<option value="">Nenhum aluno cadastrado</option>';
      return Promise.resolve();
    }
    if (!response.ok) {
      throw new Error("Falha ao buscar alunos");
    }

    const alunos = await response.json();
    select.innerHTML = '<option value="">Selecione um aluno</option>';
    alunos.forEach((aluno) => {
      select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
    });
    return Promise.resolve(); // Sucesso
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    select.innerHTML = '<option value="">Erro de conexão</option>';
    return Promise.reject(error);
  }
}

/**
 * Carrega o Catálogo de Exercícios (para os dropdowns)
 */
async function carregarExerciciosAPI() {
  const token = localStorage.getItem("jwtToken");
  if (!token) return Promise.reject(new Error("Sem token"));

  try {
    const response = await fetch("http://localhost:8080/exercicio/listar", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      exerciciosCatalogo = await response.json();
      return Promise.resolve();
    } else {
      console.error("Não foi possível carregar o catálogo de exercícios.");
      return Promise.reject(new Error("Falha ao carregar exercícios"));
    }
  } catch (error) {
    console.error("Erro ao carregar exercícios da API:", error);
    return Promise.reject(error);
  }
}

/**
 * Adiciona uma nova linha de exercício (em branco)
 */
function adicionarNovaLinha(diaSemana) {
  const tabelaBody = document.getElementById(`tabela-${diaSemana}`);
  if (!tabelaBody) return;

  const novaLinha = document.createElement("div");
  novaLinha.className = "table-row";
  novaLinha.innerHTML = `
    <div class="table-cell">
      <select class="form-control exercicio-select" required>
        <option value="">Selecione...</option>
      </select>
    </div>
    <div class="table-cell-small">
      <input type="number" class="input-serie" placeholder="3" min="1" required />
    </div>
    <div class="table-cell-small">
      <input type="text" class="input-rep" placeholder="10-12" required />
    </div>
    <div class="table-cell-small">
      <i class="bi bi-trash btn-remove-row" title="Remover linha"></i>
    </div>
  `;

  const select = novaLinha.querySelector(".exercicio-select");
  popularDropdown(select);
  tabelaBody.appendChild(novaLinha);

  // Retorna a linha criada para o modo de edição
  return novaLinha;
}

/**
 * Preenche um dropdown <select> com o catálogo
 */
function popularDropdown(selectElement) {
  if (!selectElement || exerciciosCatalogo.length === 0) return;
  exerciciosCatalogo.forEach((ex) => {
    selectElement.innerHTML += `<option value="${ex.id}">${ex.nome}</option>`;
  });
}

/**
 * Remove uma linha de exercício (lixeira)
 */
function removerLinha(event) {
  if (event.target && event.target.classList.contains("btn-remove-row")) {
    event.target.closest(".table-row").remove();
  }
}

// ======================================================
// === NOVA FUNÇÃO: CARREGAR FICHA (MODO EDIÇÃO) ===
// ======================================================
async function carregarFichaParaEdicao(id) {
  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  try {
    const response = await fetch(
      `http://localhost:8080/ficha-treino/buscar/${id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      alert("Erro ao carregar a ficha de treino. Voltando para a lista.");
      window.location.href = "Treinos.html";
      return;
    }

    const ficha = await response.json();

    // 1. Preenche o Aluno
    document.getElementById("alunoSelect").value = ficha.aluno.id;

    // 2. Itera sobre os Dias de Treino da Ficha
    for (const dia of ficha.diasDeTreino) {
      const diaSemana = dia.diaSemana; // "SEGUNDA", "TERCA", etc.

      // 3. Preenche o nome do treino (Ex: "Peito e Tríceps")
      document.getElementById(`nome-${diaSemana}`).value = dia.nome;

      // 4. Itera sobre os Itens (Exercícios) daquele dia
      if (dia.itensTreino) {
        for (const item of dia.itensTreino) {
          // 5. Adiciona uma linha em branco
          const novaLinha = adicionarNovaLinha(diaSemana);

          // 6. Preenche a linha com os dados
          // (API /buscar/{id} retorna a Entidade, usamos item.exercicio.id)
          novaLinha.querySelector(".exercicio-select").value = item.exercicio.id;
          novaLinha.querySelector(".input-serie").value = item.series;
          novaLinha.querySelector(".input-rep").value = item.repeticoes;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao carregar ficha para edição:", error);
  }
}

/**
 * Função principal: Salva (Cria OU Atualiza) a ficha completa
 */
async function salvarFichaCompleta(e) {
  e.preventDefault();
  const token = localStorage.getItem("jwtToken");
  const instrutorId = localStorage.getItem("instrutorId");
  const alunoId = document.getElementById("alunoSelect").value;

  if (!token || !instrutorId) {
    alert("Sessão inválida. Faça o login novamente.");
    return;
  }
  if (!alunoId) {
    alert("Por favor, selecione um aluno.");
    return;
  }

  // 1. Prepara o DTO "pai"
  const fichaCompletaDTO = {
    alunoId: parseInt(alunoId),
    instrutorId: parseInt(instrutorId),
    diasDeTreino: [],
  };

  let totalExercicios = 0;

  // 2. Itera sobre os 5 dias da semana (do HTML)
  for (const dia of DIAS_SEMANA) {
    const nomeTreino = document.getElementById(`nome-${dia}`).value;
    const tabela = document.getElementById(`tabela-${dia}`);
    const linhasExercicio = tabela.querySelectorAll(".table-row");

    if (nomeTreino && linhasExercicio.length > 0) {
      const diaDTO = {
        diaSemana: dia,
        nome: nomeTreino,
        itensTreino: [],
      };

      // 3. Itera sobre os exercícios daquele dia
      for (const linha of linhasExercicio) {
        const exercicioId = linha.querySelector(".exercicio-select").value;
        const series = linha.querySelector(".input-serie").value;
        const repeticoes = linha.querySelector(".input-rep").value;

        // Validação: Garante que o usuário selecionou um exercício
        if (!exercicioId) { // Se for "" ou null
            alert(`Treino de ${dia}: Você adicionou uma linha de exercício mas não selecionou qual é.`);
            return;
        }
        if (!series || !repeticoes) {
           alert(`Treino de ${dia}: Preencha as Séries e Repetições para o exercício "${linha.querySelector(".exercicio-select option:checked").text}".`);
           return;
        }

        // DTO de salvar espera "exercicioId"
        const itemDTO = {
          exercicioId: parseInt(exercicioId),
          series: parseInt(series),
          repeticoes: repeticoes,
          carga: 0,
          tempoDescansoSegundos: 60,
        };

        diaDTO.itensTreino.push(itemDTO);
        totalExercicios++;
      }
      fichaCompletaDTO.diasDeTreino.push(diaDTO);
    }
  }

  if (totalExercicios === 0) {
      alert("A ficha está vazia. Adicione pelo menos um exercício em um dos dias.");
      return;
  }

  // ===============================================
  // === Define o Método e a URL corretos ===
  // ===============================================
  const metodo = modoEdicao ? "PUT" : "POST";
  const url = modoEdicao
    ? `http://localhost:8080/ficha-treino/atualizar-completa/${fichaIdParaEditar}`
    : "http://localhost:8080/ficha-treino/salvar-completa";
  // ===============================================

  // 4. Envia o JSON gigante
  try {
    const response = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fichaCompletaDTO),
    });

    if (response.ok) { // 201 (Created) ou 200 (OK)
      alert(
        modoEdicao
          ? "Ficha atualizada com sucesso!"
          : "Ficha salva com sucesso!"
      );
      window.location.href = "Treinos.html";
    } else {
      const erro = await response.text();
      alert(`Erro ao salvar. Código: ${response.status}\n${erro}`);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível conectar à API.");
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", async function () {
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 1. Conecta o formulário à função salvar
  document
    .getElementById("criarTreinoForm")
    .addEventListener("submit", salvarFichaCompleta);

  // 2. Adiciona listeners para os botões "Adicionar"
  document.querySelectorAll(".btn-add-row").forEach((button) => {
    button.addEventListener("click", function () {
      const dia = this.getAttribute("data-dia");
      adicionarNovaLinha(dia);
    });
  });

  // 3. Adiciona listeners para os botões "Remover" (Lixeira)
  document.querySelectorAll(".table-body").forEach((tabela) => {
    tabela.addEventListener("click", removerLinha);
  });

  // ===============================================
  // === INÍCIO DO CÓDIGO DE NAVEGAÇÃO CORRIGIDO ===
  // ===============================================

  // 4. Lógica de navegação (Menu)
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });

  // 5. Lógica de navegação (Sair)
  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.clear(); // Limpa tudo
        window.location.href = "Index.html";
      }
    });

  // 6. Lógica de navegação (Home)
  document
    .querySelector(".navbar .bi-house-door")
    .addEventListener("click", function () {
      window.location.href = "Home.html";
    });

  // ===============================================
  // === FIM DO CÓDIGO DE NAVEGAÇÃO CORRIGIDO ===
  // ===============================================


  // 7. Lógica de Inicialização (EDITAR vs CRIAR)
  try {
    // 7.1. Carrega os dropdowns (Aluno e Catálogo de Exercícios) PRIMEIRO
    await carregarAlunos();
    await carregarExerciciosAPI();
  } catch (error) {
    console.error("Falha ao inicializar a página, parando.");
    return; // Para se os catálogos falharem
  }

  // 7.2. Verifica se estamos em Modo Edição
  const urlParams = new URLSearchParams(window.location.search);
  fichaIdParaEditar = urlParams.get("id");
  modoEdicao = fichaIdParaEditar !== null;

  if (modoEdicao) {
    // 7.3. Se for Edição, muda a UI e carrega os dados
    document.querySelector(".page-title").textContent = "Editar Ficha de Treino";
    document.querySelector(".btn-save").textContent = "ATUALIZAR FICHA";
    await carregarFichaParaEdicao(fichaIdParaEditar);
  }
  // Se não for modo de edição, a página simplesmente fica em branco, pronta para criar.
});