const dateObj = new Date();
document.getElementById("date").innerText = dateObj.toISOString().slice(0, 10);

let lines = 1;
const editor = document.getElementById("editor");
editor.addEventListener("keydown", keydown);
addNewLine(editor, lines);

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
            document.getElementById("max-lines").style.display = "block";
        }
    }
}

function clearClicked() {
    document.getElementById("max-lines").style.display = "none";
    
    const clear = setInterval(() => {
        editor.querySelector(`div:nth-of-type(${lines})`).style.display = "none";
        lines--;
        if (lines == 0) {
            clearInterval(clear);
            document.getElementById("thanks").style.display = "block";
        }
    }, 100);
}

function saveClicked() {
    // TODO
}

function downloadClicked() {
    const text = Array.from(editor.querySelectorAll("input")).map(x => x.value + "\n");
    const blob = new Blob(text, { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const p = document.getElementById("download-link")

    p.insertAdjacentHTML(
        "beforeend",
        `<a href="${url}" download="muse-${date.innerText}.txt">
        muse-${date.innerText}.txt
        </a>`
    );
    p.style.display = "block";
    p.querySelector("a").click();
}

function addNewLine(el, line) {
    el.insertAdjacentHTML(
        "beforeend",
        `<div class="input-container">
            <label for="${line}">${line.toString().padStart(2, '0')}.</label>
            <input type="text" id="${line}" />
        </div>`
    );
    document.getElementById(lines).focus();
}
