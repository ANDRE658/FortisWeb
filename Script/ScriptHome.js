document.addEventListener("DOMContentLoaded", function () {
  // 1. Configuração Básica
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Usuário";
  const role = localStorage.getItem("userRole"); // Pega a role salva no login
  const userElem = document.querySelector(".user-name");
  
  if (userElem) userElem.textContent = nomeUsuario;

  // Configura navegação do menu
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) window.location.href = pagina;
    });
  });

  // Configura Logout
  const btnSair = document.querySelector(".bi-box-arrow-right");
  if(btnSair) {
      btnSair.addEventListener("click", function () {
          if (confirm("Deseja sair do sistema?")) {
            localStorage.clear();
            window.location.href = "Index.html";
          }
      });
  }

  // ========================================================
  // === INÍCIO DA LÓGICA ATUALIZADA (DIVISÃO DE ROLES) ===
  // ========================================================
  if (role === 'ROLE_ALUNO') {
      configurarDashboardAluno();
  } else if (role === 'ROLE_INSTRUTOR') {
      configurarDashboardInstrutor();
  } else if (role === 'ROLE_GERENCIADOR') {
      configurarDashboardGerenciador();
  } else {
      // Fallback para caso a role não seja nenhuma (ou seja admin antigo)
      configurarDashboardGerenciador();
  }
});

// --- LÓGICA DO GERENCIADOR (ADMIN) ---
function configurarDashboardGerenciador() {
    // Mostra cards, esconde treino
    document.getElementById("adminDashboard").style.display = "flex";
    document.getElementById("alunoDashboard").style.display = "none";
    document.getElementById("welcomeTitle").textContent = "Painel Administrativo";

    carregarEstatisticasGlobais();

    // Links dos cards
    document.getElementById("cardAtivos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardInativos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardNovos").addEventListener("click", () => window.location.href = "Alunos.html");
}

async function carregarEstatisticasGlobais() {
  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  try {
    // Endpoint antigo (Global)
    const response = await fetch("http://localhost:8080/aluno/estatisticas", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const stats = await response.json();
      document.getElementById("valAtivos").textContent = stats.ativos;
      document.getElementById("valInativos").textContent = stats.inativos;
      document.getElementById("valNovos").textContent = stats.novos;
    }
  } catch (error) {
    console.error("Erro stats globais:", error);
  }
}


// --- (NOVO) LÓGICA DO INSTRUTOR ---
function configurarDashboardInstrutor() {
    // Mostra cards, esconde treino
    document.getElementById("adminDashboard").style.display = "flex";
    document.getElementById("alunoDashboard").style.display = "none";
    
    // Personaliza o título
    const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
    document.getElementById("welcomeTitle").textContent = `Painel do Instrutor: ${nomeUsuario}`;

    carregarEstatisticasInstrutor(); // Chama a nova função de fetch

    // Links dos cards
    document.getElementById("cardAtivos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardInativos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardNovos").addEventListener("click", () => window.location.href = "Alunos.html");
}

async function carregarEstatisticasInstrutor() {
  const token = localStorage.getItem("jwtToken");
  // O instrutorId é salvo no localStorage durante o login
  const instrutorId = localStorage.getItem("instrutorId"); 
  
  if (!token || !instrutorId) {
      console.error("Token ou ID do instrutor não encontrado no localStorage.");
      return;
  }

  try {
    // Chama o NOVO endpoint
    const response = await fetch(`http://localhost:8080/aluno/estatisticas/instrutor/${instrutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const stats = await response.json();
      document.getElementById("valAtivos").textContent = stats.ativos;
      document.getElementById("valInativos").textContent = stats.inativos;
      document.getElementById("valNovos").textContent = stats.novos;
    } else {
      console.error("Falha ao buscar estatísticas do instrutor:", response.status);
    }
  } catch (error) {
    console.error("Erro stats instrutor:", error);
  }
}


// --- LÓGICA DO ALUNO (Sem alteração) ---
async function configurarDashboardAluno() {
    // Esconde cards, mostra treino
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("alunoDashboard").style.display = "block";
    
    const diasSemana = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
    const diaHoje = diasSemana[new Date().getDay()]; // 0 = Domingo, 1 = Segunda...
    
    document.getElementById("welcomeTitle").textContent = `Bom treino, ${localStorage.getItem("usuarioLogado")}!`;
    document.getElementById("tituloTreinoDia").textContent = `Treino de ${capitalize(diaHoje)}`;

    const token = localStorage.getItem("jwtToken");
    const emailUsuario = localStorage.getItem("usuarioLogado"); // O login é o email

    try {
        // 1. Busca TODAS as fichas (endpoint existente)
        const response = await fetch("http://localhost:8080/ficha-treino/listar", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const fichas = await response.json();
            
            // 2. Encontra a ficha deste aluno (pelo email)
            const minhaFicha = fichas.find(f => f.aluno && f.aluno.email === emailUsuario);

            if (minhaFicha) {
                // 3. Busca os detalhes COMPLETOS desta ficha
                const responseFicha = await fetch(`http://localhost:8080/ficha-treino/buscar/${minhaFicha.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if(responseFicha.ok) {
                    const fichaCompleta = await responseFicha.json();
                    
                    // 4. Configura botão para "Ver Semana Completa"
                    const btnVerSemana = document.getElementById("btnVerSemana");
                    btnVerSemana.onclick = () => {
                        // (CORREÇÃO: Aluno deve ir para VerSemana.html, não CadastroTreino.html)
                        window.location.href = `VerSemana.html`;
                    };

                    // 5. Encontra o treino de HOJE
                    const treinoHoje = fichaCompleta.diasDeTreino.find(d => d.diaSemana === diaHoje);
                    
                    renderizarTreinoDoDia(treinoHoje);
                }
            } else {
                document.getElementById("listaExerciciosHoje").innerHTML = "<p>Você ainda não possui uma ficha de treino cadastrada.</p>";
                document.getElementById("btnVerSemana").style.display = "none";
            }
        }
    } catch (error) {
        console.error("Erro ao carregar treino:", error);
        document.getElementById("listaExerciciosHoje").innerHTML = "<p style='color:red'>Erro ao carregar treino.</p>";
    }
}

function renderizarTreinoDoDia(treino) {
    const container = document.getElementById("listaExerciciosHoje");
    container.innerHTML = "";

    if (!treino || !treino.itensTreino || treino.itensTreino.length === 0) {
        container.innerHTML = "<p>Descanso! Nenhum treino cadastrado para hoje.</p>";
        document.getElementById("nomeTreinoDia").textContent = "Descanso";
        document.getElementById("nomeTreinoDia").style.backgroundColor = "#28a745"; // Verde
        return;
    }

    document.getElementById("nomeTreinoDia").textContent = treino.nome || "Treino do Dia";

    treino.itensTreino.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-exercicio";
        
        // Pega o nome correto do exercício (do DTO)
        const nomeExercicio = (item.exercicio && item.exercicio.nome) ? item.exercicio.nome : "Exercício"; 

        div.innerHTML = `
            <span class="nome-exercicio">${nomeExercicio}</span>
            <span class="detalhes-exercicio">${item.series}x ${item.repeticoes}</span>
        `;
        container.appendChild(div);
    });
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}