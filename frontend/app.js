// Shared helpers used by every page.

const API_BASE = "http://localhost:3001";
const SESSION_KEY = "recipeExplorerUser";

// --- Signed-in state (kept in the browser only; this is not real security) ---

function getUser() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch (error) {
    return null;
  }
}

function setUser(email) {
  try {
    localStorage.setItem(SESSION_KEY, email);
  } catch (error) {
    // Storage unavailable (e.g. private mode); the user will just have to sign in again
  }
}

function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    // Nothing to clear
  }
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser()) {
    window.location.replace("index.html");
  }
}

function redirectIfSignedIn() {
  if (getUser()) {
    window.location.replace("recipes.html");
  }
}

function setupSignOutButtons() {
  document.querySelectorAll("[data-signout]").forEach((button) => {
    button.addEventListener("click", signOut);
  });
}

// --- API ---

async function apiRequest(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    throw new Error("Cannot reach the server. Please make sure the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

function postJson(path, body) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- Form helpers ---

function showMessage(element, text, type = "error") {
  element.textContent = text;
  element.className =
    "text-sm rounded-2xl px-4 py-2 " + (type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700");
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "hidden";
}

function setButtonLoading(button, loading, loadingText) {
  if (loading) {
    button.dataset.label = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add("opacity-70", "cursor-not-allowed");
  } else {
    button.textContent = button.dataset.label;
    button.disabled = false;
    button.classList.remove("opacity-70", "cursor-not-allowed");
  }
}

// Adds a show/hide eye button to every <input data-toggle-password>
const EYE_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
  '<path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
  '<path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 5.1A9.9 9.9 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6A16.6 16.6 0 002 12s3.5 7 10 7a9.7 9.7 0 004.4-1M9.9 9.9a3 3 0 004.2 4.2"/></svg>';

function setupPasswordToggles() {
  document.querySelectorAll("input[data-toggle-password]").forEach((input) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.style.paddingRight = "2.5rem";

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Show password");
    button.style.cssText =
      "position:absolute;top:50%;right:10px;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b7280;line-height:0;";
    button.innerHTML = EYE_OPEN;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.innerHTML = show ? EYE_CLOSED : EYE_OPEN;
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
    wrapper.appendChild(button);
  });
}

// Fills every [data-avatar] with the first letter of the signed-in email
function setupAvatars() {
  const email = getUser();
  document.querySelectorAll("[data-avatar]").forEach((avatar) => {
    avatar.textContent = email ? email.charAt(0) : "?";
    if (email) avatar.title = email;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();
  setupSignOutButtons();
  setupAvatars();
});
