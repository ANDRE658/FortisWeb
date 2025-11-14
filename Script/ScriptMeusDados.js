// === VARIÁVEIS GLOBAIS ===
let modoEdicao = false;
let dadosCarregados = {}; // Armazena os dados originais
const userRole = localStorage.getItem("userRole");
const token = localStorage.getItem("jwtToken");

// Mapeia as roles para os endpoints corretos
const ENDPOINTS = {
  ROLE_ALUNO: {
    get: "http://localhost:8080/aluno/me",
    update: "http://localhost:8080/aluno/me"
  },
  ROLE_INSTRUTOR: {
    get: "http://localhost:8080/instrutor/me",
    update: "http://localhost:8080/instrutor/me"
  }
  // (ROLE_GERENCIADOR por enquanto não tem tela de "meus dados", mas poderia ser adicionado)
};

// === FUNÇÕES DE MÁSCARA (Copiladas da sua implementação anterior) ===
function formatarCPF(cpf) {
  if (!cpf) return "";
  cpf = cpf.replace(/\D/g, "");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return cpf;
}

function formatarTelefone(tel) {
  if (!tel) return "";
  tel = tel.replace(/\D/g, "");
  tel = tel.replace(/^(\d{2})(\d)/g, "($1) $2");
  tel = tel.replace(/(\d{5})(\d)/, "$1-$2");
  return tel;
}

function formatarCEP(cep) {
  if (!cep) return "";
  cep = cep.replace(/\D/g, "");
  cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
  return cep;
}

// === FUNÇÃO VIACEP (Copilada) ===
async function buscarCEP() {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    if (cep.length !== 8 || !modoEdicao) return; // Só busca se estiver em modo de edição

    const ruaInput = document.getElementById("rua");
    const bairroInput = document.getElementById("bairro");
    const cidadeInput = document.getElementById("cidade");
    const estadoInput = document.getElementById("estado");

    ruaInput.value = "Buscando...";
    bairroInput.value = "Buscando...";
    
    try {
        const response = await fetch(`http://localhost:8080/consulta-cep/${cep}`);
        if (response.ok) {
            const data = await response.json();
            ruaInput.value = data.logradouro;
            bairroInput.value = data.bairro;
            cidadeInput.value = data.localidade;
            estadoInput.value = data.uf;
            document.getElementById("numero").focus();
        } else {
            throw new Error("CEP não encontrado");
        }
    } catch (error) {
        alert("CEP não encontrado. Digite manualmente.");
        ruaInput.value = "";
        bairroInput.value = "";
    }
}


/**
 * Alterna a interface entre o modo de visualização e o modo de edição.
 */
function toggleEdit() {
  const form = document.getElementById("meusDadosForm");
  const btnToggle = document.getElementById("btnToggleEdit");
  const botoesSalvar = document.getElementById("botoesDadosPessoais");
  const botaoVoltarGeral = document.getElementById("botaoVoltarGeral");

  modoEdicao = !modoEdicao; // Inverte o estado

  if (modoEdicao) {
    // --- ENTRANDO EM MODO DE EDIÇÃO ---
    form.classList.remove("view-mode");
    form.classList.add("edit-mode");
    btnToggle.innerHTML = '<i class="bi bi-x"></i> Cancelar';
    botoesSalvar.style.display = "flex";
    botaoVoltarGeral.style.display = "none";

    // Habilita todos os campos exceto CPF e Email
    document.querySelectorAll("#meusDadosForm .form-control").forEach((input) => {
      if (input.id !== "cpf" && input.id !== "email") {
        input.removeAttribute("readonly");
        if(input.tagName === "SELECT") input.disabled = false;
      }
    });
    
  } else {
    // --- SAINDO DO MODO DE EDIÇÃO (Cancelando) ---
    form.classList.add("view-mode");
    form.classList.remove("edit-mode");
    btnToggle.innerHTML = '<i class="bi bi-pencil"></i> Editar';
    botoesSalvar.style.display = "none";
    botaoVoltarGeral.style.display = "block";

    // Desabilita todos os campos
    document.querySelectorAll("#meusDadosForm .form-control").forEach((input) => {
      input.setAttribute("readonly", true);
      if(input.tagName === "SELECT") input.disabled = true;
    });
    
    // Restaura os dados originais (caso o usuário tenha digitado algo)
    preencherFormulario(dadosCarregados);
  }
}

/**
 * Preenche o formulário com os dados do usuário.
 */
function preencherFormulario(data) {
  document.getElementById("nome").value = data.nome || "";
  // O endpoint de instrutor retorna 'cpf' com 'C' maiúsculo
  document.getElementById("cpf").value = formatarCPF(data.cpf || data.CPF || ""); 
  document.getElementById("email").value = data.email || "";
  document.getElementById("telefone").value = formatarTelefone(data.telefone || "");
  document.getElementById("sexo").value = data.sexo || "";
  
  if (data.dataNascimento) {
    document.getElementById("nascimento").value = new Date(data.dataNascimento).toISOString().split('T')[0];
  }

  if (data.endereco) {
    document.getElementById("cep").value = formatarCEP(data.endereco.cep || "");
    document.getElementById("cidade").value = data.endereco.cidade || "";
    document.getElementById("estado").value = data.endereco.estado || "";
    document.getElementById("rua").value = data.endereco.rua || "";
    document.getElementById("bairro").value = data.endereco.bairro || "";
    document.getElementById("numero").value = data.endereco.numero || "";
  }
}

