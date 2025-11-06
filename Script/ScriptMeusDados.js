// Função para alternar entre modo visual e edição
function toggleEdit() {
  const form = document.getElementById("meusDadosForm");
  if (form.classList.contains("view-mode")) {
    form.classList.remove("view-mode");
    form.classList.add("edit-mode");
    document.querySelector(".btn-edit i").classList.remove("bi-pencil");
    document.querySelector(".btn-edit i").classList.add("bi-x");
    document.querySelector(".btn-edit").textContent = "Cancelar";
    document.querySelectorAll(".form-control").forEach((input) => {
      input.removeAttribute("readonly");
    });
  } else {
    form.classList.remove("edit-mode");
    form.classList.add("view-mode");
    document.querySelector(".btn-edit i").classList.remove("bi-x");
    document.querySelector(".btn-edit i").classList.add("bi-pencil");
    document.querySelector(".btn-edit").textContent = "Editar";
    document.querySelectorAll(".form-control").forEach((input) => {
      input.setAttribute("readonly", true);
    });
  }
}

// Simulação de salvamento
document
  .getElementById("meusDadosForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const nascimento = document.getElementById("nascimento").value;
    const cep = document.getElementById("cep").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const bairro = document.getElementById("bairro").value;
    const rua = document.getElementById("rua").value;

    // Simulação de salvamento
    alert(`Dados atualizados com sucesso!\nNome: ${nome}\nEmail: ${email}`);

    // Volta para modo visual
    toggleEdit();
  });

// Carrega o nome do usuário salvo no localStorage (opcional)
document.addEventListener("DOMContentLoaded", function () {
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Instrutor";
  document.querySelector("#nome").value = nomeUsuario;
});
