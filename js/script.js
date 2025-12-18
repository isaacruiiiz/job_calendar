// Mostrar fecha actual en la cabecera
function showToday() {
  const d = new Date();
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  document.getElementById("dayName").textContent = diasSemana[d.getDay()];
  document.getElementById("dayDate").textContent = `${d.getDate()} ${meses[d.getMonth()]}`;
}

showToday();

// --- Manejo de días y formulario ---
const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
let horas = JSON.parse(localStorage.getItem("horas")) || {};
const formOverlay = document.getElementById("formOverlay");
let diaSeleccionado = null;

// Marcar el día actual (UX)
function resaltarDiaActual() {
  const hoyIndex = new Date().getDay(); // 0=Domingo, 1=Lunes...
  // Solo si es de Lunes (1) a Viernes (5)
  if (hoyIndex >= 1 && hoyIndex <= 5) {
    // Restamos 1 porque tu array 'dias' empieza en índice 0 para el Lunes
    const nombreDia = dias[hoyIndex - 1];
    const diaEl = document.querySelector(`.day[data-dia="${nombreDia}"]`);
    if (diaEl) diaEl.classList.add("today");
  }
}
resaltarDiaActual();

// Mostrar horas guardadas y actualizar estado visual
function actualizarVista() {
  dias.forEach(d => {
    const card = document.querySelector(`.day[data-dia="${d}"]`);
    const span = card.querySelector("span");
    
    // Texto de las horas
    const dataHora = horas[d];
    span.textContent = dataHora?.duracion || "--:--h";

    // UX: Marcar visualmente si tiene contenido guardado
    if (dataHora && dataHora.duracion !== "0:00h") {
      card.setAttribute("data-has-content", "true");
    } else {
      card.removeAttribute("data-has-content");
    }
  });

  const total = Object.values(horas)
    .reduce((acc, h) => acc + (h.totalHoras || 0), 0);
  
  // UX: Limitar decimales
  document.getElementById("totalHoras").textContent = `${total.toFixed(2)}h`;
}
actualizarVista();

// Abrir formulario
document.querySelectorAll(".day").forEach(dayEl => {
  dayEl.addEventListener("click", () => {
    diaSeleccionado = dayEl.dataset.dia;
    formOverlay.classList.add("active");

    const data = horas[diaSeleccionado];
    document.getElementById("inicio").value = data?.inicio || "";
    document.getElementById("salida").value = data?.salida || "";
    document.getElementById("descanso").value = data?.descanso || "";
  });
});

document.getElementById("closeForm").addEventListener("click", () => {
  formOverlay.classList.remove("active");
});

// Guardar datos
document.getElementById("confirm").addEventListener("click", () => {
  const inicio = document.getElementById("inicio").value;
  const salida = document.getElementById("salida").value;
  const descanso = parseInt(document.getElementById("descanso").value) || 0;

  if (!inicio || !salida) return alert("Completa las horas");

  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = salida.split(":").map(Number);
  let totalMin = (h2 * 60 + m2) - (h1 * 60 + m1) - descanso;

  if (totalMin < 0) totalMin += 24 * 60;

  const horasTrab = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  const texto = `${horasTrab}:${minutos.toString().padStart(2, "0")}h`;

  horas[diaSeleccionado] = {
    inicio, 
    salida, 
    descanso, 
    duracion: texto, 
    totalHoras: horasTrab + minutos / 60
  };
  
  localStorage.setItem("horas", JSON.stringify(horas));

  // UX: Feedback visual (Flash verde)
  const card = document.querySelector(`.day[data-dia="${diaSeleccionado}"]`);
  if(card) {
      card.classList.add("saved-flash");
      setTimeout(() => card.classList.remove("saved-flash"), 500);
  }

  formOverlay.classList.remove("active");
  actualizarVista();
});

// Reset
document.getElementById("reset").addEventListener("click", () => {
  if (confirm("¿Borrar todos los datos?")) {
    horas = {};
    localStorage.removeItem("horas");
    
    // Limpiar atributos visuales también
    document.querySelectorAll(".day").forEach(day => {
        day.removeAttribute("data-has-content");
    });
    
    actualizarVista();
  }
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.log('Error SW:', err));
}
