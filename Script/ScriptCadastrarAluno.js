// Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", function () {
  
  const urlParams = new URLSearchParams(window.location.search);
  const alunoId = urlParams.get("id"); 
  const modoEdicao = alunoId !== null;

  // --- Funções de Navegação ---
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
        localStorage.removeItem("jwtToken"); 
        localStorage.removeItem("instrutorId");
        window.location.href = "Index.html";
      }
    });

  // --- FUNÇÃO PARA CARREGAR DADOS (MODO EDIÇÃO) ---
  async function carregarDadosDoAluno() {
    if (!modoEdicao) return; 

    document.querySelector(".page-title").textContent = "Editar Aluno";
    document.querySelector(".btn-save").textContent = "ATUALIZAR";
    
    document.getElementById("cpf").disabled = true; 
    
    const senhaInput = document.getElementById("senhaProvisoria");
    const senhaGroup = senhaInput.closest(".form-group");
    if (senhaGroup) {
      senhaGroup.style.display = "none"; 
      senhaInput.removeAttribute("required"); 
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Sessão expirada. Faça o login novamente.");
      window.location.href = "Index.html";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/aluno/buscar/${alunoId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const aluno = await response.json();
        
        document.getElementById("nome").value = aluno.nome;
        document.getElementById("email").value = aluno.email;
        document.getElementById("cpf").value = aluno.cpf;
        document.getElementById("telefone").value = aluno.telefone;
        document.getElementById("sexo").value = aluno.sexo;
        
        if (aluno.dataNascimento) {
            document.getElementById("nascimento").value = new Date(aluno.dataNascimento).toISOString().split('T')[0];
        }
        document.getElementById("altura").value = aluno.altura;
        document.getElementById("peso").value = aluno.peso;

        if (aluno.endereco) {
          document.getElementById("rua").value = aluno.endereco.rua;
          document.getElementById("cidade").value = aluno.endereco.cidade;
          document.getElementById("estado").value = aluno.endereco.estado;
          document.getElementById("cep").value = aluno.endereco.cep;
          document.getElementById("bairro").value = aluno.endereco.bairro || "";
        }
        
        // --- ATUALIZAÇÃO IMPORTANTE ---
        // A lógica de selecionar o plano do aluno (ex: plano.id)
        // precisaria ser adicionada aqui, mas o seu backend
        // (AlunoController.buscarPorId) não retorna qual é o plano atual do aluno.
        // Por enquanto, apenas populamos a lista.
        // document.getElementById("plano").value = aluno.planoId; // (Exemplo futuro)

      } else {
        alert("Erro ao buscar dados do aluno. Redirecionando para a lista.");
        window.location.href = "Alunos.html";
      }
    } catch (error) {
      console.error("Erro de rede ao carregar aluno:", error);
    }
  }

  // --- 🌟 INÍCIO DA NOVA FUNÇÃO 🌟 ---
  /**
   * Carrega a lista de planos da API e preenche o dropdown.
   */
  async function carregarPlanos() {
    const token = localStorage.getItem("jwtToken");
    const selectPlano = document.getElementById("plano");

    if (!token) {
      selectPlano.innerHTML = '<option value="">Falha (sem token)</option>';
      return;
    }

    try {
      // 1. Busca no endpoint /plano/listar (exige token de instrutor)
      const response = await fetch("http://localhost:8080/plano/listar", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const planos = await response.json();
        
        // 2. Limpa o dropdown (mantendo a primeira opção)
        selectPlano.innerHTML = '<option value="">Selecione um plano</option>'; 
        
        // 3. Preenche com os planos do banco
        planos.forEach(plano => {
          // O seu Plano.java tem 'nome' e 'valor'
          const valorFormatado = parseFloat(plano.valor).toFixed(2).replace('.', ',');
          const option = document.createElement('option');
          option.value = plano.id; // Salva o ID do plano
          option.textContent = `${plano.nome} (R$ ${valorFormatado})`; // Ex: Gold Mensal (R$ 89,90)
          selectPlano.appendChild(option);
        });
      } else {
         throw new Error('Falha ao buscar planos: ' + response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      selectPlano.innerHTML = '<option value="">Erro ao carregar planos</option>';
    }
  }
  // --- 🌟 FIM DA NOVA FUNÇÃO 🌟 ---


  // --- LÓGICA DE SALVAR (CRIAR E ATUALIZAR) ---
  document
    .getElementById("cadastroAlunoForm")
    .addEventListener("submit", async function (e) {
      // (Esta função inteira permanece exatamente como estava)
      e.preventDefault(); 
      
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          alert("Você não está logado.");
          window.location.href = "Index.html";
          return;
        }
        //Coleta de dados do formulário
        const alunoData = {
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          cpf: document.getElementById("cpf").value, 
          telefone: document.getElementById("telefone").value,
          sexo: document.getElementById("sexo").value,
          dataNascimento: document.getElementById("nascimento").value, 
          altura: parseFloat(document.getElementById("altura").value),
          peso: parseFloat(document.getElementById("peso").value),
          endereco: {
            rua: document.getElementById("rua").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
            cep: document.getElementById("cep").value,
          },
          planoId: document.getElementById("plano").value
        };

        if (!modoEdicao) {
          alunoData.senha = document.getElementById("senhaProvisoria").value;
        }

        const metodo = modoEdicao ? "PUT" : "POST";
        const url = modoEdicao
          ? `http://localhost:8080/aluno/atualizar/${alunoId}`
          : "http://localhost:8080/aluno/salvar";

        const response = await fetch(url, {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(alunoData),
        });

        if (response.status === 201 || response.status === 200) {
          alert(
            modoEdicao
              ? "Aluno atualizado com sucesso!"
              : "Aluno cadastrado com sucesso!"
          );
          window.location.href = "Alunos.html";
        } else {
           const errorText = await response.text();
           console.error("Erro da API:", errorText);
           alert("Erro ao salvar. Verifique o console. Código: " + response.status);
        }
      } catch (error) {
        console.error("Erro fatal no script de cadastro:", error);
        alert("Um erro ocorreu no formulário. Verifique o console (F12) para detalhes.");
      }
    });

  // --- INICIALIZAÇÃO DA PÁGINA ---
  
  // 🌟 ATUALIZADO 🌟
  // Carrega as duas listas ao iniciar a página.
  carregarPlanos();
  carregarDadosDoAluno(); 
});