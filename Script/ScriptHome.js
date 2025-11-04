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

// Simulação de logout
document
  .querySelector(".bi-box-arrow-right")
  .addEventListener("click", function () {
    if (confirm("Deseja sair do sistema?")) {
      window.location.href = "index.html"; // Redireciona para login
    }
  });

dvTotAlunos.addEventListener("click", function () {
  window.location.href = "Alunos.html";
});
dvAtivAlunos.addEventListener("click", function () {
  window.location.href = "Alunos.html";
});
dvNovosAlunos.addEventListener("click", function () {
  window.location.href = "Alunos.html";
});

document.getElementById("fotoUsario").addEventListener("click", function () {
  window.location.href = "MeusDados.html";
});

btSuporte.addEventListener("click", function () {
  window.location.href = "Suporte.html";
});
