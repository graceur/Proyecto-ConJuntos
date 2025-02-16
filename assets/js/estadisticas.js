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

// Referencias al DOM
const tablaDonaciones = document.querySelector("#tabla-donaciones tbody");
const tablaVoluntariados = document.querySelector("#tabla-voluntariados tbody");
const selDonaciones = document.getElementById("ordenar-donaciones");
const selVoluntariados = document.getElementById("ordenar-voluntariados");

// Variables para almacenar datos
let donationData = [], volunteerData = [];

// Funciones de ayuda para parsear y formatear fechas
const parseFecha = f => f?.toDate ? f.toDate().getTime() : new Date(f).getTime();
const formatDate = ts => new Date(ts).toLocaleString("es-ES", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

// Función para renderizar la tabla de donaciones
const renderDonations = data => {
  data.sort((a, b) => {
    const s = selDonaciones.value;
    return s === "fecha-desc" ? parseFecha(b.fecha) - parseFecha(a.fecha)
         : s === "fecha-asc"  ? parseFecha(a.fecha) - parseFecha(b.fecha)
         : s === "nombre-asc" ? a.nombre.localeCompare(b.nombre)
         : s === "nombre-desc"? b.nombre.localeCompare(a.nombre)
         : s === "monto-desc" ? Number(b.monto) - Number(a.monto)
         : s === "monto-asc"  ? Number(a.monto) - Number(b.monto)
         : 0;
  });
  tablaDonaciones.innerHTML = data.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td>${d.email}</td>
      <td>${d.moneda}</td>
      <td>${d.tipo}</td>
      <td>${d.monto}</td>
      <td>${d.mensaje}</td>
      <td>${formatDate(parseFecha(d.fecha))}</td>
    </tr>`).join("");
};

// Función para renderizar la tabla de voluntariados
const renderVolunteers = data => {
  data.sort((a, b) => {
    const s = selVoluntariados.value;
    return s === "fecha-desc" ? parseFecha(b.fecha) - parseFecha(a.fecha)
         : s === "fecha-asc"  ? parseFecha(a.fecha) - parseFecha(b.fecha)
         : s === "nombre-asc" ? a.nombre.localeCompare(b.nombre)
         : s === "nombre-desc"? b.nombre.localeCompare(a.nombre)
         : 0;
  });
  tablaVoluntariados.innerHTML = data.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td>${d.email}</td>
      <td>${d.telefono || "N/A"}</td>
      <td>${d.habilidades || "N/A"}</td>
      <td>${formatDate(parseFecha(d.fecha))}</td>
    </tr>`).join("");
};

// ---------------------
// GRÁFICO DE BARRAS POR MESES
// ---------------------
const ctx = document.getElementById('barChart').getContext('2d');
const monthLabels = ["Noviembre 2024", "Diciembre 2024", "Enero 2025", "Febrero 2025"];

const barChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: monthLabels,
    datasets: [
      {
        label: 'Donaciones',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Voluntariados',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  }
});

function updateChartData() {
  const donationCounts = [0, 0, 0, 0];
  const volunteerCounts = [0, 0, 0, 0];

  donationData.forEach(d => {
    const dateObj = new Date(parseFecha(d.fecha));
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    if (year === 2024 && month === 10) donationCounts[0]++;
    else if (year === 2024 && month === 11) donationCounts[1]++;
    else if (year === 2025 && month === 0) donationCounts[2]++;
    else if (year === 2025 && month === 1) donationCounts[3]++;
  });

  volunteerData.forEach(v => {
    const dateObj = new Date(parseFecha(v.fecha));
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    if (year === 2024 && month === 10) volunteerCounts[0]++;
    else if (year === 2024 && month === 11) volunteerCounts[1]++;
    else if (year === 2025 && month === 0) volunteerCounts[2]++;
    else if (year === 2025 && month === 1) volunteerCounts[3]++;
  });

  barChart.data.datasets[0].data = donationCounts;
  barChart.data.datasets[1].data = volunteerCounts;
  barChart.update();
}

// ---------------------
// GRÁFICO CIRCULAR (DOUGHNUT) DE TIPO DE MONEDA (Soles vs. Dólares)
// ---------------------
const donationTypeCtx = document.getElementById('donationTypeChart').getContext('2d');

