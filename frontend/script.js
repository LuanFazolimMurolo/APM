const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const preview = document.getElementById("preview");
const readBtn = document.getElementById("readBtn");
const plateContainer = document.getElementById("plateContainer");
const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");
const prismaInput = document.getElementById("prismaInput");

const garageList = document.getElementById("garageList");
const exitedList = document.getElementById("exitedList");

const searchGarage = document.getElementById("searchGarage");
const searchExited = document.getElementById("searchExited");

let selectedFile = null;
let registros = [];

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

function handleFile(file) {
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = e => preview.src = e.target.result;
  reader.readAsDataURL(file);
}

cameraInput.addEventListener("change", e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

galleryInput.addEventListener("change", e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

readBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Selecione ou tire uma foto.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  const response = await fetch("https://liltingly-countrified-nan.ngrok-free.dev/read-plate", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!data.plate) {
    alert("Placa não encontrada.");
    return;
  }

  fillPlate(data.plate);
});

function fillPlate(plate) {
  const inputs = document.querySelectorAll(".plate-box");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = plate[i] ? plate[i].toUpperCase() : "";
  }
}

function formatTime(date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

confirmBtn.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".plate-box");
  let finalPlate = "";

  inputs.forEach(input => finalPlate += input.value);

  const prisma = prismaInput.value;

  if (!finalPlate || !prisma) {
    alert("Preencha placa e prisma.");
    return;
  }

    const novoRegistro = {
    id: Date.now(), // ID único
    placa: finalPlate,
    prisma: prisma,
    status: "na_garagem",
    entrada: new Date(),
    saida: null
    };


  registros.push(novoRegistro);
  renderRegistros();

  result.innerHTML = `
    ✔ Entrada Registrada<br>
    Placa: <strong>${finalPlate}</strong><br>
    Prisma: <strong>${prisma}</strong>
  `;

  resetInputs(); // 🔥 RESET AUTOMÁTICO
});

function marcarSaida(id) {
  const registro = registros.find(reg => reg.id === id);
  if (registro) {
    registro.status = "saiu";
    registro.saida = new Date();
  }
  renderRegistros();
}


function excluirRegistro(id) {
  registros = registros.filter(reg => reg.id !== id);
  renderRegistros();
}


searchGarage.addEventListener("input", renderRegistros);
searchExited.addEventListener("input", renderRegistros);

function renderRegistros() {
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

    // BOTÃO EXCLUIR
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      excluirRegistro(registro.id);
    });

    box.appendChild(deleteBtn);

    // CONTEÚDO
    const content = document.createElement("div");
    content.innerHTML = `
      <strong>Placa:</strong> ${registro.placa}<br>
      <strong>Prisma:</strong> ${registro.prisma}<br>
      <strong>Status:</strong> ${
        registro.status === "na_garagem"
          ? "Na garagem"
          : '<span style="color:#ef4444;">Saiu</span>'
      }<br>
      <strong>Entrada:</strong> ${formatTime(registro.entrada)}<br>
      ${
        registro.status === "na_garagem"
          ? ""
          : `<strong>Saída:</strong> ${formatTime(registro.saida)}`
      }
    `;

    box.appendChild(content);

    // BOTÃO SAÍDA
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
}

