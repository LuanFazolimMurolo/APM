
const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const preview = document.getElementById("preview");
const readBtn = document.getElementById("readBtn");
const plateContainer = document.getElementById("plateContainer");
const confirmBtn = document.getElementById("confirmBtn");
const result = document.getElementById("result");

let selectedFile = null;

function handleFile(file) {
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

cameraInput.addEventListener("change", e => {
  if (e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

galleryInput.addEventListener("change", e => {
  if (e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

readBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Selecione ou tire uma foto primeiro.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  const response = await fetch("https://liltingly-countrified-nan.ngrok-free.dev/read-plate"
, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!data.plate) {
    alert("Placa não encontrada.");
    return;
  }

  generatePlateBoxes(data.plate);
});

function generatePlateBoxes(plate) {
  plateContainer.innerHTML = "";

  plate.split("").forEach(char => {
    const input = document.createElement("input");
    input.value = char.toUpperCase();
    input.maxLength = 1;
    input.classList.add("plate-box");

    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
    });

    plateContainer.appendChild(input);
  });
}

confirmBtn.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".plate-box");
  let finalPlate = "";

  inputs.forEach(input => {
    finalPlate += input.value;
  });

  result.innerText = "Placa confirmada: " + finalPlate;
});
