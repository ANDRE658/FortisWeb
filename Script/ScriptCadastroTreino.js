// Variável global para guardar o ID da Ficha depois que ela for salva
let fichaIdSalva = null;

/**
 * Função para carregar os alunos no dropdown (versão corrigida)
 */
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

    // Causa 1: Sem permissão
    if (response.status === 403) {
      console.error("Erro 403: O usuário não tem permissão para /aluno/listar.");
      select.innerHTML = '<option value="">(Sem permissão)</option>';
      alert("Você não tem permissão para carregar a lista de alunos.");
      return;
    }

    // Causa 2: Lista vazia (API retorna 204 No Content)
    if (response.status === 204) {
      console.log("A lista de alunos está vazia (204 No Content).");
      select.innerHTML = '<option value="">Nenhum aluno cadastrado</option>';
      return;
    }

    // Causa 3: Outro erro
    if (!response.ok) { // Status 500, 404, etc.
      throw new Error("Falha ao buscar alunos: " + response.status);
    }
    
    // Sucesso (Status 200 OK)
    const alunos = await response.json();
    select.innerHTML = '<option value="">Selecione um aluno</option>';
    alunos.forEach(aluno => {
      select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
    });

  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    select.innerHTML = '<option value="">Erro de conexão</option>';
  }
}

/**
 * Salva a "Ficha" principal (Passo 1)
 */
async function salvarFicha(e) {
  e.preventDefault(); // Impede o envio padrão do formulário
  
  const token = localStorage.getItem("jwtToken");
  const instrutorId = localStorage.getItem("instrutorId");
  const alunoId = document.getElementById("alunoSelect").value;
  const nomeTreino = document.getElementById("nomeTreino").value;

  if (!alunoId || !nomeTreino) {
    alert("Selecione um Aluno e dê um Nome ao treino.");
    return;
  }

  const fichaData = {
    nome: nomeTreino,
    alunoId: parseInt(alunoId),
    instrutorId: parseInt(instrutorId)
  };

  try {
    const response = await fetch('http://localhost:8080/ficha-treino/salvar', { // <-- NOVO ENDPOINT
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fichaData)
    });

    if (response.status === 201) { // 201 Created
      const fichaCriada = await response.json();
      fichaIdSalva = fichaCriada.id; // <-- SALVA O ID GLOBALMENTE

      alert("Ficha salva com sucesso! Agora adicione os treinos para cada dia.");

      // Trava o formulário de cima
      document.getElementById("alunoSelect").disabled = true;
      document.getElementById("nomeTreino").disabled = true;
      
      // Muda o botão de Salvar para "Ficha Salva" e o desabilita
      const btnSalvar = document.querySelector(".btn-save");
      btnSalvar.textContent = "FICHA SALVA";
      btnSalvar.disabled = true;
      
    } else {
      alert("Erro ao salvar a ficha. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição da ficha:", error);
    alert("Não foi possível conectar à API para salvar a ficha.");
  }
}

/**
 * Modificada: Cria o "Dia" (Passo 2) e redireciona
 */
async function criarTreinoParaDia(diaSemana) {
  if (!fichaIdSalva) {
    alert("Por favor, preencha o Nome do Treino, selecione o Aluno e clique em 'SALVAR' primeiro.");
    return;
  }
  const token = localStorage.getItem("jwtToken");
  const diaData = {
    fichaId: fichaIdSalva,
    diaSemana: diaSemana
  };

  try {
    const response = await fetch('http://localhost:8080/treino/salvar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(diaData)
    });

    if (response.status === 201) {
      const diaCriado = await response.json();
      const alunoNomeSelect = document.getElementById("alunoSelect");
      const alunoNome = alunoNomeSelect.options[alunoNomeSelect.selectedIndex].text;
      
      // Agora passamos o ID do Dia (treinoId) E o ID da Ficha (fichaId)
      window.location.href = `AdicionarExercicio.html?treinoId=${diaCriado.id}&fichaId=${fichaIdSalva}&aluno=${alunoNome}&dia=${diaSemana}`;
      
    } else {
      alert("Erro ao criar o dia de treino. Código: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição do dia:", error);
    alert("Não foi possível conectar à API para salvar o dia.");
  }
}


/**
 * NOVA FUNÇÃO: Busca a ficha completa e seus filhos na API.
 */