const donationTypeChart = new Chart(donationTypeCtx, {
  type: 'doughnut',
  data: {
    labels: ['Soles', 'Dólares'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  }
});

// Función para eliminar acentos de una cadena
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Actualiza el gráfico circular de moneda contando soles y dólares
function updateDonationTypeChart() {
  let solesCount = 0;
  let dolaresCount = 0;

  donationData.forEach(d => {
    if (d.moneda) {
      const moneda = removeAccents(d.moneda.toLowerCase().trim());
      if (moneda === "soles") {
        solesCount++;
      } else if (moneda === "dolares") {
        dolaresCount++;
      }
    }
  });

  donationTypeChart.data.datasets[0].data = [solesCount, dolaresCount];
  donationTypeChart.update();
}

// ---------------------
// NUEVOS GRÁFICOS CIRCULARES EN EL CUARTO SNAP-ITEM
// ---------------------

// 1. Gráfico de tipo de donación (única vs. mensual)
const donationTypeDonacionCtx = document.getElementById('donationTypeDonacionChart').getContext('2d');
const donationTypeDonacionChart = new Chart(donationTypeDonacionCtx, {
  type: 'doughnut',
  data: {
    labels: ['Única', 'Mensual'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(255, 159, 64, 0.6)',  // Color para única
        'rgba(54, 162, 235, 0.6)'    // Color para mensual
      ],
      borderColor: [
        'rgba(255, 159, 64, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  }
});

// Función para actualizar el gráfico de tipo de donación (única vs. mensual)
function updateDonationTypeDonacionChart() {
  let unicaCount = 0;
  let mensualCount = 0;

  donationData.forEach(d => {
    if (d.tipo) {
      const tipo = removeAccents(d.tipo.toLowerCase().trim());
      // Consideramos tanto "unica" como "única" para donación única
      if (tipo === "unica" || tipo === "única" || tipo.includes("unica")) {
        unicaCount++;
      } else if (tipo.includes("mensual")) {
        mensualCount++;
      }
    }
  });

  donationTypeDonacionChart.data.datasets[0].data = [unicaCount, mensualCount];
  donationTypeDonacionChart.update();
}

// 2. Gráfico de monto de donación (15, 20, 50 y otros)
const donationAmountCtx = document.getElementById('donationAmountChart').getContext('2d');
const donationAmountChart = new Chart(donationAmountCtx, {
  type: 'doughnut',
  data: {
    labels: ['15', '20', '50', 'Otros'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',   // Para monto 15
        'rgba(75, 192, 192, 0.6)',    // Para monto 20
        'rgba(153, 102, 255, 0.6)',   // Para monto 50
        'rgba(201, 203, 207, 0.6)'    // Para otros
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(201, 203, 207, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  }
});

// Función para actualizar el gráfico de monto de donación
function updateDonationAmountChart() {
  let count15 = 0, count20 = 0, count50 = 0, countOthers = 0;
  
  donationData.forEach(d => {
    if (d.monto) {
      const monto = Number(d.monto);
      if (monto === 15) count15++;
      else if (monto === 20) count20++;
      else if (monto === 50) count50++;
      else countOthers++;
    }
  });
  
  donationAmountChart.data.datasets[0].data = [count15, count20, count50, countOthers];
  donationAmountChart.update();
}

// ---------------------
// OBSERVADORES EN TIEMPO REAL CON FIREBASE
// ---------------------
onSnapshot(collection(db, "usuarios"), snap => {
  donationData = snap.docs.map(doc => doc.data());
  renderDonations(donationData);
  updateChartData();
  updateDonationTypeChart();
  // Actualiza los nuevos gráficos (solo dependen de donationData)
  updateDonationTypeDonacionChart();
  updateDonationAmountChart();
});

onSnapshot(collection(db, "voluntariados"), snap => {
  volunteerData = snap.docs.map(doc => doc.data());
  renderVolunteers(volunteerData);
  updateChartData();
  updateDonationTypeChart();
  // Los nuevos gráficos no dependen de voluntariados, pero si deseas actualizarlos en conjunto, también puedes llamarlos aquí:
  updateDonationTypeDonacionChart();
  updateDonationAmountChart();
});

selDonaciones.addEventListener("change", () => renderDonations(donationData));
selVoluntariados.addEventListener("change", () => renderVolunteers(volunteerData));
