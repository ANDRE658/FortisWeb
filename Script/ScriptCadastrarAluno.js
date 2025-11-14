// Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", function () {
  
  const urlParams = new URLSearchParams(window.location.search);
  const alunoId = urlParams.get("id"); 
  const modoEdicao = alunoId !== null;

  // --- Funções de Navegação ---
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  const elUser = document.getElementById("userName");
  if (elUser) elUser.textContent = nomeUsuario;

  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });

  const iconHome = document.getElementById("iconHome");
  if (iconHome) {
      iconHome.addEventListener("click", function () {
        window.location.href = "Home.html";
      });
  }

  const btnSair = document.querySelector(".bi-box-arrow-right");
  if (btnSair) {
      btnSair.addEventListener("click", function () {
        if (confirm("Deseja sair do sistema?")) {
          localStorage.removeItem("usuarioLogado");
          localStorage.removeItem("jwtToken"); 
          localStorage.removeItem("instrutorId");
          window.location.href = "Index.html";
        }
      });
  }

  // --- FUNÇÃO PARA CARREGAR DADOS (MODO EDIÇÃO) ---
  async function carregarDadosDoAluno() {
    if (!modoEdicao) return; 

    document.querySelector(".page-title").textContent = "Editar Aluno";
    const btnSave = document.querySelector(".btn-save");
    if (btnSave) btnSave.textContent = "ATUALIZAR";
    
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) cpfInput.disabled = true; 
    
    const senhaInput = document.getElementById("senhaProvisoria");
    if (senhaInput) {
        const senhaGroup = senhaInput.closest(".form-group");
        if (senhaGroup) {
          senhaGroup.style.display = "none"; 
          senhaInput.removeAttribute("required"); 
        }
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
        
        document.getElementById("nome").value = aluno.nome || "";
        document.getElementById("email").value = aluno.email || "";
        document.getElementById("cpf").value = aluno.cpf || "";
        document.getElementById("telefone").value = aluno.telefone || "";
        document.getElementById("sexo").value = aluno.sexo || "";
        
        if (aluno.dataNascimento) {
            document.getElementById("nascimento").value = new Date(aluno.dataNascimento).toISOString().split('T')[0];
        }
        document.getElementById("altura").value = aluno.altura || "";
        document.getElementById("peso").value = aluno.peso || "";

        if (aluno.endereco) {
          document.getElementById("rua").value = aluno.endereco.rua || "";
          document.getElementById("cidade").value = aluno.endereco.cidade || "";
          document.getElementById("estado").value = aluno.endereco.estado || "";
          document.getElementById("cep").value = aluno.endereco.cep || "";
          const bairroInput = document.getElementById("bairro");
          if (bairroInput) bairroInput.value = aluno.endereco.bairro || "";
        }
        
        // --- CORREÇÃO: SELECIONAR PLANO E INSTRUTOR ---
        if (aluno.matriculaList && aluno.matriculaList.length > 0) {
            
            // Pega a primeira matrícula válida (supomos que só tenha uma)
            const matricula = aluno.matriculaList[0];

            // Seleciona o Plano
            if (matricula.plano) {
                document.getElementById("plano").value = matricula.plano.id;
            }
            
            // Seleciona o Instrutor
            if (matricula.instrutor) {
                document.getElementById("instrutorSelect").value = matricula.instrutor.id;
            }
        }

      } else {
        alert("Erro ao buscar dados do aluno.");
        window.location.href = "Alunos.html";
      }
    } catch (error) {
      console.error("Erro de rede ao carregar aluno:", error);
    }
  }

  // --- FUNÇÃO PARA CARREGAR PLANOS ---
  async function carregarPlanos() {
    const token = localStorage.getItem("jwtToken");
    const selectPlano = document.getElementById("plano");

    if (!token) {
      selectPlano.innerHTML = '<option value="">Falha (sem token)</option>';
      return Promise.reject(new Error("Sem token"));
    }

    try {
      const response = await fetch("http://localhost:8080/plano/listar", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
          selectPlano.innerHTML = '<option value="">Nenhum plano ativo</option>';
          return Promise.resolve();
      }

      if (response.ok) {
        const planos = await response.json();
        
        selectPlano.innerHTML = '<option value="">Selecione um plano</option>'; 
        
        planos.forEach(plano => {
          const valorFormatado = parseFloat(plano.valor).toFixed(2).replace('.', ',');
          const option = document.createElement('option');
          option.value = plano.id;
          option.textContent = `${plano.nome} (R$ ${valorFormatado})`;
          selectPlano.appendChild(option);
        });
        return Promise.resolve();
      } else {
         throw new Error('Falha ao buscar planos: ' + response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      selectPlano.innerHTML = '<option value="">Erro ao carregar planos</option>';
      return Promise.reject(error);
    }
  }

  // --- NOVA FUNÇÃO PARA CARREGAR INSTRUTORES ---
  async function carregarInstrutores() {
    const token = localStorage.getItem("jwtToken");
    const selectInstrutor = document.getElementById("instrutorSelect");

    if (!token) {
      selectInstrutor.innerHTML = '<option value="">Falha (sem token)</option>';
      return Promise.reject(new Error("Sem token"));
    }

    try {
      const response = await fetch("http://localhost:8080/instrutor/listar", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
          selectInstrutor.innerHTML = '<option value="">Nenhum instrutor</option>';
          return Promise.resolve();
      }

      if (response.ok) {
        const instrutores = await response.json();
        
        selectInstrutor.innerHTML = '<option value="">Selecione um instrutor</option>'; 
        
        instrutores.forEach(instrutor => {
          const option = document.createElement('option');
          option.value = instrutor.id;
          option.textContent = instrutor.nome;
          selectInstrutor.appendChild(option);
        });
        return Promise.resolve();
      } else {
         throw new Error('Falha ao buscar instrutores: ' + response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar instrutores:", error);
      selectInstrutor.innerHTML = '<option value="">Erro ao carregar</option>';
      return Promise.reject(error);
    }
  }


  // --- LÓGICA DE SALVAR (CRIAR E ATUALIZAR) ---
  const form = document.getElementById("cadastroAlunoForm");
  if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault(); 
        
        try {
          const token = localStorage.getItem("jwtToken");
          if (!token) {
            alert("Você não está logado.");
            window.location.href = "Index.html";
            return;
          }
          
          // Coleta os dados do formulário
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
              bairro: document.getElementById("bairro").value
            },
            
            planoId: document.getElementById("plano").value,

            // --- CORREÇÃO: ADICIONAR INSTRUTOR AO SALVAR/ATUALIZAR ---
            instrutorId: document.getElementById("instrutorSelect").value 
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
            alert(modoEdicao ? "Aluno atualizado com sucesso!" : "Aluno cadastrado com sucesso!");
            window.location.href = "Alunos.html";
          } else {
             const errorText = await response.text();
             console.error("Erro da API:", errorText);
             alert("Não foi possível salvar: " + errorText);
          }
        } catch (error) {
          console.error("Erro fatal no script de cadastro:", error);
          alert("Um erro ocorreu no formulário. Verifique o console.");
        }
      });
  }

  // --- INICIALIZAÇÃO DA PÁGINA ---
  
  // Função auto-executável async para garantir a ordem
  (async function init() {
      try {
        await carregarPlanos(); // 1. Espera os planos carregarem
        await carregarInstrutores(); // 2. Espera os instrutores carregarem
        await carregarDadosDoAluno(); // 3. Só depois carrega o aluno (para selecionar os dropdowns)
      } catch (error) {
          console.error("Falha ao inicializar a página:", error);
      }
  })();
});