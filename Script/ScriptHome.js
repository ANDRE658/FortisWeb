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
  // === LÓGICA DE DIRECIONAMENTO POR ROLE ===
  // ========================================================
  if (role === 'ROLE_ALUNO') {
      configurarDashboardAluno();
  } else if (role === 'ROLE_INSTRUTOR') {
      configurarDashboardInstrutor();
  } else if (role === 'ROLE_GERENCIADOR') {
      configurarDashboardGerenciador();
  } else {
      // Fallback padrão
      configurarDashboardGerenciador();
  }
});

// --- LÓGICA DO GERENCIADOR (ADMIN) ---
function configurarDashboardGerenciador() {
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


// --- LÓGICA DO INSTRUTOR ---
function configurarDashboardInstrutor() {
    document.getElementById("adminDashboard").style.display = "flex";
    document.getElementById("alunoDashboard").style.display = "none";
    
    const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
    document.getElementById("welcomeTitle").textContent = `Painel do Instrutor: ${nomeUsuario}`;

    carregarEstatisticasInstrutor();

    document.getElementById("cardAtivos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardInativos").addEventListener("click", () => window.location.href = "Alunos.html");
    document.getElementById("cardNovos").addEventListener("click", () => window.location.href = "Alunos.html");
}

async function carregarEstatisticasInstrutor() {
  const token = localStorage.getItem("jwtToken");
  const instrutorId = localStorage.getItem("instrutorId"); 
  
  if (!token || !instrutorId) return;

  try {
    const response = await fetch(`http://localhost:8080/aluno/estatisticas/instrutor/${instrutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const stats = await response.json();
      document.getElementById("valAtivos").textContent = stats.ativos;
      document.getElementById("valInativos").textContent = stats.inativos;
      document.getElementById("valNovos").textContent = stats.novos;
    }
  } catch (error) {
    console.error("Erro stats instrutor:", error);
  }
}


// --- LÓGICA DO ALUNO (REFATORADA PARA USAR ID) ---
async function configurarDashboardAluno() {
    // Esconde cards, mostra painel de treino
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("alunoDashboard").style.display = "block";
    
    const diasSemana = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
    const diaHoje = diasSemana[new Date().getDay()]; 
    
    document.getElementById("welcomeTitle").textContent = `Bom treino, ${localStorage.getItem("usuarioLogado")}!`;
    document.getElementById("tituloTreinoDia").textContent = `Treino de ${capitalize(diaHoje)}`;

    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
        mostrarSemTreino("Sessão inválida. Faça login novamente.");
        return;
    }

    try {
        // PASSO 1: Descobre o ID do Aluno logado
        const responseMe = await fetch("http://localhost:8080/aluno/me", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!responseMe.ok) {
            mostrarSemTreino("Não foi possível carregar seus dados.");
            return;
        }
        
        const dadosAluno = await responseMe.json();
        const meuId = dadosAluno.id;

        // PASSO 2: Busca a lista de fichas
        const response = await fetch("http://localhost:8080/ficha-treino/listar", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 204) {
             mostrarSemTreino("Você ainda não possui uma ficha de treino cadastrada.");
             return;
        }

        if (response.ok) {
            const fichas = await response.json();
            
            // PASSO 3: Compara pelo ID (Muito mais seguro que email)
            const minhaFicha = fichas.find(f => f.aluno && f.aluno.id === meuId);

            if (minhaFicha) {
                // PASSO 4: Busca detalhes da ficha
                const responseFicha = await fetch(`http://localhost:8080/ficha-treino/buscar/${minhaFicha.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if(responseFicha.ok) {
                    const fichaCompleta = await responseFicha.json();
                    
                    const btnVerSemana = document.getElementById("btnVerSemana");
                    if(btnVerSemana) {
                        btnVerSemana.onclick = () => {
                            window.location.href = `VerSemana.html`;
                        };
                        btnVerSemana.style.display = "block"; 
                    }

                    // Encontra o treino de HOJE
                    const listaDias = fichaCompleta.diasDeTreino || [];
                    const treinoHoje = listaDias.find(d => d.diaSemana === diaHoje);
                    
                    renderizarTreinoDoDia(treinoHoje);
                } else {
                    mostrarSemTreino("Erro ao carregar detalhes da ficha.");
                }
            } else {
                mostrarSemTreino("Você ainda não possui uma ficha de treino ativa.");
            }
        } else {
             mostrarSemTreino("Erro ao conectar com o servidor.");
        }
    } catch (error) {
        console.error("Erro ao carregar treino:", error);
        mostrarSemTreino("Erro ao carregar treino.");
    }
}

// Função auxiliar para mostrar mensagem de erro/vazio e limpar a tela
function mostrarSemTreino(mensagem) {
    document.getElementById("listaExerciciosHoje").innerHTML = `<p>${mensagem}</p>`;
    const btn = document.getElementById("btnVerSemana");
    if(btn) btn.style.display = "none";
    document.getElementById("nomeTreinoDia").textContent = "--";
}

function renderizarTreinoDoDia(treino) {
    const container = document.getElementById("listaExerciciosHoje");
    container.innerHTML = "";

    // Se não houver treino cadastrado para o dia de hoje
    if (!treino || !treino.itensTreino || treino.itensTreino.length === 0) {
        container.innerHTML = "<p>Descanso! Nenhum treino cadastrado para hoje.</p>";
        const badge = document.getElementById("nomeTreinoDia");
        if(badge) {
            badge.textContent = "Descanso";
            badge.style.backgroundColor = "#28a745"; // Verde
        }
        return;
    }

    const badge = document.getElementById("nomeTreinoDia");
    if(badge) {
        badge.textContent = treino.nome || "Treino do Dia";
        badge.style.backgroundColor = "#007bff"; // Azul (reset)
    }

    treino.itensTreino.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-exercicio";
        
        // Pega o nome correto do exercício com proteção contra nulos
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