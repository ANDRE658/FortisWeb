// Carrega o nome do usuário salvo no localStorage
document.addEventListener("DOMContentLoaded", function () {
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // Simula clique nos menus
  document.querySelectorAll('.nav-menu li').forEach(item => {
    // Note que mudei o parâmetro 'alunos' para 'event', que é o nome correto
    item.addEventListener('click', function(event) {
        
        // Pega o destino do atributo 'data-page' do item clicado
        const pagina = event.currentTarget.dataset.page; 
        
        if (pagina) {
            window.location.href = pagina;
        }
    });
});

  // Botão de sair
  document
    .querySelector(".bi-box-arrow-right")
    .addEventListener("click", function () {
      if (confirm("Deseja sair do sistema?")) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "Index.html";
      }
    });

  // Botão de cadastro
  document.querySelector(".btn-add").addEventListener("click", function () {
    alert("Abrindo formulário de cadastro de aluno...");
    // window.location.href = "cadastro-aluno.html";
  });

  // Switches de status
  document.querySelectorAll(".switch input").forEach((switchInput) => {
    switchInput.addEventListener("change", function () {
      const row = this.closest("tr");
      const statusCell = row.querySelector("td:nth-child(3) span");
      if (this.checked) {
        statusCell.textContent = "Ativo";
        statusCell.className = "status-ativo";
      } else {
        statusCell.textContent = "Inativo";
        statusCell.className = "status-inativo";
      }
    });
  });

  iconHome.addEventListener("click", function () {
    window.location.href = "Home.html";
  });

  // Ícones de edição
  document.querySelectorAll(".action-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const nome =
        this.closest("tr").querySelector("td:first-child").textContent;
      alert(`Editando aluno: ${nome}`);
    });
  });

  btCadastrarAluno.addEventListener("click", function () {
    window.location.href = "CadastroAluno.html";
  });

  iconEdit.addEventListener("click", function () {
    window.location.href = "CadastroAluno.html";
  }); 
});


