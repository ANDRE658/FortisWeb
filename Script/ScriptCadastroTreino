// Lista de exercícios (você pode expandir)
const listaExercicios = [
  "Supino",
  "Agachamento",
  "Rosca direta",
  "Desenvolvimento",
  "Peck deck",
  "Crucifixo",
  "Leg Press",
  "Barra fixa",
  "Remada curvada",
  "Abdominal",
  "Flexão",
  "Puxador",
];

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
        window.location.href = "login.html";
      }
    });
});

// Editar exercício ao clicar
function editExercise(element, nomeAtual = "", detalhes = "") {
  const [seriesReps] = detalhes.split(" / ");
  const series = seriesReps ? seriesReps.split(" ")[0] : "";
  const reps = seriesReps ? seriesReps.split(" ")[2] : "";

  // Criar formulário de edição
  const form = document.createElement("div");
  form.className = "exercise-edit-form";

  // Dropdown de exercícios
  const select = document.createElement("select");
  select.style.flex = "1";
  select.innerHTML = listaExercicios
    .map(
      (ex) =>
        `<option value="${ex}" ${
          ex === nomeAtual ? "selected" : ""
        }>${ex}</option>`
    )
    .join("");

  // Campos de séries e repetições
  const seriesInput = document.createElement("input");
  seriesInput.type = "number";
  seriesInput.placeholder = "S";
  seriesInput.value = series;
  seriesInput.style.width = "50px";

  const repsInput = document.createElement("input");
  repsInput.type = "number";
  repsInput.placeholder = "R";
  repsInput.value = reps;
  repsInput.style.width = "50px";

  // Botão de aplicar (opcional, mas vamos usar o blur)
  form.appendChild(select);
  form.appendChild(seriesInput);
  form.appendChild(repsInput);

  // Substituir conteúdo
  const oldContent = element.innerHTML;
  element.innerHTML = "";
  element.appendChild(form);

  // Focar no dropdown
  select.focus();

  // Salvar ao sair do foco
  const salvar = () => {
    const nome = select.value;
    const s = seriesInput.value;
    const r = repsInput.value;
    let textoDetalhes = "";
    if (s && r) textoDetalhes = `${s} s / ${r} r`;
    else if (s || r) textoDetalhes = s ? `${s} s` : `${r} r`;

    element.innerHTML = `
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${nome}</span>
          ${
            textoDetalhes
              ? `<span style="margin: 0 8px; font-size: 12px; color: #666;">${textoDetalhes}</span>`
              : ""
          }
        `;
    element.style.cursor = "pointer";
    element.onclick = () => editExercise(element, nome, textoDetalhes);
  };

  // Eventos
  select.addEventListener("blur", salvar);
  seriesInput.addEventListener("blur", salvar);
  repsInput.addEventListener("blur", salvar);

  // Também salvar ao pressionar Enter
  [select, seriesInput, repsInput].forEach((el) => {
    el.addEventListener("keypress", (e) => {
      if (e.key === "Enter") salvar();
    });
  });
}

// Adicionar novo exercício
function addExercise(button) {
  const dayColumn = button.closest(".day-column");
  const newItem = document.createElement("div");
  newItem.className = "exercise-item";
  newItem.style.cursor = "pointer";
  newItem.innerHTML =
    '<span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Selecione um exercício</span>';
  newItem.onclick = () => editExercise(newItem);
  dayColumn.insertBefore(newItem, button);
}

btEditarSegunda.addEventListener("click", function () {
  window.location.href = "AdicionarExercicio.html";
});
btEditarTerca.addEventListener("click", function () {
  window.location.href = "AdicionarExercicio.html";
});
btEditarQuarta.addEventListener("click", function () {
  window.location.href = "AdicionarExercicio.html";
});
btEditarQuinta.addEventListener("click", function () {
  window.location.href = "AdicionarExercicio.html";
});
btEditarSexta.addEventListener("click", function () {
  window.location.href = "AdicionarExercicio.html";
});
