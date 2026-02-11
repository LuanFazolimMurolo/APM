let currentPlate = "";

async function sendImage() {
    const input = document.getElementById("cameraInput");
    const file = input.files[0];

    if (!file) {
        alert("Selecione uma imagem");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://liltingly-countrified-nan.ngrok-free.dev/read-plate",{
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.plate) {
        currentPlate = data.plate;
        renderPlateBoxes(currentPlate);
    } else {
        alert("Placa não detectada");
    }
}

function renderPlateBoxes(plate) {
    const container = document.getElementById("plateContainer");
    container.innerHTML = "";

    plate.split("").forEach((char, index) => {
        const input = document.createElement("input");
        input.value = char;
        input.maxLength = 1;
        input.classList.add("plate-box");
        input.oninput = () => updatePlate();
        container.appendChild(input);
    });

    document.getElementById("confirmBtn").style.display = "block";
}

function updatePlate() {
    const inputs = document.querySelectorAll(".plate-box");
    currentPlate = Array.from(inputs).map(i => i.value.toUpperCase()).join("");
}

function confirmPlate() {
    alert("Placa confirmada: " + currentPlate);
    console.log("Placa final:", currentPlate);
}
