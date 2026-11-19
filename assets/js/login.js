import { renderLibri } from "./aggiungi.js";

const authBox = document.getElementById("auth-box");
const divProfile = document.getElementById("profilo");
const sectionProfile = document.getElementById("profilo-section");

function getToken() {
  return localStorage.getItem("auth.token");
}

function getUtente() {
  return JSON.parse(localStorage.getItem("auth.user") ?? "null");
}

export function logout() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.user");
  if (sectionProfile) {
    sectionProfile.hidden = true;
  }
  if (divProfile) {
    divProfile.replaceChildren();
  }
  renderAuthBox();
}

async function login(username, password) {
  const r = await fetch("https://dummyjson.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!r.ok) {
    throw new Error("Credenziali non valide");
  }

  const dati = await r.json();
  localStorage.setItem("auth.token", dati.accessToken);
  localStorage.setItem("auth.user", JSON.stringify(dati));
  return dati;
}

async function caricaProfilo() {
  const token = getToken();
  if (!token) {
    return null;
  }

  const r = await fetch("https://dummyjson.com/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) {
    const err = new Error("Impossibile caricare il profilo");
    err.status = r.status;
    throw err;
  }

  return await r.json();
}

function renderAuthBox() {
  const utente = getUtente();

  if (!authBox) {
    return;
  }

  if (utente) {
    const saluto = document.createElement("span");
    saluto.className = "saluto text-white fw-bold fs-5 m-0";
    saluto.textContent = `Ciao ${utente.firstName}`;

    const esci = document.createElement("button");
    esci.type = "button";
    esci.className = "btn btn-sm btn-danger fw-bold fs-6 py-1 px-3";
    esci.textContent = "Esci";

    esci.addEventListener("click", () => {
      logout();
    });

    authBox.replaceChildren(saluto, esci);
  } else {
    const form = document.createElement("form");
    form.id = "form-login";
    form.className =
      "form d-flex flex-column flex-md-row justify-content-center align-content-center gap-2";

    const username = document.createElement("input");
    username.className = "form-control";
    username.type = "text";
    username.id = "username";
    username.name = "username";
    username.value = "emilys";
    username.required = true;

    const password = document.createElement("input");
    password.className = "form-control";
    password.type = "password";
    password.id = "password";
    password.name = "password";
    password.value = "emilyspass";
    password.required = true;

    const accedi = document.createElement("button");
    accedi.type = "submit";
    accedi.className = "accedi btn btn-success";
    accedi.textContent = "Accedi";

    form.appendChild(username);
    form.appendChild(password);
    form.appendChild(accedi);

    form.addEventListener("submit", (e) => {
      gestisciLogin(e);
    });

    authBox.replaceChildren(form);
  }
}

async function gestisciLogin(e) {
  e.preventDefault();
  const { username, password } = Object.fromEntries(new FormData(e.target));

  try {
    await login(username, password);
    renderAuthBox();
    await mostraProfilo();
  } catch (err) {
    alert(err.message);
  }
}

async function mostraProfilo() {
  if (!getToken() || !divProfile || !sectionProfile) {
    return;
  }

  try {
    const profilo = await caricaProfilo();

    if (!profilo) {
      return;
    }

    const imgContainer = document.createElement("div");
    imgContainer.className =
      "img-container d-flex justify-content-center align-items-center";

    const img = document.createElement("img");
    img.className = "image rounded-circle";
    img.src = "https://placehold.co/64x64/DDDDDD/111111";
    img.alt = "profile-image";

    imgContainer.appendChild(img);

    const info = document.createElement("div");
    info.className =
      "info d-flex flex-column justify-content-start align-items-start";

    const generalita = document.createElement("p");
    generalita.className = "fw-bold m-0";
    generalita.textContent = `${profilo.firstName} ${profilo.lastName}`;

    const userData = document.createElement("p");
    userData.className = "m-0";
    userData.textContent = `@${profilo.username} - ${profilo.email}`;

    info.appendChild(generalita);
    info.appendChild(userData);

    divProfile.replaceChildren(imgContainer, info);
    sectionProfile.hidden = false;
  } catch (error) {
    console.error(error);
  }
}

async function avvio() {
  renderLibri();
  renderAuthBox();
  await mostraProfilo();
}

avvio();
