// Importar Firebase y funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Configuración de Firebase (verifica que el API key y demás datos sean correctos)
const firebaseConfig = {
  apiKey: "AIzaSyALeFa7M2E0GjXuQnUN3eCUkyXKkFbr_0",
  authDomain: "donaciones-en-tiempo-real.firebaseapp.com",
  projectId: "donaciones-en-tiempo-real",
  storageBucket: "donaciones-en-tiempo-real.appspot.com",
  messagingSenderId: "542484805974",
  appId: "1:542484805974:web:39083c13e2840eb9077ef7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Elementos del DOM para modales y formularios (si existen en la página)
const modalDonacion = document.getElementById("modal-donacion");
const btnDonar = document.getElementById("btn-donar");
const closeDonacion = document.querySelector(".close-donacion");
const formDonacion = document.getElementById("form-donacion");

const modalVoluntariado = document.getElementById("modal-voluntariado");
const btnVoluntariado = document.getElementById("btn-voluntariado");
const closeVoluntariado = document.querySelector(".close-voluntariado");
const formVoluntariado = document.getElementById("form-voluntariado");

// Elementos del formulario de donación
const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const selectMoneda = document.getElementById("moneda");
const tipoDonacionRadios = document.getElementsByName("tipo_donacion");
const opcionesMontoDiv = document.getElementById("opciones-monto");
const montoRadios = document.getElementsByName("monto_opcion");
const divOtroMonto = document.getElementById("input-otro-monto");
const inputOtroMonto = document.getElementById("otro-monto");
const textareaMensaje = document.getElementById("mensaje");

// Elementos del formulario de login
const formLogin = document.getElementById("formulario_login");
const emailLogin = document.getElementById("email_login");
const passwordLogin = document.getElementById("password_login");
const togglePassword = document.getElementById("togglePassword");

// --- Configuración de modales y formularios (si existen en la página) ---

// Modal de donación
if (btnDonar && modalDonacion && closeDonacion && formDonacion) {
  btnDonar.addEventListener("click", () => {
    modalDonacion.style.display = "flex";
  });
  closeDonacion.addEventListener("click", () => {
    modalDonacion.style.display = "none";
  });

  // Mostrar opciones de monto al seleccionar tipo de donación
  tipoDonacionRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      opcionesMontoDiv.style.display = "block";
    });
  });

  // Mostrar u ocultar input "Otro" según selección
  montoRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "otro") {
        divOtroMonto.style.display = "block";
      } else {
        divOtroMonto.style.display = "none";
      }
    });
  });

  // Envío del formulario de donación
  formDonacion.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value;
    const email = inputEmail.value;
    const moneda = selectMoneda.value;
    let tipo = "";
    tipoDonacionRadios.forEach(radio => {
      if (radio.checked) {
        tipo = radio.value;
      }
    });
    let montoSeleccionado = "";
    montoRadios.forEach(radio => {
      if (radio.checked) {
        montoSeleccionado = radio.value;
      }
    });
    if (montoSeleccionado === "otro") {
      montoSeleccionado = inputOtroMonto.value;
    }
    const monto = Number(montoSeleccionado);
    const mensaje = textareaMensaje.value;

    try {
      await addDoc(collection(db, "usuarios"), {
        nombre,
        email,
        moneda,
        tipo,
        monto,
        mensaje,
        fecha: serverTimestamp()
      });
      formDonacion.reset();
      modalDonacion.style.display = "none";
      opcionesMontoDiv.style.display = "none";
      divOtroMonto.style.display = "none";
    } catch (error) {
      console.error("Error al guardar la donación:", error);
    }
  });
}

// Modal de voluntariado
if (btnVoluntariado && modalVoluntariado && closeVoluntariado && formVoluntariado) {
  btnVoluntariado.addEventListener("click", () => {
    modalVoluntariado.style.display = "flex";
  });
  closeVoluntariado.addEventListener("click", () => {
    modalVoluntariado.style.display = "none";
  });

  formVoluntariado.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "voluntariados"), {
        nombre: document.getElementById("nombre-voluntario").value,
        email: document.getElementById("email-voluntario").value,
        telefono: document.getElementById("telefono").value,
        habilidades: document.getElementById("habilidades").value,
        fecha: serverTimestamp()
      });
      formVoluntariado.reset();
      modalVoluntariado.style.display = "none";
    } catch (error) {
      console.error("Error al guardar el voluntariado:", error);
    }
  });
}

// Actualización de tabla y gráfico de donaciones
const tablaDonaciones = document.querySelector("#tabla-donaciones tbody");

function parseFecha(fecha) {
  return fecha && fecha.toDate ? fecha.toDate() : new Date(fecha || 0);
}

function formatearFecha(fecha) {
  return fecha
    ? new Date(fecha).toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "Sin fecha";
}

function actualizarGrafico(datos) {
  const canvas = document.getElementById("grafico-donaciones");
  if (!canvas) return; // Se ejecuta solo si existe el canvas
  let ctx = canvas.getContext("2d");
  let montos = datos.map(d => d.monto);
  let nombres = datos.map(d => d.nombre);
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: nombres,
      datasets: [
        {
          label: "Donaciones",
          data: montos,
          backgroundColor: "#ff9f00",
          borderColor: "#4b0082",
          borderWidth: 2
        }
      ]
    },
    options: {
      animation: { duration: 1500, easing: "easeInOutBounce" }
    }
  });
}

// Solo se actualiza si la tabla de donaciones existe en la página
if (tablaDonaciones) {
  onSnapshot(collection(db, "usuarios"), (snapshot) => {
    let datosDonaciones = [];
    tablaDonaciones.innerHTML = "";
    snapshot.forEach(doc => {
      let data = doc.data();
      datosDonaciones.push(data);
      let fila = `
        <tr>
          <td>${data.nombre}</td>
          <td>${data.email}</td>
          <td>${data.moneda}</td>
          <td>${data.tipo}</td>
          <td>${data.monto}</td>
          <td>${data.mensaje}</td>
          <td>${formatearFecha(parseFecha(data.fecha))}</td>
        </tr>`;
      tablaDonaciones.innerHTML += fila;
    });
    actualizarGrafico(datosDonaciones);
  });
}

function actualizarGraficoVoluntariado(voluntariados) {
  const canvas = document.getElementById("grafico-progresivo");
  if (!canvas) return; // Se ejecuta solo si existe el canvas
  let ctx = canvas.getContext("2d");
  let totalDonantes = tablaDonaciones
    ? document.querySelectorAll("#tabla-donaciones tbody tr").length
    : 0;
  let totalVoluntarios = voluntariados.length;
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Donantes", "Voluntarios"],
      datasets: [
        {
          label: "Comparación Donaciones vs Voluntariados",
          data: [totalDonantes, totalVoluntarios],
          backgroundColor: "#42a5f5",
          borderColor: "#1e88e5",
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      animation: { duration: 2000, easing: "easeInOutCubic" }
    }
  });
}

// Actualizar gráfico de voluntariados solo si existe el canvas correspondiente
if (document.getElementById("grafico-progresivo")) {
  onSnapshot(collection(db, "voluntariados"), (snapshot) => {
    let datosVoluntariados = [];
    snapshot.forEach(doc => {
      datosVoluntariados.push(doc.data());
    });
    actualizarGraficoVoluntariado(datosVoluntariados);
  });
}
