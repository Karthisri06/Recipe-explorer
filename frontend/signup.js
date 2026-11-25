redirectIfSignedIn();

const MIN_PASSWORD_LENGTH = 6;

const form = document.querySelector("#signup-form");
const message = document.querySelector("#form-message");
const matchMessage = document.querySelector("#match-message");
const submitButton = form.querySelector("button[type='submit']");

// Live password match indicator
function updateMatchMessage() {
  if (!form.confirmPassword.value) {
    matchMessage.textContent = "";
    return;
  }
  const matches = form.password.value === form.confirmPassword.value;
  matchMessage.textContent = matches ? "Passwords match" : "Passwords do not match";
  matchMessage.style.color = matches ? "#16a34a" : "#dc2626";
}

form.password.addEventListener("input", updateMatchMessage);
form.confirmPassword.addEventListener("input", updateMatchMessage);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(message);

  const email = form.email.value.trim();
  const password = form.password.value;

  if (password.length < MIN_PASSWORD_LENGTH) {
    showMessage(message, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    return;
  }
  if (password !== form.confirmPassword.value) {
    showMessage(message, "Passwords do not match.");
    return;
  }

  setButtonLoading(submitButton, true, "Creating account...");
  try {
    const { ok, data } = await postJson("/api/auth/signup", { email, password });
    if (!ok) {
      showMessage(message, data.error || "Sign-up failed. Please try again.");
      return;
    }
    window.location.href = "index.html?registered=1";
  } catch (error) {
    showMessage(message, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
});
