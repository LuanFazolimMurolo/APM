
const button = document.getElementById("readButton");

button.addEventListener("click", sendImage);

async function sendImage() {

    const input = document.getElementById("imageInput");
    const file = input.files[0];

    if (!file) {
        alert("Selecione uma imagem primeiro.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("loader").style.display = "block";
    document.getElementById("result").innerText = "";

    try {
        const response = await fetch("https://liltingly-countrified-nan.ngrok-free.dev/read-plate", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        document.getElementById("loader").style.display = "none";

        if (data.plate) {
            document.getElementById("result").innerText = data.plate;
        } else {
            document.getElementById("result").innerText = "Placa não detectada";
        }

    } catch (error) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("result").innerText = "Erro ao conectar ao servidor";
    }
}
