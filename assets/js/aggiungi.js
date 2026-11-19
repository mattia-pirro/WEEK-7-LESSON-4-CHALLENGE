import { Libro, LibroDigitale, LibroAudio } from "./classi.js";

const STORAGE_KEY = "libri";

const listaLibri = document.getElementById("lista-libri");
const svuota = document.getElementById("svuota-tutto");
const esporta = document.getElementById("esporta-tutto");
const filtri = document.querySelectorAll(".filtri");
const ordinamento = document.getElementById("ordinamento");
const risultati = document.getElementById("risultati");
let categorySelected = "Tutti";
export let libri = caricaLibri();
let ordine = "";

export function renderLibri() {
  let libriFiltrati = [];

  if (categorySelected === "Tutti") {
    libriFiltrati = libri;
  } else if (categorySelected === "Letti") {
    libriFiltrati = libri.filter(function (libro) {
      return libro.letto === true;
    });
  } else if (categorySelected === "Da leggere") {
    libriFiltrati = libri.filter(function (libro) {
      return libro.letto === false;
    });
  }

  if (ordine === "Titolo") {
    libriFiltrati = libriFiltrati.toSorted((a, b) =>
      a.titolo.localeCompare(b.titolo, "it"),
    );
  } else if (ordine === "Anno") {
    libriFiltrati = libriFiltrati.toSorted(
      (a, b) => (a.anno ?? Infinity) - (b.anno ?? Infinity),
    );
  }

  const righe = libriFiltrati.map((l) => {
    const li = document.createElement("li");
    li.className =
      "libro d-flex flex-column flex-sm-row justify-content-between align-items-center align-content-center gap-3 bg-white rounded shadow-sm p-3";
    if (l.letto) {
      li.classList.add("letto");
    }
    li.dataset.id = l.id;

    const info = document.createElement("div");
    info.className =
      "info d-flex flex-column justify-content-center align-items-center justify-content-sm-start align-items-sm-start";

    const divTitle = document.createElement("div");
    divTitle.className = "divTitle d-flex align-items-center gap-1";

    const titolo = document.createElement("span");
    titolo.className = "fw-bold fs-6 text-center text-sm-start w-75";
    titolo.textContent = l.titolo;

    const badge = document.createElement("span");
    badge.className = "badge rounded-pill bg-secondary-subtle text-secondary";
    badge.textContent = l.formato();

    const meta = document.createElement("p");
    meta.className = "meta fs-6 text-muted m-0";
    meta.textContent = `${l.autore} - ${l.anno ?? "?"}`;

    divTitle.appendChild(titolo);
    divTitle.appendChild(badge);
    info.appendChild(divTitle);
    info.appendChild(meta);

    const azioni = document.createElement("div");
    azioni.className =
      "azioni d-flex align-items-center gap-2 justify-content-center";

    if (l.letto) {
      const stato = document.createElement("span");
      stato.className = "text-success";
      stato.textContent = "✓ letto";
      azioni.appendChild(stato);
    } else {
      const bottone = document.createElement("button");
      bottone.type = "button";
      bottone.className = "segna-letto btn btn-sm btn-outline-dark";
      bottone.dataset.azione = "leggi";
      bottone.textContent = "Segna come letto";
      azioni.appendChild(bottone);
    }

    const rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.className = "btn btn-sm btn-outline-danger";
    rimuovi.dataset.azione = "rimuovi";
    rimuovi.textContent = "Rimuovi";

    azioni.append(rimuovi);
    li.appendChild(info);
    li.appendChild(azioni);

    return li;
  });

  listaLibri.replaceChildren(...righe);
  document.getElementById("contatore").textContent = libriFiltrati.length;
}

listaLibri.addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");

  if (!bottone) {
    return;
  }

  const id = bottone.closest("li").dataset.id;

  if (bottone.dataset.azione === "leggi") {
    const libro = libri.find((l) => l.id === id);
    libro.segnaComeLetto();
  } else if (bottone.dataset.azione === "rimuovi") {
    const rimosso = libri.find((l) => l.id === id);
    const index = libri.findIndex((l) => l.id === id);
    if (index !== -1) {
      libri.splice(index, 1);
    }

    const ancoraPresente = libri.find(
      (l) => l.titolo === rimosso.titolo && l.autore === rimosso.autore,
    );

    if (!ancoraPresente) {
      risultati.querySelectorAll("button[data-titolo]").forEach((btn) => {
        if (
          btn.dataset.titolo === rimosso.titolo &&
          btn.dataset.autore === rimosso.autore
        ) {
          btn.textContent = "Aggiungi";
          btn.className = "aggiungi-libro btn btn-sm btn-outline-success";
          btn.disabled = false;
          btn.closest("li").classList.remove("letto");
        }
      });
    }
  }

  salvaLibri();
  renderLibri();
});

svuota.addEventListener("click", () => {
  libri.length = 0;
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();

  risultati.querySelectorAll(".libro.letto").forEach((li) => {
    li.classList.remove("letto");
    const btn = li.querySelector("button[data-titolo]");
    btn.textContent = "Aggiungi";
    btn.className = "aggiungi-libro btn btn-sm btn-outline-success";
    btn.disabled = false;
  });
});

esporta.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(libri, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "libri.json";
  a.click();
  URL.revokeObjectURL(url);
});

filtri.forEach(function (button) {
  button.addEventListener("click", function () {
    filtri.forEach(function (btn) {
      btn.classList.remove("selected", "btn-dark");
      btn.classList.add("btn-outline-dark");
    });

    button.classList.add("selected", "btn-dark");
    button.classList.remove("btn-outline-dark");

    categorySelected = button.textContent.trim();
    renderLibri();
  });
});

ordinamento.addEventListener("change", (e) => {
  ordine = e.target.value;
  renderLibri();
});

export function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

export function caricaLibri() {
  const datiJSON = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

  return datiJSON.map((d) => {
    if (d.dimensioneMb !== undefined) {
      return LibroDigitale.fromJSON(d);
    } else if (d.durataMinuti !== undefined) {
      return LibroAudio.fromJSON(d);
    } else {
      return Libro.fromJSON(d);
    }
  });
}
