// --- INÍCIO DA CORREÇÃO: Função para carregar exercícios da API ---
async function carregarExerciciosAPI() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Sessão expirada. Faça o login.");
        window.location.href = "Index.html";
        return;
    }

    try {
        // 1. Busca os exercícios cadastrados
        const response = await fetch('http://localhost:8080/exercicio/listar', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error("Não foi possível listar os exercícios da API.");
            return;
        }

        const exercicios = await response.json();
        
        // 2. Encontra todos os <select> na tabela
        const selects = document.querySelectorAll(".table-row select");
        
        // 3. Popula cada <select> com os exercícios
        selects.forEach(select => {
            select.innerHTML = '<option value="">Selecione um exercício</option>'; // Limpa o "Carregando..."
            exercicios.forEach(ex => {
                // O 'value' será o ID, e o texto será o Nome
                select.innerHTML += `<option value="${ex.id}">${ex.nome}</option>`; 
            });
        });

    } catch (error) {
        console.error("Erro ao carregar exercícios da API:", error);
    }
}
// --- FIM DA CORREÇÃO ---


// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Pega os dados da URL
  const urlParams = new URLSearchParams(window.location.search);
  const treinoId = urlParams.get('treinoId');
  const alunoNome = urlParams.get('aluno') || 'Aluno';
  const diaSemana = urlParams.get('dia') || 'Dia';

  if (!treinoId) {
    alert("ID do treino não encontrado. Voltando para a tela anterior.");
    window.location.href = "CadastroTreino.html";
    return;
  }

  // 2. Ajusta a tela com os dados
  document.getElementById("aluno").value = alunoNome;
  document.querySelector(".btn-day").textContent = diaSemana.toUpperCase();
  // Desabilita os campos que não precisam ser editados
  document.getElementById("aluno").disabled = true;
  // O ID "nomeTreino" no seu AdicionarExercicio.html é um <select>, vamos apenas desabilitá-lo
  if (document.getElementById("nomeTreino")) {
      document.getElementById("nomeTreino").disabled = true;
  }

  // --- INÍCIO DA CORREÇÃO: Chama a função para popular os dropdowns ---
  carregarExerciciosAPI();
  // --- FIM DA CORREÇÃO ---

  // 3. Funções de Navegação
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;
  
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function(event) {
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

  // 4. LÓGICA DE SALVAR OS EXERCÍCIOS
  document
    .getElementById("adicionarExercicioForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert("Sessão expirada. Faça o login.");
        window.location.href = "Index.html";
        return;
      }

      // 5. Pega todos os exercícios da tabela
      const rows = document.querySelectorAll(".table-row");
      const promessas = []; // Array para salvar todas as requisições

      for (const row of rows) {
        // --- INÍCIO DA CORREÇÃO: Ler dados do <select> e inputs ---
        const selectExercicio = row.querySelector('select');
        const exercicioId = selectExercicio ? selectExercicio.value : null;
        const seriesInput = row.querySelector(".input-serie");
        const series = seriesInput ? seriesInput.value : null;
        const repInput = row.querySelector(".input-rep");
        const rep = repInput ? repInput.value : null;
        // --- FIM DA CORREÇÃO ---

        // Só salva se o ID, series e rep foram preenchidos
        if (exercicioId && series && rep) {
          
          // O backend DTO (ExercicioDTO) espera (id, nome, series, repeticoes)
          // Mas o Service (ExercicioService) espera o DTO e o treinoId
          // E o DTO que o *ItemTreinoRequestDTO* (que você parece estar usando) espera:
          // (exercicioId, series, repeticoes, carga, tempoDescansoSegundos)
          
          // Vamos usar o DTO que o seu JS estava tentando montar:
          const itemData = {
            id: null, // O ID é do ItemTreino, não do exercício
            exercicioId: parseInt(exercicioId), // ID do exercício (Ex: 1 = Supino)
            series: parseInt(series),
            repeticoes: rep.toString(), // Repetições é String (ex: "10-12")
            carga: 0, // Campo não existe no form, enviamos 0
            tempoDescansoSegundos: 60 // Campo não existe, enviamos 60
          };
          
          // --- INÍCIO DA CORREÇÃO: Corrigir o endpoint da API ---
          // O endpoint correto é /exercicio/salvar/{treinoId}
          const url = `http://localhost:8080/exercicio/salvar/${treinoId}`;
          // --- FIM DA CORREÇÃO ---

          // Adiciona a promessa de 'fetch' ao array
          promessas.push(fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
          }));
        }
      }
      
      // 6. Executa todas as promessas de salvamento
      try {
        const responses = await Promise.all(promessas);

        // Verifica se alguma das requisições falhou
        const falhou = responses.some(res => !res.ok);

        if (falhou) {
            alert("Alguns exercícios não puderam ser salvos. Verifique o console.");
        } else {
            alert("Exercícios salvos no treino com sucesso!");
            window.location.href = "CadastroTreino.html"; // Volta para a tela "mãe"
        }

      } catch (error) {
         console.error("Erro ao salvar exercícios:", error);
         alert("Falha ao salvar um ou mais exercícios. Verifique o console.");
      }
    });
});