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
  document.getElementById("nomeTreino").disabled = true;

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

      rows.forEach((row) => {
        const nomeExercicio = row.querySelector('input[type="text"]').value;
        const series = row.querySelector(".input-serie").value;
        const rep = row.querySelector(".input-rep").value;

        // Só salva se o nome foi preenchido
        if (nomeExercicio && series && rep) {
          
          // O backend DTO
          // espera (exercicioId, series, repeticoes, carga, tempoDescansoSegundos)
          
          // **** IMPORTANTE ****
          // Seu backend espera um 'exercicioId' (Long), mas seu frontend
          // está pegando o 'nome' (String).
          // Para isso funcionar, seu backend (ExercicioService) precisaria
          // buscar o ID pelo nome, ou o frontend precisaria de um dropdown de exercícios.
          
          // *Simplificação por agora:* Vamos assumir que o backend foi
          // ajustado para aceitar o NOME do exercício, ou que o DTO foi
          // mudado para aceitar 'exercicioNome' (String).
          
          // *Solução mais realista (mas complexa):* Teríamos que
          // primeiro fazer um GET /exercicio/listar, popular um
          // <select> na tabela e pegar o ID dele.
          
          // *VAMOS ASSUMIR A LÓGICA DO SEU BACKEND:*
          // O backend (ItemTreinoRequestDTO) espera 'exercicioId' (Long).
          // O frontend (AdicionarExercicio.html) só tem o NOME (String).
          // **Isso não vai funcionar.**
          
          // *** ALTERNATIVA TEMPORÁRIA ***
          // Vamos assumir que o usuário digitou o ID do exercício no campo nome.
          const exercicioIdNum = parseInt(nomeExercicio);
          
          if (isNaN(exercicioIdNum)) {
             alert(`Erro: "${nomeExercicio}" não é um ID de exercício válido. Por favor, digite o ID numérico do exercício.`);
             throw new Error("ID de exercício inválido.");
          }

          const itemData = {
            exercicioId: exercicioIdNum,
            series: parseInt(series),
            repeticoes: rep.toString(), // Repetições é String (ex: "10-12")
            carga: 0, // Campo não existe no form, enviamos 0
            tempoDescansoSegundos: 60 // Campo não existe, enviamos 60
          };

          // Adiciona a promessa de 'fetch' ao array
          promessas.push(fetch(`http://localhost:8080/treino/${treinoId}/exercicios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
          }));
        }
      });
      
      // 6. Executa todas as promessas de salvamento
      try {
        await Promise.all(promessas);
        alert("Exercícios salvos no treino com sucesso!");
        window.location.href = "CadastroTreino.html"; // Volta para a tela "mãe"
      } catch (error) {
         console.error("Erro ao salvar exercícios:", error);
         alert("Falha ao salvar um ou mais exercícios. Verifique o console.");
      }
    });
});