// Espera o HTML carregar primeiro
addEventListener("DOMContentLoaded", function () {
  // Seleciona o formulário
  const loginForm = document.getElementById("loginForm");

  // Adiciona o "ouvinte" de envio
  loginForm.addEventListener("submit", async function (event) {
    // Impede o recarregamento da página
    event.preventDefault();

    // Pega os valores dos campos
    // Nota: O HTML usa id="email", mas nossa API espera "login".
    const username = document.getElementById("email").value;
    const password = document.getElementById("senha").value;

    // 1. Validação de campos vazios
    if (username === "" || password === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // 2. CRIA O OBJETO JSON PARA ENVIAR À API
    const dadosLogin = {
      login: username, // A API espera "login", não "email"
      senha: password
    };

    try {
      // 3. FAZ A REQUISIÇÃO (FETCH) PARA A API
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          // Avisa a API que estamos enviando JSON (MUITO IMPORTANTE)
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLogin) // Converte o objeto JS para uma string JSON
      });

      // 4. PROCESSA A RESPOSTA DA API
      if (response.ok) {
        // Sucesso! (Status 200)
        const data = await response.json();

        // Salva o token no "Storage" do navegador para usar em outras telas
        localStorage.setItem('jwtToken', data.token);
        
        // Salva o nome do usuário para usar na interface
        localStorage.setItem('usuarioLogado', username);

        // Redireciona para a home
        window.location.href = "home.html";
        
      } else if (response.status === 400 || response.status === 403) {
        // Erro de credenciais (Status 400 ou 403)
        alert("Usuário ou senha inválidos.");
      } else {
        // Outros erros
        alert("Erro ao tentar fazer login. Código: " + response.status);
      }

    } catch (error) {
      // Erro de rede (API offline, CORS, etc.)
      console.error('Erro de rede:', error);
      alert("Não foi possível conectar ao servidor. Verifique se a API está rodando e o CORS está habilitado.");
    }
  });

  // Botão de cadastro de instrutor (já estava no seu código)
  document
    .getElementById("btCadastrarInstrutor")
    .addEventListener("click", function () {
      window.location.href = "CadastroInstrutor.html";
    });
});