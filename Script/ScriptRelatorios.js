// Carrega o nome do usuário salvo no localStorage
document.addEventListener("DOMContentLoaded", function () {
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.getElementById("userName").textContent = nomeUsuario;

  // Simula clique nos menus
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    // Note que mudei o parâmetro 'alunos' para 'event', que é o nome correto
    item.addEventListener("click", function (event) {
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
});

iconHome.addEventListener("click", function () {
  window.location.href = "Home.html";
});

// Função para simular download de relatório
function downloadReport(type) {
  let filename = "";
  let content = "";

  switch (type) {
    case "alunos":
      filename = "relatorio_alunos.csv";
      content =
        "Nome Completo,Plano,Status\nJorge Sandro,Gold,Ativo\nKassandra M.,Silver,Inativo";
      break;
    case "treinos":
      filename = "relatorio_treinos.csv";
      content =
        "Aluno,Nome Treino,Status\nFulano da Silva,Treino superiores,Ativo\nFulano da Silva,Experimental,Inativo";
      break;
    case "planos":
      filename = "relatorio_planos.csv";
      content =
        "Plano,Status,Valor\nGold (Mensal),Ativo,R$ 89,90\nSilver (Semestral),Ativo,R$ 109,90";
      break;
  }

  // Cria um blob e força o download
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
