requireLogin();

// recipe.html?id=52772
const recipeId = new URLSearchParams(window.location.search).get("id") || "";

const content = document.querySelector("#recipe-content");
const errorBox = document.querySelector("#recipe-error");
const form = document.querySelector("#ratingForm");
const commentsList = document.querySelector("#commentsList");
const message = document.querySelector("#form-message");
const submitButton = form.querySelector("button[type='submit']");
const stars = document.querySelectorAll(".star");

let currentRating = 0;

// Everything from the API and from visitors goes in with textContent, never as HTML
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// --- Recipe ---

function metaItem(icon, text) {
  const item = element("span", "flex items-center");
  item.append(element("span", "material-icons mr-1", icon), text);
  return item;
}

function renderMeta(recipe) {
  const items = [];
  if (recipe.category) items.push(metaItem("category", recipe.category));
  if (recipe.area) items.push(metaItem("public", recipe.area));
  if (recipe.diet) items.push(metaItem("restaurant", recipe.diet));
  items.push(metaItem("star", recipe.rating ? `${recipe.rating.toFixed(1)} (${recipe.ratingCount})` : "No ratings yet"));
  document.querySelector("#meta").replaceChildren(...items);
}

function renderRecipe(recipe) {
  document.title = `${recipe.name} - Food Recipe`;
  document.querySelector("#title").textContent = recipe.name;
  if (recipe.image) document.querySelector("#hero-image").src = recipe.image;
  renderMeta(recipe);

  document.querySelector("#ingredients").replaceChildren(
    ...recipe.ingredients.map(({ item, amount }) => {
      const row = element("li", "flex justify-between py-2 soft-divider");
      row.append(element("span", "", item));
      if (amount) row.append(element("span", "ml-4 text-right", amount));
      return row;
    })
  );

  document.querySelector("#steps").replaceChildren(...recipe.steps.map((step) => element("li", "", step)));

  const links = [];
  if (recipe.youtube) links.push(["Watch the video", recipe.youtube]);
  if (recipe.source) links.push(["Original recipe", recipe.source]);
  document.querySelector("#links").replaceChildren(
    ...links.map(([label, url]) => {
      const link = element("a", "bg-orange-50 hover:bg-orange-100 text-yellow-700 rounded-full px-4 py-2", label);
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      return link;
    })
  );

  content.classList.remove("hidden");
}

function showNotFound(text) {
  document.title = "Recipe not found - Food Recipe";
  document.querySelector("#title").textContent = "Recipe not found";
  document.querySelector("#recipe-error-text").textContent = text;
  errorBox.classList.remove("hidden");
}

async function loadRecipe() {
  if (!/^\d+$/.test(recipeId)) return showNotFound("That recipe link is not valid.");

  try {
    const { ok, data } = await apiRequest(`/api/recipes/${recipeId}`);
    if (!ok) return showNotFound(data.error || "That recipe could not be loaded.");
    renderRecipe(data);
    loadComments();
  } catch (error) {
    showNotFound(error.message);
  }
}

// After a new comment, refresh the average rating shown in the header
async function refreshRating() {
  try {
    const { ok, data } = await apiRequest(`/api/recipes/${recipeId}`);
    if (ok) renderMeta(data);
  } catch (error) {
    // The comment is saved either way; the header will update on the next visit
  }
}

// --- Comments ---

function paintStars(rating) {
  stars.forEach((star, index) => {
    star.classList.toggle("text-yellow-500", index < rating);
    star.classList.toggle("text-gray-400", index >= rating);
  });
}

stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    currentRating = index + 1;
    paintStars(currentRating);
  });
});

function renderComment({ name, rating, comment, created_at }) {
  const card = element("div", "p-4 rounded-2xl bg-orange-50");

  const heading = element("p", "font-medium", `⭐ ${rating} - ${name}`);
  if (created_at) {
    const date = new Date(created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    heading.append(element("span", "text-xs text-gray-400 font-normal ml-2", date));
  }

  card.append(heading, element("p", "text-sm text-gray-600", comment));
  return card;
}

function showNoComments() {
  commentsList.replaceChildren(
    element("p", "text-sm text-gray-500", "No comments yet. Be the first to share how it turned out!")
  );
  commentsList.dataset.empty = "true";
}

async function loadComments() {
  try {
    const { ok, data } = await apiRequest(`/api/recipes/${recipeId}/comments`);
    if (!ok) throw new Error(data.error);
    if (!data.comments.length) return showNoComments();
    commentsList.replaceChildren(...data.comments.map(renderComment));
  } catch (error) {
    commentsList.replaceChildren(element("p", "text-sm text-gray-500", "Comments could not be loaded right now."));
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(message);

  if (currentRating === 0) {
    showMessage(message, "Please choose a star rating.");
    return;
  }

  setButtonLoading(submitButton, true, "Submitting...");
  try {
    const { ok, data } = await postJson(`/api/recipes/${recipeId}/comments`, {
      name: form.nameInput.value,
      rating: currentRating,
      comment: form.commentInput.value,
    });
    if (!ok) {
      showMessage(message, data.error || "Could not save your comment.");
      return;
    }
    if (commentsList.dataset.empty) {
      commentsList.replaceChildren();
      delete commentsList.dataset.empty;
    }
    commentsList.prepend(renderComment({ ...data, created_at: new Date() }));
    form.reset();
    currentRating = 0;
    paintStars(0);
    showMessage(message, "Thanks for your comment!", "success");
    refreshRating();
  } catch (error) {
    showMessage(message, error.message);
  } finally {
    setButtonLoading(submitButton, false);
  }
});

loadRecipe();
