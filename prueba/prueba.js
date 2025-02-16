// Función para calcular la altura real de la ventana y asignarla a la variable --vh
function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  // Ejecutamos la función al cargar y también al cambiar el tamaño de la ventana
  setVh();
  window.addEventListener('resize', setVh);
  