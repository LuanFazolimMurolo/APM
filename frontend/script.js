const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const preview = document.getElementById("preview");
const plateContainer = document.getElementById("plateContainer");
const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");
const prismaInput = document.getElementById("prismaInput");

const garageList = document.getElementById("garageList");
const exitedList = document.getElementById("exitedList");

const searchGarage = document.getElementById("searchGarage");
const searchExited = document.getElementById("searchExited");

let selectedFile = null;
cameraInput.addEventListener("change", handleFile);
galleryInput.addEventListener("change", handleFile);

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;

  // Mostrar preview
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
  };
  reader.readAsDataURL(file);

  // 🔥 Enviar para o backend
  await enviarParaBackend(file);
}
async function enviarParaBackend(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://apm-4pa7.onrender.com/read-plate", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.plate) {
      preencherPlaca(data.plate);
    } else {
      alert("Placa não detectada.");
    }

  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    alert("Erro ao conectar com o servidor.");
  }
}
function preencherPlaca(placa) {
  const inputs = document.querySelectorAll(".plate-box");

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = placa[i] || "";
  }
}




function createEmptyPlate() {
  plateContainer.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const input = document.createElement("input");
    input.maxLength = 1;
    input.classList.add("plate-box");

    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
      if (input.value && input.nextSibling) {
        input.nextSibling.focus();
      }
    });

    plateContainer.appendChild(input);
  }
}

createEmptyPlate();

function resetInputs() {
  const inputs = document.querySelectorAll(".plate-box");
  inputs.forEach(input => input.value = "");
  prismaInput.value = "";
  preview.src = "";
  selectedFile = null;
  inputs[0].focus();
}
confirmBtn.addEventListener("click", async () => {
  const inputs = document.querySelectorAll(".plate-box");
  let finalPlate = "";

  inputs.forEach(input => finalPlate += input.value);

  const prisma = prismaInput.value;

  if (!finalPlate || finalPlate.length < 7 || !prisma) {
    alert("Preencha placa e prisma.");
    return;
  }

  const turno = window.sistema.getTurno();
  if (!turno) {
    alert("Nenhum turno ativo.");
    return;
  }

  await window.sistema.criarRegistro(turno.id, finalPlate, prisma);
  await window.sistema.carregarRegistros();

  result.innerHTML = `
    ✔ Entrada Registrada<br>
    Placa: <strong>${finalPlate}</strong><br>
    Prisma: <strong>${prisma}</strong>
  `;

  resetInputs();
});


async function marcarSaida(id) {
  await window.sistema.marcarSaidaRegistro(id);
  await window.sistema.carregarRegistros();
}

async function excluirRegistro(id) {
  await window.sistema.excluirRegistroBanco(id);
  await window.sistema.carregarRegistros();
}

searchGarage.addEventListener("input", () => window.sistema.carregarRegistros());
searchExited.addEventListener("input", () => window.sistema.carregarRegistros());

window.renderRegistrosDoBanco = function(registros) {
  garageList.innerHTML = "";
  exitedList.innerHTML = "";

  const filtroGarage = searchGarage.value.toUpperCase();
  const filtroExited = searchExited.value.toUpperCase();

  registros.forEach((registro) => {

    if (registro.status === "na_garagem" && 
        !registro.placa.includes(filtroGarage)) return;

    if (registro.status === "saiu" && 
        !registro.placa.includes(filtroExited)) return;

    const box = document.createElement("div");
    box.classList.add("record-row");

    if (registro.status === "saiu") {
      box.classList.add("record-exited");
    }

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      excluirRegistro(registro.id);
    });

    box.appendChild(deleteBtn);

    const content = document.createElement("div");
    content.innerHTML = `
      <strong>Placa:</strong> ${registro.placa}<br>
      <strong>Prisma:</strong> ${registro.prisma}<br>
      <strong>Status:</strong> ${
        registro.status === "na_garagem"
          ? "Na garagem"
          : '<span style="color:#ef4444;">Saiu</span>'
      }<br>
      <strong>Entrada:</strong> ${new Date(registro.entrada).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}<br>
      ${
        registro.status === "saiu"
          ? `<strong>Saída:</strong> ${new Date(registro.saida).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}`
          : ""
      }
    `;

    box.appendChild(content);

    if (registro.status === "na_garagem") {
      const exitBtn = document.createElement("button");
      exitBtn.textContent = "Saiu";
      exitBtn.classList.add("exit-btn");
      exitBtn.addEventListener("click", () => {
        marcarSaida(registro.id);
      });
      box.appendChild(exitBtn);
    }

    if (registro.status === "na_garagem") {
      garageList.appendChild(box);
    } else {
      exitedList.appendChild(box);
    }
  });
};
async function acordarServidor() {
  const statusEl = document.getElementById("serverStatus");

  statusEl.textContent = "⏳ Aguardando servidor...";
  statusEl.style.color = "#facc15";

  try {
    const response = await fetch("https://apm-4pa7.onrender.com/health", {
      method: "GET",
      cache: "no-store"
    });

    if (response.ok) {
      statusEl.textContent = "✅ Servidor pronto";
      statusEl.style.color = "#22c55e";
    } else {
      statusEl.textContent = "⚠️ Servidor respondeu, mas com erro";
      statusEl.style.color = "#f97316";
    }

  } catch (err) {
    statusEl.textContent = "❌ Não foi possível conectar";
    statusEl.style.color = "#ef4444";
  }
}

window.addEventListener("load", acordarServidor);
