import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { auth, db } from "/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("nav-login").style.display = "none";
    document.getElementById("nav-account").style.display = "";
  }
  else {
    document.getElementById("nav-login").style.display = "";
    document.getElementById("nav-account").style.display = "none";
  }
});

document.getElementById("date").textContent = new Date().toISOString().slice(0, 10);

const msg = document.getElementById("msg");
const editor = document.getElementById("editor");

let lines = 1;
addNewLine(editor, lines);

editor.addEventListener("keydown", keydown);
document.getElementById("clear").addEventListener("click", clearClicked);
document.getElementById("save").addEventListener("click", saveClicked);
document.getElementById("download").addEventListener("click", downloadClicked);

function keydown(e) {
  if (e.key == "Enter") {
    document.getElementById(e.target.id).disabled = true;

    if (lines < 99) {
      lines++;
      addNewLine(editor, lines);
    } else {
      document.getElementById("max-lines").classList.remove("hidden");
    }
  }
}

function clearClicked() {
  msg.classList.add("hidden");
  document.getElementById("max-lines").classList.add("hidden");

  const clear = setInterval(() => {
    editor.querySelector(`div:nth-of-type(${lines})`).classList.add("hidden");
    lines--;
    if (lines == 0) {
      clearInterval(clear);
      document.getElementById("thanks").classList.remove("hidden");
    }
  }, 100);
}

async function saveClicked() {
  editor.querySelector(":last-child input").disabled = true;
  if (auth.currentUser) {
    const isToday = (input) => {
      const today = new Date();

      return (
        today.getUTCDate() === input.getUTCDate() &&
        today.getUTCMonth() === input.getUTCMonth() &&
        today.getUTCFullYear() === input.getUTCFullYear()
      )
    }

    const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));

    if (docSnap.get("lastMuse") && isToday(docSnap.get("lastMuse").toDate())) {
      msg.textContent = "Already mused today"
      msg.classList.remove("hidden");
    }

    else {
      const text = Array.from(editor.querySelectorAll("input")).map(x => x.value);
      await addDoc(
        collection(db, "users", auth.currentUser.uid, "muses"),
        {
          text: text,
          timestamp: serverTimestamp(),
        }
      );
      await setDoc(doc(db, "users", auth.currentUser.uid), { lastMuse: serverTimestamp() });

      msg.textContent = "Muse saved successfully";
      msg.classList.remove("hidden");
    }
  }

  else {
    window.location.href = "/login?redirect=true";
  }
}

function downloadClicked() {
  const text = Array.from(editor.querySelectorAll("input")).map(x => x.value + "\n");
  const blob = new Blob(text, { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.textContent = a.download = "muse-" + title + ".txt";

  const p = document.getElementById("download-link")
  p.appendChild(a);
  p.classList.remove("hidden");

  p.querySelector("a").click();
}

function addNewLine(el, line) {
  const label = document.createElement("label");
  label.for = line;
  label.textContent = line.toString().padStart(2, '0') + ".";

  const input = document.createElement("input");
  input.type = "text";
  input.id = line;

  const div = document.createElement("div");
  div.classList.add("input-container");
  div.append(label, input);

  el.appendChild(div);

  document.getElementById(line).focus();
}
