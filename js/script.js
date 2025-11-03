// Mostrar fecha actual
function showToday() {
    const d = new Date();
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
    document.getElementById("dayName").textContent = dias[d.getDay()];
    document.getElementById("dayDate").textContent = `${d.getDate()} ${meses[d.getMonth()]}`;
  }
  
  showToday();
  
  // --- Manejo de días y formulario ---
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  let horas = JSON.parse(localStorage.getItem("horas")) || {};
  const formOverlay = document.getElementById("formOverlay");
  let diaSeleccionado = null;
  
  // Mostrar horas guardadas
  function actualizarVista() {
    dias.forEach(d => {
      const el = document.querySelector(`.day[data-dia="${d}"] span`);
      el.textContent = horas[d]?.duracion || "--:--h";
    });
  
    const total = Object.values(horas)
      .reduce((acc, h) => acc + (h.totalHoras || 0), 0);
    document.getElementById("totalHoras").textContent = `${total}h`;
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
      inicio, salida, descanso, duracion: texto, totalHoras: horasTrab + minutos / 60
    };
    localStorage.setItem("horas", JSON.stringify(horas));
  
    formOverlay.classList.remove("active");
    actualizarVista();
  });
  
  // Reset
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("¿Borrar todos los datos?")) {
      horas = {};
      localStorage.removeItem("horas");
      actualizarVista();
    }
  });
  