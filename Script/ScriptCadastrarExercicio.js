// Carrega o nome do usuário salvo no localStorage
document.addEventListener("DOMContentLoaded", function () {
  // --- Funções de Navegação (do seu código original) ---
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });

  document.getElementById("iconHome").addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("jwtToken"); // Limpa o token
        window.location.href = "Index.html";
      }
    });

  // --- LÓGICA DE CADASTRO (A PARTE QUE FALTAVA) ---
  document
    .getElementById("cadastroExercicioForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Impede o envio padrão

      // 1. Pega o token do localStorage
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("Sessão expirada. Faça o login novamente.");
        window.location.href = "Index.html";
        return;
      }

      // 2. Pega os dados do formulário
      const nomeExercicio = document.getElementById("nomeExercicio").value;

      // 3. Monta o objeto JSON (Body)
      const exercicioData = {
        nome: nomeExercicio,
      };

      // 4. Envia a requisição (Fetch) para a API
      try {
        const response = await fetch("http://localhost:8080/exercicio/salvar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Envia o token
          },
          body: JSON.stringify(exercicioData),
        });

        if (response.status === 201) {
          // 201 Created
          alert("Exercício cadastrado com sucesso!");
          window.location.href = "Exercicios.html"; // Redireciona para a lista
        } else if (response.status === 403) {
          alert(
            "Sua sessão expirou ou você não tem permissão. Faça o login novamente."
          );
          window.location.href = "Index.html";
        } else {
          alert("Erro ao cadastrar exercício. Código: " + response.status);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Não foi possível conectar à API. Verifique o console.");
      }
    });
});
