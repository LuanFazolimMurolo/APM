import { 
  criarTurno, 
  buscarTurnoAberto, 
  encerrarTurno,
  buscarTurnosEncerrados
} from "./turnosService.js";

import {
  criarRegistro,
  buscarRegistrosDoTurno,
  marcarSaidaRegistro,
  excluirRegistroBanco,
  buscarTodosRegistros,
  excluirTodosRegistros
} from "./registrosService.js";

let turnoAtual = null;

/* ===== ELEMENTOS ===== */
const homeScreen = document.getElementById("homeScreen");
const parkingScreen = document.getElementById("parkingScreen");
const historyScreen = document.getElementById("historyScreen");

const backBtn = document.getElementById("backBtn");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const startShiftBtn = document.getElementById("startShiftBtn");
const currentParkingBtn = document.getElementById("currentParkingBtn");
const historyBtn = document.getElementById("historyBtn");

/* ===== NAVEGAÇÃO ===== */
function showHome() {
  homeScreen.style.display = "block";
  parkingScreen.style.display = "none";
  historyScreen.style.display = "none";
  pageTitle.innerText = "APM 2.0.0";
  pageSubtitle.innerText = "Leitura Inteligente de Placas";
  backBtn.style.display = "none";
}

async function showParking() {
  homeScreen.style.display = "none";
  parkingScreen.style.display = "block";
  historyScreen.style.display = "none";
  pageTitle.innerText = "Estacionamento Atual";
  pageSubtitle.innerText = "";
  backBtn.style.display = "block";

  if (turnoAtual) {
    await carregarRegistros();
  }
}

async function showHistory() {
  homeScreen.style.display = "none";
  parkingScreen.style.display = "none";
  historyScreen.style.display = "block";

  pageTitle.innerText = "Histórico Geral";
  pageSubtitle.innerText = "";
  backBtn.style.display = "block";

  const registros = await buscarTodosRegistros();
  renderTabelaHistorico(registros);
}



/* ===== TURNO ===== */
async function iniciarSistema() {
  turnoAtual = await buscarTurnoAberto();
  atualizarEstadoUI();

  // 🔥 Se houver turno aberto, carregar registros automaticamente
  if (turnoAtual) {
    await carregarRegistros();
  }
}


function atualizarEstadoUI() {
  if (turnoAtual) {
    startShiftBtn.textContent = "Encerrar Turno";
    startShiftBtn.className = "btn-danger";
    currentParkingBtn.style.display = "block";
    console.log("Turno atual:", turnoAtual);

  } else {
    startShiftBtn.textContent = "Iniciar Turno";
    startShiftBtn.className = "btn-success";
    currentParkingBtn.style.display = "none";
    console.log("Encerrando ID:", turnoId);

  }
}

async function gerarResumoTurno() {
  if (!turnoAtual) return null;

  const registros = await buscarRegistrosDoTurno(turnoAtual.id);

  const totalVeiculos = registros.length;
  const ativos = registros.filter(r => !r.hora_saida).length;

  const inicio = new Date(turnoAtual.data_inicio);
  const agora = new Date();

  const diffMs = agora - inicio;
  const diffMin = Math.floor(diffMs / 1000 / 60);

  const horas = Math.floor(diffMin / 60);
  const minutos = diffMin % 60;

  return {
    totalVeiculos,
    ativos,
    inicio,
    horas,
    minutos
  };
}


function renderHistorico(turnos) {
  historyScreen.innerHTML = "";

  if (turnos.length === 0) {
    historyScreen.innerHTML = "<p>Nenhum turno encerrado.</p>";
    return;
  }

  turnos.forEach(turno => {
    const div = document.createElement("div");
    div.className = "card";

    const inicio = new Date(turno.data_inicio).toLocaleString();
    const fim = new Date(turno.data_fim).toLocaleString();

    div.innerHTML = `
      <strong>Turno #${turno.id}</strong><br>
      Início: ${inicio}<br>
      Fim: ${fim}
    `;

    historyScreen.appendChild(div);
  });
}


