import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js'
import { auth, db } from "/muse/firebase.js";

const params = new URLSearchParams(document.location.search);
const id = params.get("id");

onAuthStateChanged(auth, (user) => {
  if (user) {
    displayMuse();
  }
  else {
    window.location.href = "/muse/login?redirect=true";
  }
});

const h2 = document.getElementById("title");
const tilde = document.getElementById("tilde");
const name = document.getElementById("name");

const edit = document.getElementById("edit");
const cancel = document.getElementById("cancel");
const confirm = document.getElementById("confirm");

async function displayMuse() {
  const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid, "muses", id));

  if (docSnap.exists()) {
    const data = docSnap.data();

    const title = data.timestamp.toDate().toISOString().slice(0, 10);

    h2.textContent = title;

    if (data.name) {
      name.textContent = data.name;
      tilde.textContent = " ~ ";
    }

    addMuseText(data.text);

    edit.addEventListener("click", editClicked);
    cancel.addEventListener("click", () => cancelClicked(data.name));
    confirm.addEventListener("click", () => confirmClicked(id, data.name));
    document.getElementById("download").addEventListener("click", () => downloadClicked(data.text, title));

    edit.classList.remove("hidden");
    document.getElementById("download").classList.remove("hidden");
  }

  else {
    document.querySelector("#title h2").textContent = "Error";
    document.getElementById("error").classList.remove("hidden")
  }
}

function addMuseText(content) {
  let lines = 0;

  for (const text of content) {
    lines++;

    const lineNumber = document.createElement("span");
    lineNumber.textContent = lines.toString().padStart(2, "0") + ". ";

    const p = document.createElement("p");
    p.appendChild(lineNumber);
    p.appendChild(document.createTextNode(text));

    document.getElementById("text").appendChild(p);
  }
}

function editClicked() {
  edit.classList.add("hidden");
  cancel.classList.remove("hidden");
  confirm.classList.remove("hidden");

  tilde.textContent = " ~ ";
  name.contentEditable = true;
  name.focus();
}

function cancelClicked(currentName) {
  edit.classList.remove("hidden");
  cancel.classList.add("hidden");
  confirm.classList.add("hidden");

  name.contentEditable = false;
  name.textContent = currentName;

  if (name.textContent === "") {
    tilde.textContent = "";
  }
}

async function confirmClicked(currentName) {
  if (name.textContent !== currentName) {
    cancelClicked(name.textContent);

    await updateDoc(doc(db, "users", auth.currentUser.uid, "muses", id), { name: name.textContent });
  }

  else {
    cancelClicked(currentName);
  }
}

function downloadClicked(text, title) {
  const exportText = text.map(x => x + "\n");
  const blob = new Blob(exportText, { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.textContent = a.download = "muse-" + title + ".txt";

  const p = document.getElementById("download-link")
  p.appendChild(a);
  p.classList.remove("hidden");

  p.querySelector("a").click();
}