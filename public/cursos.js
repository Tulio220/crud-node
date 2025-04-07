let conteudoGeralTabela = [];

function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-20px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function fetchAPI(url, method = "GET", body = null) {
  try {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

    return response.json();
  } catch (error) {
    console.error(`Erro na requisição ${method} para ${url}:`, error);
    showNotification("Erro na operação. Veja o console.", "error");
  }
}

// Modifique a fetchCursos para:
async function fetchCursos() {
  const data = await fetchAPI("http://localhost:3000/curso");
  if (data) {
    conteudoGeralTabela = data; // Atualize primeiro a variável
    preencherTabela(data); // Depois preencha a tabela
  }
  return data || [];
}

// Modifique a função preencherTabela para:
function preencherTabela(cursos) {
  const tbody = document.getElementById("lista");
  tbody.innerHTML = "";

  if (!Array.isArray(cursos) || cursos.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6'>Nenhum resultado encontrado</td></tr>";
    return;
  }

  // Adicione data-index e use criação segura de elementos
  cursos.forEach((curso, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index; // 🔑 Atributo crítico para o filtro

    row.innerHTML = `
      <td>${curso.idcurso || "N/A"}</td>
      <td>${curso.nome || "N/A"}</td>
      <td>${curso.descricao || "N/A"}</td>
      <td>${curso.cargaHoraria || "N/A"}</td>
      <td>${curso.valor || "N/A"}</td>
      <td class="btn-container">
        <button class="edit-btn" data-id="${curso.idcurso}">
          <i class="fas fa-edit"></i> 
        </button>
        <button class="delete-btn" data-id="${curso.idcurso}">
          <i class="fas fa-trash"></i> 
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  inicializarDataTable();
  ativarEventosBotoes();
}

function inicializarDataTable() {
  if ($.fn.DataTable.isDataTable("#userTable")) {
    $("#userTable").DataTable().destroy();
  }

  $("#userTable").DataTable({
    pageLength: 10,
    language: {
      emptyTable: "Nenhum registro encontrado",
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 a 0 de 0 registros",
      infoFiltered: "(filtrado de _MAX_ registros totais)",
      infoPostFix: "",
      lengthMenu: "Mostrar _MENU_ registros por página",
      loadingRecords: "Carregando...",
      processing: "Processando...",
      search: "Pesquisar:",
      searchPlaceholder: "Digite para pesquisar...",
      zeroRecords: "Nenhum registro correspondente encontrado",
      paginate: {
        first: "Primeiro",
        last: "Último",
        next: "Próximo",
        previous: "Anterior",
      },
      aria: {
        sortAscending: ": ativar para ordenar coluna ascendente",
        sortDescending: ": ativar para ordenar coluna descendente",
      },
      decimal: ",",
      thousands: ".",
    },
    order: [[0, "desc"]],
    searching: true,
    paging: true,
    lengthChange: true,
    responsive: true,
    columnDefs: [
      {
        targets: 4, // Coluna 4 (zero-indexed)
        render: function (data) {
          return data
            ? `R$ ${parseFloat(data).toFixed(2).replace(".", ",")}`
            : "N/A";
        },
      },
    ],
  });
}
function ativarEventosBotoes() {
  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) => btn.addEventListener("click", handleEditClick));
  document
    .querySelectorAll(".delete-btn")
    .forEach((btn) => btn.addEventListener("click", handleDeleteClick));
}

async function handleEditClick(event) {
  const id = event.target.closest(".edit-btn").dataset.id;
  const curso = await fetchAPI(`http://localhost:3000/curso/${id}`);

  if (!curso) return;

  // Preenche o modal de edição
  document.getElementById("editId").value = curso.idcurso;
  document.getElementById("editNome").value = curso.nome;
  document.getElementById("editDescricao").value = curso.descricao;
  document.getElementById("editCargaHoraria").value = curso.cargaHoraria;
  document.getElementById("editValor").value = curso.valor;

  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();

  // Remove event listeners anteriores para evitar múltiplas atribuições
  const saveButton = document.getElementById("saveEdit");
  const newSaveHandler = async () => {
    const updatedCurso = {
      nome: document.getElementById("editNome").value.trim(),
      descricao: document.getElementById("editDescricao").value.trim(),
      cargaHoraria: Number(document.getElementById("editCargaHoraria").value),
      valor: Number(document.getElementById("editValor").value),
    };

    // Validação básica
    if (!updatedCurso.nome || !updatedCurso.descricao) {
      showNotification("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const response = await fetchAPI(
      `http://localhost:3000/curso/${id}`,
      "PUT",
      updatedCurso
    );

    if (response) {
      showNotification("Curso atualizado com sucesso!", "success");
      editModal.hide();

      window.location.reload();
      await fetchCursos(); // Atualiza os dados e a tabela
      saveButton.removeEventListener("click", newSaveHandler);
    }
  };

  saveButton.addEventListener("click", newSaveHandler);
}

async function handleDeleteClick(event) {
  const id = event.target.closest(".delete-btn").dataset.id;
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
  );
  deleteModal.show();

  // Configuração única do handler
  const confirmButton = document.getElementById("confirmDelete");
  const deleteHandler = async () => {
    const response = await fetchAPI(
      `http://localhost:3000/curso/${id}`,
      "DELETE"
    );

    if (response) {
      showNotification("Curso excluído com sucesso!", "success");
      deleteModal.hide();
      await fetchCursos(); // Atualiza a tabela sem recarregar a página

      window.location.reload(); 
      confirmButton.removeEventListener("click", deleteHandler);
    }
  };

  confirmButton.addEventListener("click", deleteHandler);
}

document.getElementById("saveCreate").onclick = async () => {
  const newCurso = {
    nome: document.getElementById("createNome").value.trim(),
    descricao: document.getElementById("createDescricao").value.trim(),
    cargaHoraria: Number(document.getElementById("createCargaHoraria").value),
    valor: Number(document.getElementById("createValor").value),
  };

  // Validação reforçada
  if (
    !newCurso.nome ||
    !newCurso.descricao ||
    isNaN(newCurso.cargaHoraria) ||
    isNaN(newCurso.valor)
  ) {
    showNotification("Preencha todos os campos corretamente", "error");
    return;
  }

  const response = await fetchAPI(
    "http://localhost:3000/curso",
    "POST",
    newCurso
  );

  if (response) {
    showNotification("Curso cadastrado com sucesso!", "success");
    bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
    document.getElementById("createForm").reset();
    window.location.reload();
    await fetchCursos(); // Atualiza a tabela dinamicamente
  }
};

document.getElementById("themeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "darkTheme",
    document.body.classList.contains("dark-theme")
  );
  this.innerHTML = document.body.classList.contains("dark-theme")
    ? '<i class="fas fa-sun"></i> Modo Claro'
    : '<i class="fas fa-moon"></i> Modo Escuro';
});

if (localStorage.getItem("darkTheme") === "true") {
  document.body.classList.add("dark-theme");
  document.getElementById("themeToggle").innerHTML =
    '<i class="fas fa-sun"></i> Modo Claro';
}

async function sendUserMessage() {
  const messageInput = document.getElementById("userMessage");
  const message = messageInput.value.trim();
  if (!message) return;

  addMessageToChat("user", message);
  messageInput.value = "";

  addMessageToChat("bot", "Digitando...");

  const response = await fetchAPI("http://localhost:3000/chat", "POST", {
    message,
  });
  if (response) {
    document.getElementById("chatMessages").lastElementChild.remove();
    addMessageToChat("bot", response.response);
  }
}

function addMessageToChat(type, message) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.trim().toLowerCase();
  const rows = document.querySelectorAll("#lista tr");

  rows.forEach((row) => {
    const index = row.dataset.index;
    const curso = conteudoGeralTabela[index];

    const match = curso
      ? Object.values(curso).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      : false;

    row.style.display = match ? "table-row" : "none";
  });

  // Atualize o DataTable após a filtragem
  $("#userTable").DataTable().draw();
});

window.onload = fetchCursos;