async function carregarFichaExistente(id) {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:8080/ficha-treino/buscar/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const ficha = await response.json();
            
            // 1. Preenche os dados da ficha
            document.getElementById("nomeTreino").value = ficha.nome;
            document.getElementById("alunoSelect").value = ficha.aluno.id;
            fichaIdSalva = ficha.id; // Define o ID global

            // 2. Trava os campos
            document.getElementById("alunoSelect").disabled = true;
            document.getElementById("nomeTreino").disabled = true;
            const btnSalvar = document.querySelector(".btn-save");
            btnSalvar.textContent = "FICHA SALVA";
            btnSalvar.disabled = true;
            
            // 3. Renderiza os exercícios na tela
            renderizarExercicios(ficha);
            
        } else {
            alert("Erro ao carregar a ficha de treino. Voltando para a lista.");
            window.location.href = "Treinos.html"; // (Tela que lista as fichas)
        }
    } catch (error) {
        console.error("Erro ao carregar ficha:", error);
    }
}

/**
 * NOVA FUNÇÃO: Pega o JSON da ficha e injeta o HTML.
 */
function renderizarExercicios(ficha) {
    if (!ficha.diasDeTreino) return; // Sai se não houver dias

    // 1. Limpa todas as listas (caso já tenha algo)
    document.querySelectorAll('.exercise-list').forEach(list => list.innerHTML = '');

    // 2. Itera sobre os DIAS (Treino) da ficha
    for (const dia of ficha.diasDeTreino) {
        const diaSemana = dia.diaSemana; // "SEGUNDA", "TERCA", etc.
        const container = document.getElementById(`lista-${diaSemana}`);
        
        if (container && dia.itensTreino) {
            // 3. Itera sobre os EXERCÍCIOS (ItemTreino) de cada dia
            for (const item of dia.itensTreino) {
                // Pega o nome do exercício (Graças ao JOIN FETCH da API)
                const nomeExercicio = item.exercicio ? item.exercicio.nome : "Exercício não encontrado";
                
                const htmlItem = `
                    <div style="font-size: 14px; padding: 4px 8px; background: #FFF; border-radius: 4px; margin-bottom: 5px;">
                        <strong>${nomeExercicio}</strong> (${item.series}x ${item.repeticoes})
                    </div>
                `;
                container.innerHTML += htmlItem;
            }
        }
    }
}


// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
    const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
    document.getElementById("userName").textContent = nomeUsuario;

    // Popula o dropdown de alunos
    carregarAlunos();

    // Adiciona os cliques nos 5 dias da semana
    document.getElementById("btEditarSegunda").addEventListener("click", () => criarTreinoParaDia("SEGUNDA"));
    document.getElementById("btEditarTerca").addEventListener("click", () => criarTreinoParaDia("TERCA"));
    document.getElementById("btEditarQuarta").addEventListener("click", () => criarTreinoParaDia("QUARTA"));
    document.getElementById("btEditarQuinta").addEventListener("click", () => criarTreinoParaDia("QUINTA"));
    document.getElementById("btEditarSexta").addEventListener("click", () => criarTreinoParaDia("SEXTA"));

    // Lógica de navegação
    document.querySelectorAll('.nav-menu li').forEach(item => {
        item.addEventListener('click', function(event) {
            const pagina = event.currentTarget.dataset.page; 
            if (pagina) {
                window.location.href = pagina;
            }
        });
    });

    // Botão de sair
    document.querySelector(".bi-box-arrow-right").addEventListener("click", function () {
        if (confirm("Deseja sair do sistema?")) {
            localStorage.clear(); // Limpa tudo
            window.location.href = "Index.html";
        }
    });
    
    // Conecta o formulário à função salvarFicha
    document.getElementById("criarTreinoForm").addEventListener("submit", salvarFicha);

    // --- MUDANÇA PRINCIPAL ---
    // Verifica se a URL tem um ID (ex: CadastroTreino.html?id=50)
    const urlParams = new URLSearchParams(window.location.search);
    const fichaIdFromUrl = urlParams.get('id'); // 'id' ou 'fichaId', como preferir

    if (fichaIdFromUrl) {
        // Se tem ID, estamos em MODO DE EDIÇÃO/VISUALIZAÇÃO
        // Carrega todos os dados da ficha
        carregarFichaExistente(fichaIdFromUrl);
    }
    // Se não tem ID, a página carrega normalmente (MODO DE CRIAÇÃO)
    // O usuário preencherá os campos e clicará em "SALVAR".
});