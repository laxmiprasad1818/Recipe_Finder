document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const loginSection = document.getElementById("loginSection");
  const appSection = document.getElementById("appSection");

  const apiKey = "78bdab846ca241c389afc87db917d6fc"; 

  const sendBtn = document.getElementById("sendBtn");
  const ingredientsInput = document.getElementById("ingredients");
  const recipeResults = document.getElementById("search-results"); // Updated to match your HTML container

  const featuredRecipesContainer = document.getElementById("featured-recipes");
  const searchResultsContainer = document.getElementById("search-results");

  // 🔐 LOGIN LOGIC
  loginBtn.addEventListener("click", () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (user && pass) {
      loginError.textContent = "";
      loginSection.style.display = "none";
      appSection.style.display = "block";
    } else {
      loginError.textContent = "❌ Please enter both username and password.";
    }
  });

  // 🍽️ FEATURED RECIPES
  async function fetchFeaturedRecipes() {
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/random?number=6&apiKey=${apiKey}`);
      const data = await res.json();
      displayRecipes(data.recipes, featuredRecipesContainer);
    } catch (err) {
      console.error("Featured recipe error:", err);
      featuredRecipesContainer.innerHTML = `<p>⚠️ Couldn't load featured recipes.</p>`;
    }
  }

  // 🍅 SEARCH BY INGREDIENTS + FILTERS
  sendBtn.addEventListener("click", async () => {
    const ingredients = ingredientsInput.value.trim();
    const dietType = document.querySelector('input[name="type"]:checked').value;
    const maxReadyTime = document.getElementById("timeDropdown").value;

    if (!ingredients) {
      recipeResults.innerHTML = "<p>❗ Please enter some ingredients.</p>";
      return;
    }

    recipeResults.innerHTML = "<p>Loading recipes...</p>";

    try {
      const queryParams = new URLSearchParams({
        apiKey: apiKey,
        includeIngredients: ingredients,
        number: 10,
        maxReadyTime: maxReadyTime,
        instructionsRequired: true,
        addRecipeInformation: true
      });

      // Set diet or excludeIngredients based on type
      if (dietType === "veg") {
        queryParams.append("diet", "vegetarian");
      } else if (dietType === "non-veg") {
        // No diet param, but exclude vegetarian ingredients
        queryParams.append("excludeIngredients", "tofu,eggplant,vegetables,vegetarian");
      }
      // If 'both', no diet or excludeIngredients filter is applied

      const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${queryParams.toString()}`);
      const data = await res.json();

      recipeResults.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        recipeResults.innerHTML = "<p>No recipes found. Try adjusting your filters.</p>";
        return;
      }

      displayRecipes(data.results, recipeResults);
    } catch (err) {
      console.error("Ingredient search error:", err);
      recipeResults.innerHTML = "<p>⚠️ Failed to fetch recipes. Try again later.</p>";
    }
  });

  // 🖼️ DISPLAY RECIPES IN ANY CONTAINER
  function displayRecipes(recipes, container) {
    container.innerHTML = "";
    if (!recipes || recipes.length === 0) {
      container.innerHTML = "<p>⚠️ No recipes available.</p>";
      return;
    }

    recipes.forEach((recipe) => {
      const roundedTime = recipe.readyInMinutes ? Math.round(recipe.readyInMinutes / 5) * 5 : "N/A";

      const card = document.createElement("div");
      card.className = "recipe-card";

      const title = recipe.title || "Untitled Recipe";
      const image = recipe.image || "";
      const source = recipe.sourceUrl || `https://spoonacular.com/recipes/${title.replace(/\s+/g, "-").toLowerCase()}-${recipe.id}`;

      card.innerHTML = `
        <img src="${image}" alt="${title}" />
        <h3>${title}</h3>
        <p>⏱️ Ready in ${roundedTime} mins</p>
        <a href="${source}" target="_blank" rel="noopener noreferrer">📖 View Recipe</a>
      `;

      container.appendChild(card);
    });
  }

  // 🏁 INITIAL LOAD
  fetchFeaturedRecipes();
});