function renderTabelaHistorico(registros) {
  historyScreen.innerHTML = `
  <div style="margin-bottom:10px; display:flex; gap:8px; align-items:center;">
    <input type="date" id="filtroData">
    <input type="text" id="filtroPlaca" placeholder="Buscar por placa">
    <button id="limparFiltro">Limpar</button>
    <button id="excluirTudoBtn" style="background:#ef4444;color:white;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;">
      🗑 Excluir Tudo
    </button>
  </div>
  <div id="tabelaContainer"></div>
`;


  const tabelaContainer = document.getElementById("tabelaContainer");
  const filtroData = document.getElementById("filtroData");
  const filtroPlaca = document.getElementById("filtroPlaca");
  const limparFiltro = document.getElementById("limparFiltro");
  const excluirTudoBtn = document.getElementById("excluirTudoBtn");

excluirTudoBtn.addEventListener("click", async () => {
  const confirmar = confirm("Tem certeza que deseja excluir TODO o histórico?");

  if (!confirmar) return;

  await excluirTodosRegistros();

  alert("Histórico apagado com sucesso!");

  const registrosAtualizados = await buscarTodosRegistros();
  renderTabela(registrosAtualizados);
});


  function aplicarFiltro() {
    let filtrados = [...registros];

    if (filtroData.value) {
      filtrados = filtrados.filter(r => {
        const dataRegistro = new Date(r.criado_em).toISOString().split("T")[0];
        return dataRegistro === filtroData.value;
      });
    }

    if (filtroPlaca.value) {
      filtrados = filtrados.filter(r =>
        r.placa.toLowerCase().includes(filtroPlaca.value.toLowerCase())
      );
    }

    renderTabela(filtrados);
  }

  filtroData.addEventListener("change", aplicarFiltro);
  filtroPlaca.addEventListener("input", aplicarFiltro);
  limparFiltro.addEventListener("click", () => {
    filtroData.value = "";
    filtroPlaca.value = "";
    renderTabela(registros);
  });

  renderTabela(registros);

  function renderTabela(lista) {
    if (lista.length === 0) {
      tabelaContainer.innerHTML = "<p>Nenhum registro encontrado.</p>";
      return;
    }

    let html = `
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Entrada</th>
            <th>Saída</th>
          </tr>
        </thead>
        <tbody>
    `;

    lista.forEach(r => {
      html += `
        <tr>
          <td>${r.placa}</td>
          <td>${new Date(r.criado_em).toLocaleString()}</td>
          <td>${r.saida ? new Date(r.saida).toLocaleString() : "-"}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";

    tabelaContainer.innerHTML = html;
  }
}


startShiftBtn.addEventListener("click", async () => {
  if (!turnoAtual) {
    turnoAtual = await criarTurno();
  } else {
    const resumo = await gerarResumoTurno();

    const confirmar = confirm(`
    Resumo do Turno

    Iniciado em: ${resumo.inicio.toLocaleString()}
    Duração: ${resumo.horas}h ${resumo.minutos}min

    Total de veículos: ${resumo.totalVeiculos}
    Ainda no pátio: ${resumo.ativos}

    Deseja realmente encerrar?
    `);


    if (!confirmar) return;

    await encerrarTurno(turnoAtual.id);
    turnoAtual = null;
    showHome();

  }
  atualizarEstadoUI();
});

currentParkingBtn.addEventListener("click", showParking);
historyBtn.addEventListener("click", showHistory);
backBtn.addEventListener("click", showHome);

/* ===== REGISTROS ===== */
async function carregarRegistros() {
  if (!turnoAtual) return;
  const registros = await buscarRegistrosDoTurno(turnoAtual.id);
  window.renderRegistrosDoBanco(registros);
}


/* ===== API GLOBAL ===== */
window.sistema = {
  getTurno: () => turnoAtual,
  criarRegistro,
  marcarSaidaRegistro,
  excluirRegistroBanco,
  carregarRegistros
};

/* ===== START ===== */
showHome();
iniciarSistema();
