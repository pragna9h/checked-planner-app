const addBtn = document.querySelector(".addBtn");
const downloadBtn = document.querySelector(".downloadBtn");
const pagesDiv = document.querySelector(".pages-container");
let pages = [];

async function createPage(pagesData) {
    try {
        const fetchPage = await fetch('page.html');
        const pageHTML = await fetchPage.text();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = pageHTML.trim();
        const pageElement = tempDiv.firstElementChild;

        const pageTitleEl = pageElement.querySelector(".page-title");
        const checklistBtn = pageElement.querySelector(".btn-checklist");
        const deleteBtn = pageElement.querySelector(".btn-delete");
        const textareaEl = pageElement.querySelector("textarea");

        const data = {
            id: pagesData?.id || Date.now(),
            title: pagesData?.title || "",
            content: pagesData?.content || ""
        };

        pageTitleEl.textContent = data.title;
        textareaEl.value = data.content;
        if (!data.content) {
            textareaEl.value = "☑ ";
        }

        pagesDiv.appendChild(pageElement);
        textareaEl.focus();

        checklistBtn.addEventListener("click", () => {
            textareaEl.value += "\n☑ ";
            textareaEl.focus();
            handleChange();
        });

        deleteBtn.addEventListener("click", () => {
            pageElement.remove();
            pages = pages.filter(p => p.id !== data.id);
            autoSave();
        });

        const handleChange = () => {
            data.title = pageTitleEl.textContent.trim();
            data.content = textareaEl.value;
            const existingIndex = pages.findIndex(p => p.id === data.id);
            if (existingIndex >= 0) pages[existingIndex] = data;
            else pages.push(data);
            autoSave();
        };

        pageTitleEl.addEventListener("input", handleChange);
        textareaEl.addEventListener("input", handleChange);

        textareaEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // prevent default new line behavior
                const { selectionStart, selectionEnd, value } = textareaEl;
                const insertText = "\n☑ ";
                textareaEl.value = value.slice(0, selectionStart) + insertText + value.slice(selectionEnd);

                // Move cursor after inserted text
                const newCursorPos = selectionStart + insertText.length;
                textareaEl.selectionStart = textareaEl.selectionEnd = newCursorPos;

                handleChange(); // save updated content
            }
        });

        

        if (!pages.some(p => p.id === data.id)) {
            pages.push(data);
        }

        autoSave();

    } catch (error) {
        console.error("Error loading page container: ", error);
    }

}


function autoSave() {
    localStorage.setItem("checked-app-pages", JSON.stringify(pages));
}

function loadNotes() {
    const savedPages = JSON.parse(localStorage.getItem("checked-app-pages") || "[]");
    pages = [];
    savedPages.forEach(page => createPage(page));
}

function downloadPages() {
    let allPagesOnApp = pages
        .map((p, i) => `Page ${i + 1}: ${p.title}\n${p.content}\n\n`)
        .join("");

    const blob = new Blob([allPagesOnApp], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Planner_pages.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Keyboard shortcut: Shift + P to create a new note
document.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault(); // prevent any browser zoom shortcut
        createPage(); // call your existing note creation function
    }
});

downloadBtn.addEventListener("click", downloadPages);
addBtn.addEventListener("click", createPage);
loadNotes();