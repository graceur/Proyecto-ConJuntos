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

// Funciones de ayuda para parsear y formatear fechas (incluye hora)
const parseFecha = f => f?.toDate ? f.toDate().getTime() : new Date(f).getTime();
const formatDate = ts => new Date(ts).toLocaleString("es-ES", {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit"
});

// Renderiza la tabla de donaciones
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

// Renderiza la tabla de voluntariados
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

// Escucha en tiempo real para "usuarios" (donaciones)
onSnapshot(collection(db, "usuarios"), snap => {
  donationData = snap.docs.map(doc => doc.data());
  renderDonations(donationData);
});

// Escucha en tiempo real para "voluntariados"
onSnapshot(collection(db, "voluntariados"), snap => {
  volunteerData = snap.docs.map(doc => doc.data());
  renderVolunteers(volunteerData);
});

// Actualiza la tabla al cambiar el selector
selDonaciones.addEventListener("change", () => renderDonations(donationData));
selVoluntariados.addEventListener("change", () => renderVolunteers(volunteerData));
