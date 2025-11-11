// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Verifica se está em modo de edição (ex: ?id=123)
  const urlParams = new URLSearchParams(window.location.search);
  const instrutorId = urlParams.get("id"); 
  const modoEdicao = instrutorId !== null;

  // --- Funções de Navegação ---
  
  // Tenta encontrar o ícone de Home
  const iconHome = document.querySelector(".navbar .bi-house-door");
  if (iconHome) {
      iconHome.addEventListener("click", function () {
        // Se estiver logado, volta pra lista. Se não, volta pro login.
        if (localStorage.getItem("jwtToken")) {
            window.location.href = "Instrutor.html";
        } else {
            window.location.href = "Index.html";
        }
      });
  }

  // --- FUNÇÃO PARA CARREGAR DADOS (MODO EDIÇÃO) ---
  async function carregarDadosDoInstrutor() {
    // Se não for edição, não faz nada
    if (!modoEdicao) return; 
    
    // Ajusta a interface para "Edição"
    document.querySelector(".page-title").textContent = "Editar Instrutor";
    document.querySelector(".btn-save").textContent = "ATUALIZAR";
    
    // Desabilita CPF (não deve ser editado)
    document.getElementById("cpf").disabled = true; 
    
    // Oculta o campo de senha
    const senhaInput = document.getElementById("senha"); // <-- ID CORRIGIDO
    const senhaGroup = senhaInput.closest(".form-group");
    if (senhaGroup) {
      senhaGroup.style.display = "none"; 
      senhaInput.removeAttribute("required"); // Remove o "required" da senha
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Sessão expirada. Faça o login para editar.");
      window.location.href = "Index.html";
      return;
    }

    // Busca os dados do instrutor na API
    try {
      const response = await fetch(
        `http://localhost:8080/instrutor/buscar/${instrutorId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const instrutor = await response.json();
        
        // Preenche o formulário
        document.getElementById("nome").value = instrutor.nome;
        document.getElementById("email").value = instrutor.email;
        document.getElementById("cpf").value = instrutor.cpf;
        document.getElementById("telefone").value = instrutor.telefone;
        document.getElementById("sexo").value = instrutor.sexo;
        
        if (instrutor.dataNascimento) {
            document.getElementById("nascimento").value = new Date(instrutor.dataNascimento).toISOString().split('T')[0];
        }

        if (instrutor.endereco) {
          document.getElementById("rua").value = instrutor.endereco.rua;
          document.getElementById("cidade").value = instrutor.endereco.cidade;
          document.getElementById("estado").value = instrutor.endereco.estado;
          document.getElementById("cep").value = instrutor.endereco.cep;
          document.getElementById("bairro").value = instrutor.endereco.bairro || "";
        }
        
      } else {
        alert("Erro ao buscar dados do instrutor. Redirecionando para a lista.");
        window.location.href = "Instrutor.html";
      }
    } catch (error) {
      console.error("Erro de rede ao carregar instrutor:", error);
    }
  }


  // --- LÓGICA DE SALVAR (CRIAR E ATUALIZAR) ---
  document
    .getElementById("cadastroInstrutorForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); 
      
      const token = localStorage.getItem("jwtToken");
      
      // 1. Coleta de dados do formulário
      const instrutorData = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        cpf: document.getElementById("cpf").value, 
        telefone: document.getElementById("telefone").value,
        sexo: document.getElementById("sexo").value,
        dataNascimento: document.getElementById("nascimento").value, 
        endereco: {
          rua: document.getElementById("rua").value,
          cidade: document.getElementById("cidade").value,
          estado: document.getElementById("estado").value,
          cep: document.getElementById("cep").value,
          // Bairro: Seu model Endereco.java não tem 'bairro'.
          // Se você adicionar 'bairro' no Endereco.java, descomente a linha abaixo:
          // bairro: document.getElementById("bairro").value 
        }
      };

      // Só envia a senha se for modo de CRIAÇÃO (!modoEdicao)
      if (!modoEdicao) {
        // **** AQUI ESTÁ A CORREÇÃO ****
        instrutorData.senha = document.getElementById("senha").value; // <-- ID CORRIGIDO
      }

      // 2. Define o método e a URL corretos
      const metodo = modoEdicao ? "PUT" : "POST";
      const url = modoEdicao
        ? `http://localhost:8080/instrutor/atualizar/${instrutorId}` // Atualiza
        : "http://localhost:8080/instrutor/salvar"; // Cria um novo

      // 3. Define os Headers
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Adiciona o token de autorização se ele existir (necessário para PUT)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 4. Envia a requisição (Fetch) para a API
      try {
        const response = await fetch(url, {
          method: metodo,
          headers: headers,
          body: JSON.stringify(instrutorData),
        });

        // 5. Verifica a resposta
        if (response.status === 201 || response.status === 200) {
          alert(
            modoEdicao
              ? "Instrutor atualizado com sucesso!"
              : "Instrutor cadastrado com sucesso!"
          );
          // Redireciona para a lista de instrutores (se logado) ou login (se cadastro público)
          window.location.href = token ? "Instrutor.html" : "Index.html";
        
        } else {
           const errorText = await response.text();
           console.error("Erro da API:", errorText);
           alert("Erro ao salvar. Verifique o console. Código: " + response.status);
        }
      } catch (error) {
        console.error("Erro fatal no script de cadastro:", error);
        alert("Um erro ocorreu no formulário. Verifique o console (F12).");
      }
    });

    // ... (Toda a lógica de navegação: .nav-menu, .bi-box-arrow-right, #iconHome) ...
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function(event) {
        const pagina = event.currentTarget.dataset.page; 
        if (pagina) {
            window.location.href = pagina;
        }
    });
  });

  // --- INICIALIZAÇÃO DA PÁGINA ---
  carregarDadosDoInstrutor(); // Tenta carregar os dados se for modo de edição
});