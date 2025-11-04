// Espera o HTML carregar primeiro (Correto!)
addEventListener("DOMContentLoaded", function () {
  // Seleciona o formulário
  const loginForm = document.getElementById("loginForm");

  // Adiciona o "ouvinte" de envio
  loginForm.addEventListener("submit", function (event) {
    // Impede o recarregamento da página (Correto!)
    event.preventDefault();

    // Pega os valores dos campos
    const username = document.getElementById("email").value;
    const password = document.getElementById("senha").value;

    // 1. Validação de campos vazios (Correto!)
    if (username === "" || password === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // 2. CORREÇÃO LÓGICA:
    // Trocado '||' (OU) por '&&' (E)
    // Agora, o usuário SÓ entra se o email for "admin@gmail.com" E a senha for "12345"
    if (password === "12345" && username === "admin@gmail.com") {
      // Redireciona para a home (Correto!)
      window.location.href = "home.html";
      console.log("Login bem-sucedido!");
      return;
    }

    // 3. Se chegou aqui, o login está errado
    alert("Usuário ou senha inválidos.");
  });

  // Botão de cadastro de instrutor
  document
    .getElementById("btCadastrarInstrutor")
    .addEventListener("click", function () {
      window.location.href = "CadastroInstrutor.html";
    });
});
