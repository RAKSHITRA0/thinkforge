const editor = document.getElementById("editor");
const titleInput = document.getElementById("pageTitle");
const pageList = document.getElementById("pageList");
const newPageBtn = document.getElementById("newPageBtn");
const saveStatus = document.getElementById("saveStatus");
const exportBtn = document.getElementById("exportBtn");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const searchInput = document.getElementById("searchInput");
const exportAllBtn = document.getElementById("exportAllBtn");
const importAllBtn = document.getElementById("importAllBtn");
const importFile = document.getElementById("importFile");

let currentPageId = null;

function loadPages(filter = "") {
  pageList.innerHTML = "";
  const pages = getPages();
  for (let id in pages) {
    const title = pages[id].title || "Untitled";
    if (title.toLowerCase().includes(filter.toLowerCase())) {
      const li = document.createElement("li");
      li.textContent = title;
      li.onclick = () => loadPage(id);
      if (id === currentPageId) li.classList.add("active");
      pageList.appendChild(li);
    }
  }
}

function getPages() {
  return JSON.parse(localStorage.getItem("pages") || "{}");
}

function savePages(pages) {
  localStorage.setItem("pages", JSON.stringify(pages));
}

function saveCurrentPage() {
  if (!currentPageId) return;
  const pages = getPages();
  pages[currentPageId] = {
    title: titleInput.value || "Untitled",
    content: editor.innerHTML
  };
  savePages(pages);
  saveStatus.textContent = "Saving...";
  setTimeout(() => saveStatus.textContent = "Saved", 500);
  loadPages(searchInput.value);
}

function loadPage(id) {
  saveCurrentPage();
  const pages = getPages();
  const page = pages[id];
  if (page) {
    currentPageId = id;
    titleInput.value = page.title;
    editor.innerHTML = page.content;
    loadPages(searchInput.value);
  }
}

function createNewPage() {
  saveCurrentPage();
  const id = Date.now().toString();
  const pages = getPages();
  pages[id] = { title: "Untitled", content: "" };
  savePages(pages);
  currentPageId = id;
  titleInput.value = "Untitled";
  editor.innerHTML = "";
  loadPages(searchInput.value);
}

function exportCurrentPage() {
  if (!currentPageId) return;
  const pages = getPages();
  const page = pages[currentPageId];
  const blob = new Blob([page.content.replace(/<[^>]*>/g, "")], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (page.title || "Untitled") + ".md";
  a.click();
}

function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function exportAll() {
  const blob = new Blob([JSON.stringify(getPages())], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pages_backup.json";
  a.click();
}

function importAll(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      savePages(imported);
      loadPages();
      alert("Imported successfully!");
    } catch (err) {
      alert("Import failed: Invalid file");
    }
  };
  reader.readAsText(file);
}

titleInput.addEventListener("input", saveCurrentPage);
editor.addEventListener("input", saveCurrentPage);
newPageBtn.addEventListener("click", createNewPage);
exportBtn.addEventListener("click", exportCurrentPage);
toggleDarkMode.addEventListener("click", toggleDark);
searchInput.addEventListener("input", e => loadPages(e.target.value));
exportAllBtn.addEventListener("click", exportAll);
importAllBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", importAll);

(function init() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark");
  const pages = getPages();
  if (Object.keys(pages).length === 0) {
    createNewPage();
  } else {
    loadPage(Object.keys(pages)[0]);
  }
})();
