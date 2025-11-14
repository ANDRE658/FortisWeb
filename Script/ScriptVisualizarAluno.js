// --- Variáveis Globais ---
let alunoId = null;
let alturaDoAlunoCm = 0; // Precisamos guardar a altura para recalcular o IMC

/**
 * Função para calcular o IMC
 */
function calcularIMC(peso, alturaCm) {
    if (alturaCm <= 0) return 0;
    const alturaM = alturaCm / 100.0;
    const imc = peso / (alturaM * alturaM);
    return imc.toFixed(2); // Retorna formatado com 2 casas
}

/**
 * Formata a data de YYYY-MM-DD para DD/MM/YYYY
 */
function formatarData(dataISO) {
    if (!dataISO) return "--/--/----";
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata o sexo
 */
function formatarSexo(sexoChar) {
    if (sexoChar === 'M') return "Masculino";
    if (sexoChar === 'F') return "Feminino";
    return "Não informado";
}

/**
 * Carrega os dados do aluno da API
 */
async function carregarDadosAluno() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Sessão expirada!");
        window.location.href = "Index.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/aluno/visualizar/${alunoId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Falha ao carregar dados do aluno.");
        }

        const aluno = await response.json();

        // Salva a altura para cálculos
        alturaDoAlunoCm = aluno.altura || 0;

        // Preenche os campos
        document.getElementById("nomeAlunoTitulo").textContent = aluno.nome || "Aluno";
        document.getElementById("idade").textContent = aluno.idade > 0 ? `${aluno.idade} anos` : "--";
        document.getElementById("sexo").textContent = formatarSexo(aluno.sexo);
        document.getElementById("altura").textContent = `${aluno.altura || 0} cm`;
        document.getElementById("dataInicio").textContent = formatarData(aluno.dataInicio);
        document.getElementById("peso").value = aluno.peso.toFixed(1) || 0;
        document.getElementById("imc").textContent = aluno.imc > 0 ? aluno.imc : "--";

    } catch (error) {
        console.error("Erro:", error);
        alert(error.message);
        window.location.href = "Alunos.html";
    }
}

/**
 * Salva o novo peso
 */
async function salvarNovoPeso(event) {
    event.preventDefault(); // Impede o recarregamento da página
    const token = localStorage.getItem("jwtToken");
    const pesoInput = document.getElementById("peso");
    const novoPeso = parseFloat(pesoInput.value);

    if (!novoPeso || novoPeso <= 0) {
        alert("Por favor, insira um peso válido.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/aluno/atualizar-peso/${alunoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ novoPeso: novoPeso })
        });

        if (!response.ok) {
            const erro = await response.text();
            throw new Error(erro);
        }

        alert("Peso atualizado com sucesso!");
        // Opcional: desabilitar o botão salvar até que o peso mude novamente

    } catch (error) {
        console.error("Erro ao salvar peso:", error);
        alert(`Erro: ${error.message}`);
    }
}

// --- Ponto de Entrada: O DOM foi carregado ---
document.addEventListener("DOMContentLoaded", function () {
    // 1. Pega o ID do aluno da URL
    const urlParams = new URLSearchParams(window.location.search);
    alunoId = urlParams.get("id");

    if (!alunoId) {
        alert("ID do aluno não encontrado.");
        window.location.href = "Alunos.html";
        return;
    }

    // 2. Carrega os dados
    carregarDadosAluno();

    // 3. Configura a navegação padrão
    const nomeUsuario = localStorage.getItem("usuarioLogado") || "Usuário";
    const elUser = document.getElementById("userName");
    if (elUser) elUser.textContent = nomeUsuario;

    document.getElementById("iconHome").addEventListener("click", () => window.location.href = 'home.html');
    document.querySelector(".navbar .bi-box-arrow-right").addEventListener("click", () => {
        if (confirm("Deseja sair do sistema?")) {
            localStorage.clear();
            window.location.href = "Index.html";
        }
    });

    // 4. Conecta os eventos do formulário
    document.getElementById("pesoForm").addEventListener("submit", salvarNovoPeso);

    // 5. Recalcula o IMC dinamicamente
    document.getElementById("peso").addEventListener("input", (e) => {
        const novoPeso = parseFloat(e.target.value);
        if (novoPeso > 0 && alturaDoAlunoCm > 0) {
            const novoImc = calcularIMC(novoPeso, alturaDoAlunoCm);
            document.getElementById("imc").textContent = novoImc;
        } else {
            document.getElementById("imc").textContent = "--";
        }
    });
});

// 4. Lógica de navegação (Menu)
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.addEventListener("click", function (event) {
      const pagina = event.currentTarget.dataset.page;
      if (pagina) {
        window.location.href = pagina;
      }
    });
  });