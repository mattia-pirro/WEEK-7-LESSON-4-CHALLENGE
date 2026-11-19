import { Libro } from "./classi.js";
import { libri, salvaLibri, renderLibri } from "./aggiungi.js";

const spinner = document.getElementById("spinner");
const spinnerText = document.getElementById("spinner-text");
const boxErrore = document.getElementById("errore");
const risultati = document.getElementById("risultati");
const searchBar = document.getElementById("cerca");
let controller;
let timeoutId;

function mostraSpinner() {
  spinner.hidden = false;
  spinnerText.hidden = false;
  boxErrore.hidden = true;
}
function nascondiSpinner() {
  spinner.hidden = true;
  spinnerText.hidden = true;
}
function mostraErrore(msg) {
  boxErrore.textContent = "Errore: " + msg;
  boxErrore.hidden = false;
}

async function getJSON(url, opzioni) {
  const response = await fetch(url, opzioni);
  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }
  return response.json();
}

async function cerca(query) {
  localStorage.setItem("lastQuery", query);

  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const signal = controller.signal;

  mostraSpinner();

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", 10);

  try {
    const dati = await getJSON(url, { signal });
    renderRisultati(dati.docs);
  } catch (err) {
    if (err.name === "AbortError") {
      return;
    }
    risultati.replaceChildren();
    mostraErrore(err.message);
  } finally {
    if (!signal.aborted) {
      nascondiSpinner();
    }
  }
}

function renderRisultati(docs) {
  const filtrati = docs.filter((d) => d.author_name);

  if (filtrati.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "Nessun risultato.";
    risultati.replaceChildren(emptyLi);
    return;
  }

  const righe = filtrati.map((d) => {
    const autore = d.author_name[0];

    let anno = d.first_publish_year;
    if (!anno) {
      anno = "?";
    }

    const li = document.createElement("li");
    li.className =
      "libro d-flex flex-column flex-sm-row justify-content-between align-items-center align-content-center gap-3 bg-white rounded shadow-sm p-3";

    const info = document.createElement("div");
    info.className =
      "info d-flex flex-column justify-content-center align-items-center justify-content-sm-start align-items-sm-start gap-1";

    const titolo = document.createElement("span");
    titolo.className = "fw-bold fs-6 text-center text-sm-start";
    titolo.textContent = d.title;

    const meta = document.createElement("p");
    meta.className = "meta fs-6 text-muted m-0";
    meta.textContent = `${autore} - ${anno}`;

    info.appendChild(titolo);
    info.appendChild(meta);

    const azioni = document.createElement("div");
    azioni.className =
      "azioni d-flex align-items-center gap-2 justify-content-center";

    const bottone = document.createElement("button");
    bottone.type = "button";
    bottone.className = "aggiungi-libro btn btn-sm btn-outline-success";
    bottone.dataset.titolo = d.title;
    bottone.dataset.autore = autore;
    bottone.dataset.anno = anno;
    bottone.textContent = "Aggiungi";

    const giaPresente = libri.find(
      (l) => l.titolo === d.title && l.autore === autore,
    );

    if (giaPresente) {
      bottone.textContent = "✓ Aggiunto";
      bottone.className = "aggiungi-libro btn btn-sm btn-outline-secondary";
      bottone.disabled = true;
      li.classList.add("letto");
    }

    const btnDettagli = document.createElement("button");
    btnDettagli.type = "button";
    btnDettagli.className = "btn btn-sm btn-outline-dark";
    btnDettagli.textContent = "Dettagli";

    btnDettagli.addEventListener("click", function () {
      fetch(`https://openlibrary.org${d.key}.json`)
        .then(function (r) {
          if (!r.ok) {
            throw new Error(`HTTP ${r.status} Error`);
          }
          return r.json();
        })

        .then(function (data) {
          let descrizione;

          if (typeof data.description === "string") {
            descrizione = data.description;
          } else if (data.description) {
            descrizione = data.description.value;
          }

          if (descrizione) {
            alert(descrizione);
          } else {
            alert("Nessuna descrizione");
          }
        })

        .catch(function (err) {
          mostraErrore(err.message);
        });
    });

    azioni.appendChild(bottone);
    azioni.appendChild(btnDettagli);
    li.appendChild(info);
    li.appendChild(azioni);

    return li;
  });

  risultati.replaceChildren(...righe);
}

searchBar.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  clearTimeout(timeoutId);

  if (query.length < 3) {
    localStorage.removeItem("lastQuery");
    if (controller) {
      controller.abort();
    }
    nascondiSpinner();
    boxErrore.hidden = true;
    risultati.textContent = "";
    return;
  }

  timeoutId = setTimeout(function () {
    cerca(query);
  }, 400);
});

risultati.addEventListener("click", (e) => {
  const bottone = e.target.closest("button[data-titolo]");
  if (!bottone) {
    return;
  }

  const titolo = bottone.dataset.titolo;
  const autore = bottone.dataset.autore;
  const anno = bottone.dataset.anno;
  libri.push(new Libro(titolo, autore, Number(anno) || null));
  salvaLibri();
  renderLibri();
  bottone.textContent = "✓ Aggiunto";
  bottone.className = "aggiungi-libro btn btn-sm btn-outline-secondary";
  bottone.disabled = true;
  bottone.closest("li").classList.add("letto");
});

const salvata = localStorage.getItem("lastQuery");
if (salvata) {
  document.querySelector("#cerca").value = salvata;
  cerca(salvata);
}
