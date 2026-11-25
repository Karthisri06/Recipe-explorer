redirectIfSignedIn();

const form = document.querySelector("#signin-form");
const message = document.querySelector("#form-message");
const submitButton = form.querySelector("button[type='submit']");

if (new URLSearchParams(window.location.search).get("registered")) {
  showMessage(message, "Account created! Please sign in.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(message);

  const email = form.email.value.trim();
  const password = form.password.value;

  setButtonLoading(submitButton, true, "Signing in...");
  try {
    const { ok, data } = await postJson("/api/auth/signin", { email, password });
    if (!ok) {
      showMessage(message, data.error || "Sign-in failed. Please try again.");
      return;
    }
    setUser(data.email);
    window.location.href = "recipes.html";
  } catch (error) {
    showMessage(message, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
});
