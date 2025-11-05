// Aguarda o DOM carregar
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
        localStorage.removeItem("jwtToken"); // Limpa o token também
        window.location.href = "Index.html";
      }
    });

  // --- LÓGICA DE CADASTRO (CORRIGIDA PARA SEU NOVO HTML) ---
  document
    .getElementById("cadastroAlunoForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("Você não está logado. Redirecionando para a tela de login.");
        window.location.href = "Index.html";
        return;
      }

      // 3. Pega os dados do seu novo formulário
      const alunoData = {
        // Dados do Aluno
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        CPF: document.getElementById("cpf").value,
        telefone: document.getElementById("telefone").value,
        sexo: document.getElementById("sexo").value,
        dataNascimento: document.getElementById("nascimento").value,
        altura: parseFloat(document.getElementById("altura").value),
        peso: parseFloat(document.getElementById("peso").value),

        // Dados do Endereco
        endereco: {
          rua: document.getElementById("rua").value,
          cidade: document.getElementById("cidade").value,
          estado: document.getElementById("estado").value,
          cep: document.getElementById("cep").value,
          // O campo 'bairro' do seu HTML não está no Endereco.java, então o ignoramos.
        },

        // Dado de Senha
        senha: document.getElementById("senhaProvisoria").value,
      };

      // 4. Envia a requisição (Fetch) para a API
      try {
        const response = await fetch("http://localhost:8080/aluno/salvar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(alunoData),
        });

        if (response.status === 201) {
          // 201 Created
          alert("Aluno cadastrado com sucesso!");
          window.location.href = "Alunos.html";
        } else if (response.status === 403) {
          alert(
            "Sua sessão expirou ou você não tem permissão. Faça o login novamente."
          );
          window.location.href = "Index.html";
        } else if (response.status === 400) {
          alert(
            "Erro ao cadastrar aluno: Verifique se todos os campos (especialmente a senha) foram preenchidos."
          );
        } else {
          // Captura outros erros (como o 'usuario_role_check' se ainda ocorrer)
          const errorText = await response.text(); // Pega o erro
          console.error("Erro da API:", errorText);
          alert("Erro ao cadastrar aluno. Verifique o console para detalhes.");
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert(
          "Não foi possível conectar à API. Verifique o console e se o backend está rodando."
        );
      }
    });

  // Botão "Criar treino Aluno"
  document
    .getElementById("btCriarTreino")
    .addEventListener("click", function () {
      alert("Redirecionando para criar treino...");
      window.location.href = "CadastroTreino.html";
    });
});