/**
 * Carrega os dados do usuário logado da API.
 */
async function carregarMeusDados() {
  const endpointInfo = ENDPOINTS[userRole];
  if (!endpointInfo) {
     document.querySelector(".content").innerHTML = "<h1>Erro</h1><p>Não foi possível carregar seus dados. Role de usuário desconhecida.</p>";
     return;
  }
  
  if (!token) {
      alert("Sessão inválida. Faça o login novamente.");
      window.location.href = "Index.html";
      return;
  }

  try {
    const response = await fetch(endpointInfo.get, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      dadosCarregados = await response.json();
      preencherFormulario(dadosCarregados);
    } else {
      throw new Error("Falha ao carregar dados do usuário.");
    }
  } catch (error) {
    console.error(error);
    document.querySelector(".content").innerHTML = `<h1>Erro</h1><p>Não foi possível conectar à API para carregar seus dados. ${error.message}</p>`;
  }
}

/**
 * Coleta os dados do formulário e envia para a API (Atualização).
 */
async function salvarDadosPessoais(event) {
  event.preventDefault();
  const endpointInfo = ENDPOINTS[userRole];
  if (!endpointInfo) return;

  // Coleta os dados do formulário
  const dadosAtualizados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value, // O backend já valida se o email pode ser mudado
    cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
    CPF: document.getElementById("cpf").value.replace(/\D/g, ""), // Envia os dois formatos (Aluno/Instrutor)
    telefone: document.getElementById("telefone").value.replace(/\D/g, ""),
    sexo: document.getElementById("sexo").value,
    dataNascimento: document.getElementById("nascimento").value,
    endereco: {
      rua: document.getElementById("rua").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
      cep: document.getElementById("cep").value.replace(/\D/g, ""),
      bairro: document.getElementById("bairro").value,
      numero: document.getElementById("numero").value
    }
  };
  
  // Adiciona dados específicos da role (Aluno)
  if(userRole === 'ROLE_ALUNO') {
      dadosAtualizados.altura = dadosCarregados.altura || 0; // Mantém altura e peso originais
      dadosAtualizados.peso = dadosCarregados.peso || 0;
      // Mantém plano e instrutor originais
      if(dadosCarregados.matriculaList && dadosCarregados.matriculaList.length > 0) {
          dadosAtualizados.planoId = dadosCarregados.matriculaList[0].plano.id;
          dadosAtualizados.instrutorId = dadosCarregados.matriculaList[0].instrutor.id;
      }
  }

  try {
    const response = await fetch(endpointInfo.update, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosAtualizados)
    });

    if (response.ok) {
      dadosCarregados = await response.json(); // Atualiza os dados salvos
      alert("Dados atualizados com sucesso!");
      toggleEdit(); // Sai do modo de edição
    } else {
      const erro = await response.text();
      throw new Error(erro);
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert(`Não foi possível salvar: ${error.message}`);
  }
}

/**
 * Envia o pedido de alteração de senha.
 */
async function alterarSenha(event) {
  event.preventDefault();
  
  const senhaAtual = document.getElementById("senhaAtual").value;
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value;

  if (novaSenha !== confirmarNovaSenha) {
    alert("A nova senha e a confirmação não são iguais.");
    return;
  }
  
  if(novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
  }

  try {
    const response = await fetch("http://localhost:8080/auth/alterar-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ senhaAtual, novaSenha })
    });

    const resposta = await response.text();
    
    if (response.ok) {
      alert(resposta); // "Senha alterada com sucesso."
      document.getElementById("alterarSenhaForm").reset(); // Limpa o formulário de senha
    } else {
      throw new Error(resposta); // "A senha atual está incorreta."
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    alert(`Não foi possível alterar a senha: ${error.message}`);
  }
}


// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener("DOMContentLoaded", function () {
  // 1. Carrega os dados do usuário
  carregarMeusDados();

  // 2. Conecta os botões e formulários
  document.getElementById("btnToggleEdit").addEventListener("click", toggleEdit);
  document.getElementById("meusDadosForm").addEventListener("submit", salvarDadosPessoais);
  document.getElementById("alterarSenhaForm").addEventListener("submit", alterarSenha);

  // 3. Conecta as máscaras e o ViaCEP
  document.getElementById("cpf").addEventListener("input", (e) => e.target.value = formatarCPF(e.target.value));
  document.getElementById("telefone").addEventListener("input", (e) => e.target.value = formatarTelefone(e.target.value));
  const cepInput = document.getElementById("cep");
  cepInput.addEventListener("input", (e) => e.target.value = formatarCEP(e.target.value));
  cepInput.addEventListener("blur", buscarCEP);

  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) window.location.href = pagina;
    });
  });

  // 4. Lógica de navegação (Home e Sair)
  document.getElementById("iconHome").addEventListener("click", () => window.location.href = 'home.html');
  document.querySelector(".navbar .bi-box-arrow-right").addEventListener("click", () => {
      if (confirm("Deseja sair do sistema?")) {
          localStorage.clear();
          window.location.href = "Index.html";
      }
  });
});