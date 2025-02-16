// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALeFa7M2E0GjXuQnUN3eCUkyXKkFbr_0",
  authDomain: "donaciones-en-tiempo-real.firebaseapp.com",
  projectId: "donaciones-en-tiempo-real",
  storageBucket: "donaciones-en-tiempo-real.firebasestorage.app",
  messagingSenderId: "542484805974",
  appId: "1:542484805974:web:39083c13e2840eb9077ef7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias a las tablas y gráficos
const tablaDonaciones = document.querySelector("#tabla-donaciones tbody");
const tablaVoluntariados = document.querySelector("#tabla-voluntariados tbody");
const selectOrdenar = document.getElementById("ordenar");

// Canvas y contexto de los gráficos
const canvasDonaciones = document.getElementById("grafico-donaciones").getContext("2d");
const canvasComparativo = document.getElementById("grafico-progresivo").getContext("2d");

let chartDonaciones, chartComparativo;

// Variables globales para almacenar los datos completos
let donationData = [];
let volunteerData = [];

// Función para convertir Timestamp de Firebase a Date
function parseFecha(fecha) {
  return fecha?.toDate ? fecha.toDate() : new Date(fecha || 0);
}

// Función para formatear fecha
function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-ES", { 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "Sin fecha";
}

// Función para mostrar la tabla de donaciones
function mostrarTablaDonaciones(datos, criterio = "fecha-desc") {
  datos.sort((a, b) => {
    if (criterio === "fecha-desc") return parseFecha(b.fecha) - parseFecha(a.fecha);
    if (criterio === "fecha-asc") return parseFecha(a.fecha) - parseFecha(b.fecha);
    if (criterio === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (criterio === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    if (criterio === "monto-desc") return Number(b.monto) - Number(a.monto);
    if (criterio === "monto-asc") return Number(a.monto) - Number(b.monto);
  });

  tablaDonaciones.innerHTML = "";
  datos.forEach(data => {
    tablaDonaciones.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.email}</td>
        <td>${data.moneda}</td>
        <td>${data.tipo}</td>
        <td>${data.monto}</td>
        <td>${data.mensaje}</td>
        <td>${formatearFecha(parseFecha(data.fecha))}</td>
      </tr>`;
  });
}

// Función para actualizar el gráfico de donaciones (primer gráfico)
function actualizarGraficoDonaciones(datos) {
  if (chartDonaciones) {
    chartDonaciones.destroy();
  }

  let nombres = datos.map(d => d.nombre);
  let montos = datos.map(d => d.monto);

  chartDonaciones = new Chart(canvasDonaciones, {
    type: "bar",
    data: {
      labels: nombres,
      datasets: [{
        label: "Montos Donados",
        data: montos,
        backgroundColor: "#FF9F00",
        borderColor: "#000",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Función para mostrar la tabla de voluntariados
function mostrarTablaVoluntariados(datos) {
  tablaVoluntariados.innerHTML = "";
  datos.forEach(data => {
    tablaVoluntariados.innerHTML += `
      <tr>
        <td>${data.nombre}</td>
        <td>${data.email}</td>
        <td>${data.telefono || "N/A"}</td>
        <td>${data.habilidades || "N/A"}</td>
        <td>${formatearFecha(parseFecha(data.fecha))}</td>
      </tr>`;
  });
}

/* 
  Función auxiliar para agrupar datos por meses:
  Se consideran los meses: Noviembre (2024), Diciembre (2024), Enero (2025) y Febrero (2025)
*/
function contarPorMes(datos) {
  let counts = {
    "Noviembre": 0,
    "Diciembre": 0,
    "Enero": 0,
    "Febrero": 0
  };
  datos.forEach(doc => {
    let date = parseFecha(doc.fecha);
    if (date >= new Date("2024-11-01") && date < new Date("2025-03-01")) {
      let month = date.getMonth();
      let year = date.getFullYear();
      if (year === 2024 && month === 10) counts["Noviembre"]++;
      else if (year === 2024 && month === 11) counts["Diciembre"]++;
      else if (year === 2025 && month === 0) counts["Enero"]++;
      else if (year === 2025 && month === 1) counts["Febrero"]++;
    }
  });
  return counts;
}

function actualizarGraficoComparativoPorMes() {
  const donationCounts = contarPorMes(donationData);
  const volunteerCounts = contarPorMes(volunteerData);
  const labels = ["Noviembre", "Diciembre", "Enero", "Febrero"];
  const donationArray = labels.map(label => donationCounts[label] || 0);
  const volunteerArray = labels.map(label => volunteerCounts[label] || 0);

  if (chartComparativo) {
    chartComparativo.destroy();
  }

  chartComparativo = new Chart(canvasComparativo, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Donaciones",
          data: donationArray,
          backgroundColor: "#FF9F00",
          borderColor: "#000",
          borderWidth: 2,
          borderRadius: 10
        },
        {
          label: "Voluntariados",
          data: volunteerArray,
          backgroundColor: "#4B0082",
          borderColor: "#000",
          borderWidth: 2,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Actualización en tiempo real: Donaciones
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  donationData = snapshot.docs.map(doc => doc.data());
  mostrarTablaDonaciones(donationData, selectOrdenar.value);
  actualizarGraficoDonaciones(donationData);
  actualizarGraficoComparativoPorMes();
});

// Actualización en tiempo real: Voluntariados
onSnapshot(collection(db, "voluntariados"), (snapshot) => {
  volunteerData = snapshot.docs.map(doc => doc.data());
  mostrarTablaVoluntariados(volunteerData);
  actualizarGraficoComparativoPorMes();
});

// Actualización de la tabla al cambiar el orden
selectOrdenar.addEventListener("change", () => {
  onSnapshot(collection(db, "usuarios"), (snapshot) => {
    let datos = snapshot.docs.map(doc => doc.data());
    mostrarTablaDonaciones(datos, selectOrdenar.value);
  });
});
