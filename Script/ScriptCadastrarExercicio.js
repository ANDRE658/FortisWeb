// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Carrega o nome do usuário (lógica de navegação)
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

  document.getElementById("iconHome").addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  // 2. LÓGICA DE SALVAR O NOVO EXERCÍCIO
  document
    .getElementById("cadastroExercicioForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Impede o envio padrão do formulário
      
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert("Sessão expirada. Faça o login.");
        window.location.href = "Index.html";
        return;
      }

      // Pega o nome do exercício do input
      const nomeExercicio = document.getElementById("nomeExercicio").value;

      if (!nomeExercicio) {
          alert("Por favor, preencha o nome do exercício.");
          return;
      }

      // Monta o DTO (JSON) que o backend espera
      // (O ExercicioDTO só precisa de 'nome')
      const exercicioData = {
          nome: nomeExercicio
      };

      // Envia para o novo endpoint que criamos
      try {
        const response = await fetch('http://localhost:8080/exercicio/salvar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(exercicioData)
        });

        if (response.status === 201) { // 201 Created
          alert("Exercício cadastrado com sucesso!");
          window.location.href = "Exercicios.html"; // Redireciona para a lista
        
        } else if (response.status === 403) {
          alert("Sua sessão expirou. Faça o login novamente.");
          window.location.href = "Index.html";
        
        } else {
          alert("Erro ao cadastrar exercício. Código: " + response.status);
        }

      } catch (error) {
         console.error("Erro ao salvar exercício:", error);
         alert("Não foi possível conectar à API.");
      }
    });
});