// Função helper para criar o treino e redirecionar
async function criarTreinoParaDia(diaSemana) {
  const token = localStorage.getItem("jwtToken");
  const instrutorId = localStorage.getItem("instrutorId");
  const alunoId = document.getElementById("alunoSelect").value;
  const nomeTreino = document.getElementById("nomeTreino").value;

  // 1. Validação
  if (!alunoId) {
    alert("Por favor, selecione um aluno.");
    return;
  }
  if (!nomeTreino) {
    alert("Por favor, digite um nome para o treino (Ex: Upper/Lower).");
    return;
  }
  if (!token || !instrutorId) {
    alert("Sessão expirada ou instrutor não encontrado. Faça o login novamente.");
    window.location.href = "Index.html";
    return;
  }

  // 2. Monta o DTO para a API
  const treinoData = {
    nome: nomeTreino,
    diaSemana: diaSemana, // Ex: "SEGUNDA"
    alunoId: parseInt(alunoId),
    instrutorId: parseInt(instrutorId)
  };

  // 3. Salva o treino (Passo 1 do backend)
  try {
    const response = await fetch('http://localhost:8080/treino/salvar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(treinoData)
    });

    if (response.status === 201) {
      const treinoCriado = await response.json();
      
      // 4. Redireciona para a tela de adicionar exercícios (Passo 2)
      // Passa o ID do treino criado, o nome do aluno e o dia
      const alunoNome = document.getElementById("alunoSelect").options[document.getElementById("alunoSelect").selectedIndex].text;
      
      window.location.href = `AdicionarExercicio.html?treinoId=${treinoCriado.id}&aluno=${alunoNome}&dia=${diaSemana}`;
    
    } else if (response.status === 404) {
       alert("Erro: Aluno ou Instrutor não encontrado na API.");
    } else {
       alert("Erro ao criar o treino. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível conectar à API.");
  }
}

// Função para carregar os alunos no dropdown
async function carregarAlunos() {
  const token = localStorage.getItem('jwtToken');
  const select = document.getElementById("alunoSelect");
  
  if (!token) {
    alert("Sessão expirada. Faça o login.");
    window.location.href = "Index.html";
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/aluno/listar', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const alunos = await response.json();
      select.innerHTML = '<option value="">Selecione um aluno</option>'; // Limpa o "Carregando..."
      alunos.forEach(aluno => {
        select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
      });
    } else {
      select.innerHTML = '<option value="">Erro ao carregar alunos</option>';
    }
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    select.innerHTML = '<option value="">Erro de conexão</option>';
  }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Carrega o nome do usuário
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // 2. Popula o dropdown de alunos
  carregarAlunos();

  // 3. Adiciona os cliques nos dias da semana
  document.getElementById("btEditarSegunda").addEventListener("click", () => criarTreinoParaDia("SEGUNDA"));
  document.getElementById("btEditarTerca").addEventListener("click", () => criarTreinoParaDia("TERCA"));
  document.getElementById("btEditarQuarta").addEventListener("click", () => criarTreinoParaDia("QUARTA"));
  document.getElementById("btEditarQuinta").addEventListener("click", () => criarTreinoParaDia("QUINTA"));
  
  // (Ajuste no HTML, o seu ID estava errado para sexta)
  const btSexta = document.querySelector(".btEditarSexta"); // Pega pela classe
  if(btSexta) {
    btSexta.addEventListener("click", () => criarTreinoParaDia("SEXTA"));
  }

  // 4. Lógica de navegação
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function(event) {
        const pagina = event.currentTarget.dataset.page; 
        if (pagina) {
            window.location.href = pagina;
        }
    });
  });

  // 5. Botão de sair
  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("instrutorId"); // Limpa tudo
        window.location.href = "login.html";
      }
    });
    
  // 6. Botão Salvar (agora sem função, pois a ação está nos dias)
  document.getElementById("criarTreinoForm").addEventListener("submit", function(e) {
      e.preventDefault();
      alert("Por favor, clique no dia da semana que deseja editar/adicionar.");
  });
});