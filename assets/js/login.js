 // Importar las funciones necesarias desde los CDN de Firebase
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
 import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
 
 // Configuración de Firebase
 const firebaseConfig = {
     apiKey: "AIzaSyAOxAwmfjsLwtDELJzcnoNR6fwKch2nC2M",
     authDomain: "ddgt-534d6.firebaseapp.com",
     projectId: "ddgt-534d6",
     storageBucket: "ddgt-534d6.appspot.com",
     messagingSenderId: "935224898843",
     appId: "1:935224898843:web:a3a3337ad5aef7666d4fbe",
     measurementId: "G-V46RZ288PS"
 };
 
 // Inicializar Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 

 
 // Manejo del inicio de sesión
 document.getElementById("formulario_login")?.addEventListener("submit", async (e) => {
     e.preventDefault();
     const email = document.getElementById("email_login").value;
     const password = document.getElementById("password_login").value;
 
     try {
         await signInWithEmailAndPassword(auth, email, password);
         window.location.href = '../../estadisticas.html';
        } catch (error) {
         console.error(error);
         alert("Error al iniciar sesión");
     }
 });
 
 
 // Manejo del estado de autenticación
 onAuthStateChanged(auth, user => {
     if (user) {
         localStorage.setItem("user", JSON.stringify(user)); // Guardar el usuario en el localStorage
         document.getElementById("displayName").innerText = user.displayName || user.email
         document.getElementById("fotoPerfil").src = user.photoURL || "user.jpg"; // Foto de perfil
     } else {
         localStorage.removeItem("user"); // Eliminar del localStorage si no hay usuario
     }
 });
 
 // Cerrar sesión
 document.getElementById("cerrarSesion")?.addEventListener("click", () => {
     signOut(auth).then(() => {
         localStorage.removeItem("user");
         window.location.href = 'index.html'; // Redirige a la página de inicio
     }).catch((error) => {
         console.error("Error al cerrar sesión: ", error);   
     })
     });
 
 
 