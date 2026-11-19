import { Libro, LibroDigitale, LibroAudio } from "./classi.js";
import { libri, salvaLibri, renderLibri } from "./aggiungi.js";

const selectFormato = document.getElementById("formato");
const campoDimensione = document.getElementById("campo-dimensione");
const campoDurata = document.getElementById("campo-durata");
const formLibro = document.getElementById("aggiungi-libro");
const risultati = document.getElementById("risultati");

selectFormato.addEventListener("change", (e) => {
  campoDimensione.hidden = e.target.value !== "digitale";
  campoDurata.hidden = e.target.value !== "audio";
  document.getElementById("dimensione-mb").required =
    e.target.value === "digitale";
  document.getElementById("durata-minuti").required =
    e.target.value === "audio";
});

formLibro.addEventListener("submit", (e) => {
  e.preventDefault();
  const dati = Object.fromEntries(new FormData(e.target));
  const anno = Number(dati.anno) || null;
  let nuovo;

  if (dati.formato === "digitale") {
    nuovo = new LibroDigitale(
      dati.titolo,
      dati.autore,
      anno,
      Number(dati["dimensione-mb"]),
    );
  } else if (dati.formato === "audio") {
    nuovo = new LibroAudio(
      dati.titolo,
      dati.autore,
      anno,
      Number(dati["durata-minuti"]),
    );
  } else {
    nuovo = new Libro(dati.titolo, dati.autore, anno);
  }

  libri.push(nuovo);
  salvaLibri();
  renderLibri();

  risultati.querySelectorAll("button[data-titolo]").forEach((btn) => {
    if (
      btn.dataset.titolo === nuovo.titolo &&
      btn.dataset.autore === nuovo.autore
    ) {
      btn.textContent = "✓ Aggiunto";
      btn.className = "aggiungi-libro btn btn-sm btn-outline-secondary";
      btn.disabled = true;
      btn.closest("li").classList.add("letto");
    }
  });

  e.target.reset();
  campoDimensione.hidden = true;
  campoDurata.hidden = true;
  document.getElementById("dimensione-mb").required = false;
  document.getElementById("durata-minuti").required = false;
});
