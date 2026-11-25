requireLogin();

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 300;
const ACTIVE_CHIP = ["bg-yellow-600", "text-white", "border-yellow-600"];
const IDLE_CHIP = ["bg-orange-50", "text-gray-700", "border-orange-100", "hover:bg-orange-100"];

const searchInput = document.querySelector("#search");
const categoryBar = document.querySelector("#categories");
const grid = document.querySelector("#recipe-grid");
const resultCount = document.querySelector("#result-count");
const loading = document.querySelector("#loading");
const noResults = document.querySelector("#no-results");
const loadMoreButton = document.querySelector("#load-more");
const errorBox = document.querySelector("#recipes-error");
const errorText = document.querySelector("#recipes-error-text");

const state = { q: "", category: "", offset: 0, total: 0 };
let latestRequest = 0; // lets a newer search win over a slower, older one

// Everything from the API goes in with textContent, never as HTML
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const recipeUrl = (id) => `recipe.html?id=${encodeURIComponent(id)}`;

function renderRating(recipe) {
  if (!recipe.rating) return element("span", "text-xs text-gray-400 ml-2 flex-shrink-0", "No ratings yet");

  const badge = element("div", "flex items-center bg-amber-100 text-yellow-700 px-2 py-1 rounded-full ml-2 flex-shrink-0");
  badge.title = `${recipe.ratingCount} rating${recipe.ratingCount === 1 ? "" : "s"}`;
  badge.append(element("i", "fas fa-star text-yellow-500 mr-1"), element("span", "text-sm font-bold", recipe.rating.toFixed(1)));
  return badge;
}

function renderCard(recipe) {
  const card = element("a", "soft-card soft-card-hover p-4 flex flex-col");
  card.href = recipeUrl(recipe.id);

  const image = element("img", "w-full h-44 object-cover rounded-2xl bg-orange-50");
  image.loading = "lazy";
  image.alt = recipe.name;
  image.src = recipe.image ? `${recipe.image}/medium` : "assets/logo.png";
  image.addEventListener(
    "error",
    () => {
      image.src = "assets/logo.png";
      image.classList.replace("object-cover", "object-contain");
    },
    { once: true }
  );

  const heading = element("div", "flex items-start justify-between mt-3");
  heading.append(element("h3", "text-lg font-bold", recipe.name), renderRating(recipe));

  const meta = [recipe.category, recipe.area].filter(Boolean).join(" · ");
  card.append(
    image,
    heading,
    element("p", "text-gray-600 mt-1 text-sm", meta),
    element("p", "text-gray-500 mt-1 text-sm", `${recipe.ingredientCount} ingredients`),
    element("span", "soft-button mt-auto pt-0 bg-yellow-600 text-white font-semibold py-2 px-4 text-center", "View Recipe")
  );
  return card;
}

function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}

async function loadRecipes(append = false) {
  const request = ++latestRequest;
  errorBox.classList.add("hidden");
  noResults.classList.add("hidden");
  loadMoreButton.disabled = true;

  if (!append) {
    state.offset = 0;
    grid.replaceChildren();
    loadMoreButton.classList.add("hidden");
    resultCount.textContent = "";
  }
  loading.classList.remove("hidden");

  const params = new URLSearchParams({ limit: PAGE_SIZE, offset: state.offset });
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);

  try {
    const { ok, data } = await apiRequest(`/api/recipes?${params}`);
    if (request !== latestRequest) return;
    if (!ok) throw new Error(data.error || "Could not load recipes.");

    grid.append(...data.recipes.map(renderCard));
    state.offset += data.recipes.length;
    state.total = data.total;

    resultCount.textContent = data.total ? `Showing ${state.offset} of ${data.total} recipes` : "";
    noResults.classList.toggle("hidden", data.total > 0);
    loadMoreButton.classList.toggle("hidden", state.offset >= data.total);
  } catch (error) {
    if (request === latestRequest) showError(error.message);
  } finally {
    if (request === latestRequest) {
      loading.classList.add("hidden");
      loadMoreButton.disabled = false;
    }
  }
}

function styleChip(chip, active) {
  chip.classList.remove(...ACTIVE_CHIP, ...IDLE_CHIP);
  chip.classList.add(...(active ? ACTIVE_CHIP : IDLE_CHIP));
  chip.setAttribute("aria-pressed", String(active));
}

function addChip(label, category) {
  const chip = element("button", "border rounded-full px-4 py-1 text-sm font-medium transition-colors", label);
  chip.type = "button";
  chip.dataset.category = category;
  styleChip(chip, category === state.category);
  chip.addEventListener("click", () => {
    state.category = category;
    categoryBar.querySelectorAll("button").forEach((other) => styleChip(other, other.dataset.category === category));
    loadRecipes();
  });
  categoryBar.append(chip);
}

async function loadCategories() {
  addChip("All", "");
  try {
    const { ok, data } = await apiRequest("/api/recipes/categories");
    if (!ok) return; // the chips are a convenience; the list still works without them
    data.categories.forEach(({ name, count }) => addChip(`${name} (${count})`, name));
  } catch (error) {
    // Ignored: loadRecipes shows the connection error
  }
}

async function loadFeatured() {
  try {
    const { ok, data } = await apiRequest("/api/recipes/featured");
    if (!ok) throw new Error();
    document.querySelector("#hero-title").textContent = data.name;
    const blurb = data.blurb.length > 200 ? `${data.blurb.slice(0, 200).trim()}...` : data.blurb;
    document.querySelector("#hero-blurb").textContent = blurb;
    if (data.image) document.querySelector("#hero-image").src = data.image;
    const link = document.querySelector("#hero-link");
    link.href = recipeUrl(data.id);
    link.classList.remove("hidden");
  } catch (error) {
    document.querySelector("#hero-title").textContent = "Food Recipe";
    document.querySelector("#hero-blurb").textContent = "Today's featured recipe could not be loaded.";
  }
}

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.q = searchInput.value.trim();
    loadRecipes();
    // The hero fills the top of the page, so bring the results into view
    if (state.q) document.querySelector("#recipes").scrollIntoView({ behavior: "smooth", block: "start" });
  }, SEARCH_DELAY_MS);
});

loadMoreButton.addEventListener("click", () => loadRecipes(true));
document.querySelector("#retry").addEventListener("click", () => loadRecipes(state.offset > 0));

loadCategories();
loadFeatured();
loadRecipes();
