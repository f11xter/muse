import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, startAfter, startAt } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { auth, db } from "/muse/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    displayHistory(false);
  }
  else {
    window.location.href = "/muse/login?redirect=true";
  }
});

/** Array of first documents returned by queries */
const firstDocs = [];
/** Last doc returned by current query */
let lastDoc;

const buttonContainer = document.getElementById("pagination-button-container");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const loading = document.getElementById("loading");

prevButton.addEventListener("click", () => displayHistory(false));
nextButton.addEventListener("click", () => displayHistory(true));

/**
 * Fetch and display history
 * 
 * Limits to 10 entries ordered by descending time
 * @param {boolean} next true if should load next set of 10, false if should load previous or initial
 */
async function displayHistory(next) {
  // hide pagination buttons
  prevButton.classList.add("hidden");
  nextButton.classList.add("hidden");

  // hide current items
  for (const node of document.querySelectorAll(".history-item")) {
    node.classList.add("hidden");
  }

  // show loading message
  loading.classList.remove("hidden");

  // fetch data
  const querySnapshot = await getDocs(getQuery(next));

  // hide loading message
  loading.classList.add("hidden");

  // if no data
  if (querySnapshot.empty) {
    // if no muses in db show empty message
    if (firstDocs.length === 0) {
      document.getElementById("empty").classList.remove("hidden");
    }

    // otherwise show previous page and previous pagination button
    // assume reached beginning of history
    else {
      prevButton.classList.remove("hidden");
      for (const node of document.querySelectorAll(".history-item")) {
        node.classList.remove("hidden");
      }
    }
  }

  else {
    // delete current items
    for (const node of document.querySelectorAll(".history-item")) {
      node.remove();
    }

    // show relevant pagination buttons
    if (firstDocs.length > 0) {
      prevButton.classList.remove("hidden");
    }
    if (querySnapshot.docs.length === 10) {
      nextButton.classList.remove("hidden");
    }

    // update pagination cursors
    firstDocs.push(querySnapshot.docs[0]);
    lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    // process items
    querySnapshot.forEach((d) => {
      const data = d.data();

      let title = data.timestamp.toDate().toISOString().slice(0, 10);
      if (data.name) {
        title += " ~ " + data.name;
      }

      addHistoryItem(d.id, title, data.text[0]);

      document.querySelector(`div[data-id="${d.id}"] button`).addEventListener("click", () => deleteClicked(d.id, title));
    });
  }
}

function addHistoryItem(id, title, preview) {
  const link = document.createElement("a");
  link.href = `/muse/history/muse?id=${id}`;
  link.textContent = title;

  const p = document.createElement("p");
  p.textContent = preview + " ...";

  const text = document.createElement("div");
  text.appendChild(link);
  text.appendChild(p);

  const icon = document.createElement("i");
  icon.classList.add("iconoir-trash");
  icon.style.color = "var(--error)";

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("button", "icon-label");
  button.appendChild(icon);

  const historyItem = document.createElement("div");
  historyItem.setAttribute("data-id", id);
  historyItem.classList.add("history-item");
  historyItem.appendChild(text);
  historyItem.appendChild(button);

  document.querySelector("main").insertBefore(historyItem, buttonContainer);
}

async function deleteClicked(id, title) {
  if (confirm(`Delete "${title}" permanently?`)) {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "muses", id));
    document.querySelector(`div[data-id="${id}"]`).remove();

    // show empty message if delete only muse
    if (document.getElementsByClassName("history-item").length === 0) {
      document.getElementById("empty").classList.remove("hidden");
    }
  }
}

function getQuery(next) {
  if (next) {
    return query(collection(db, "users", auth.currentUser.uid, "muses"), orderBy("timestamp", "desc"), startAfter(lastDoc), limit(10));
  }

  // remove current query first doc
  firstDocs.pop();
  // get previous query's first doc
  const first = firstDocs.pop();

  if (first) {
    return query(collection(db, "users", auth.currentUser.uid, "muses"), orderBy("timestamp", "desc"), startAt(first), limit(10));
  }
  else {
    return query(collection(db, "users", auth.currentUser.uid, "muses"), orderBy("timestamp", "desc"), limit(10));
  }
}