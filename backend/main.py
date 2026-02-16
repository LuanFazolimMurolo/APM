from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI()

# Permitir frontend acessar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pega a chave do ambiente (mais seguro)
PLATE_API_KEY = os.getenv("PLATE_API_KEY")

@app.post("/read-plate")
async def read_plate(file: UploadFile = File(...)):
    image_bytes = await file.read()

    response = requests.post(
        "https://api.platerecognizer.com/v1/plate-reader/",
        files={"upload": image_bytes},
        headers={"Authorization": f"Token {PLATE_API_KEY}"}
    )

    result = response.json()

    if "results" in result and len(result["results"]) > 0:
        plate = result["results"][0]["plate"]
        return {"plate": plate.upper()}
    else:
        return {"plate": None}

@app.get("/health")
def health():
    return {"status": "ok"}
