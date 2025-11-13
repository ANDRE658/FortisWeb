// Função para decodificar o token JWT (helper)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("email").value;
    const password = document.getElementById("senha").value;

    if (username === "" || password === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const dadosLogin = { login: username, senha: password };

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosLogin),
      });

      if (response.ok) {
        const data = await response.json();

        // 1. Salva o Token e o Nome
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("usuarioLogado", username);

        // 2. Decodifica o token para pegar ID e ROLE
        const tokenDecodificado = parseJwt(data.token);

        if (tokenDecodificado) {
          // Salva o ID do Instrutor (se houver)
          if (tokenDecodificado.instrutorId) {
            localStorage.setItem("instrutorId", tokenDecodificado.instrutorId);
          }

          // --- NOVO: Salva o Papel (Role) do Usuário ---
          // O Spring Security retorna roles como: [{ authority: "ROLE_NOME" }]
          if (tokenDecodificado.roles && tokenDecodificado.roles.length > 0) {
            const role = tokenDecodificado.roles[0].authority;
            localStorage.setItem("userRole", role);
            console.log("Role salva:", role);
          }
        }

        window.location.href = "home.html";
      } else {
        alert("Usuário ou senha inválidos.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert(
        "Não foi possível conectar ao servidor. Verifique se a API está rodando."
      );
    }
  });

  // Botão de cadastro de instrutor
  document
    .getElementById("btCadastrarInstrutor")
    .addEventListener("click", function () {
      window.location.href = "CadastroInstrutor.html";
    });
});
