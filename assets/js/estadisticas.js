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

// Obtén el contexto del canvas para Chart.js (asegúrate de que el canvas con id "barChart" exista en el HTML)
const ctx = document.getElementById('barChart').getContext('2d');

// Define los labels de los meses de interés
const monthLabels = ["Noviembre 2024", "Diciembre 2024", "Enero 2025", "Febrero 2025"];

// Crea el gráfico de barras con dos datasets: uno para donaciones y otro para voluntariados
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

// Función para actualizar el gráfico de barras agrupando los datos por mes
function updateChartData() {
  // Inicializamos los contadores para cada mes: [Noviembre 2024, Diciembre 2024, Enero 2025, Febrero 2025]
  const donationCounts = [0, 0, 0, 0];
  const volunteerCounts = [0, 0, 0, 0];

  // Recorremos los datos de donaciones
  donationData.forEach(d => {
    const dateObj = new Date(parseFecha(d.fecha));
    const month = dateObj.getMonth(); // Enero: 0, Febrero: 1, ..., Noviembre: 10, Diciembre: 11
    const year = dateObj.getFullYear();

    if (year === 2024 && month === 10) donationCounts[0]++;      // Noviembre 2024
    else if (year === 2024 && month === 11) donationCounts[1]++;     // Diciembre 2024
    else if (year === 2025 && month === 0) donationCounts[2]++;      // Enero 2025
    else if (year === 2025 && month === 1) donationCounts[3]++;      // Febrero 2025
  });

  // Recorremos los datos de voluntariados
  volunteerData.forEach(v => {
    const dateObj = new Date(parseFecha(v.fecha));
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    if (year === 2024 && month === 10) volunteerCounts[0]++;
    else if (year === 2024 && month === 11) volunteerCounts[1]++;
    else if (year === 2025 && month === 0) volunteerCounts[2]++;
    else if (year === 2025 && month === 1) volunteerCounts[3]++;
  });

  // Actualizamos los datasets del gráfico de barras
  barChart.data.datasets[0].data = donationCounts;
  barChart.data.datasets[1].data = volunteerCounts;
  barChart.update();
}

// ---------------------
// GRÁFICO CIRCULAR (DOUGHNUT) DE TIPO DE APORTE
// ---------------------

// Obtén el contexto del canvas para el gráfico circular (asegúrate de que el canvas con id "donationTypeChart" exista en el HTML)
const donationTypeCtx = document.getElementById('donationTypeChart').getContext('2d');

// Crea el gráfico circular (doughnut)
const donationTypeChart = new Chart(donationTypeCtx, {
  type: 'doughnut',
  data: {
    labels: ['Donaciones', 'Voluntariados'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Función para actualizar el gráfico circular
function updateDonationTypeChart() {
  // Se cuentan los registros de cada colección
  const countDonations = donationData.length;
  const countVolunteers = volunteerData.length;
  
  // Se asignan los valores al dataset
  donationTypeChart.data.datasets[0].data = [countDonations, countVolunteers];
  donationTypeChart.update();
}

// ---------------------
// OBSERVADORES EN TIEMPO REAL CON FIREBASE
// ---------------------

// Observa en tiempo real la colección de donaciones ("usuarios")
onSnapshot(collection(db, "usuarios"), snap => {
  donationData = snap.docs.map(doc => doc.data());
  renderDonations(donationData);
  updateChartData();         // Actualiza el gráfico de barras
  updateDonationTypeChart(); // Actualiza el gráfico circular
});

// Observa en tiempo real la colección de voluntariados
onSnapshot(collection(db, "voluntariados"), snap => {
  volunteerData = snap.docs.map(doc => doc.data());
  renderVolunteers(volunteerData);
  updateChartData();         // Actualiza el gráfico de barras
  updateDonationTypeChart(); // Actualiza el gráfico circular
});

// Actualiza la tabla al cambiar el selector
selDonaciones.addEventListener("change", () => renderDonations(donationData));
selVoluntariados.addEventListener("change", () => renderVolunteers(volunteerData));
