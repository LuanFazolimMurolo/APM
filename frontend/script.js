/*   "https://liltingly-countrified-nan.ngrok-free.dev/read-plate"   */
const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const preview = document.getElementById("preview");
const readBtn = document.getElementById("readBtn");
const plateContainer = document.getElementById("plateContainer");
const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");
const prismaInput = document.getElementById("prismaInput");

let selectedFile = null;

/* ===== CRIAR 7 QUADRADOS FIXOS AO ABRIR ===== */

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

/* ===== PREVIEW ===== */

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

/* ===== LEITURA API ===== */

readBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Selecione ou tire uma foto primeiro.");
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

/* ===== PREENCHER QUADRADOS ===== */

function fillPlate(plate) {
  const inputs = document.querySelectorAll(".plate-box");

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = plate[i] ? plate[i].toUpperCase() : "";
  }
}

/* ===== CONFIRMAR ===== */

confirmBtn.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".plate-box");
  let finalPlate = "";

  inputs.forEach(input => {
    finalPlate += input.value;
  });

  const prisma = prismaInput.value;

  if (!finalPlate || !prisma) {
    alert("Preencha placa e prisma.");
    return;
  }

  result.innerHTML = `
    ✅ <strong>Confirmado</strong><br>
    Placa: ${finalPlate}<br>
    Prisma: ${prisma}
  `;
});
