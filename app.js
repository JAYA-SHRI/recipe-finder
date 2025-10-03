document.addEventListener('DOMContentLoaded', () => {
    const ingredientsInput = document.getElementById('ingredients-input');
    const searchButton = document.getElementById('search-button');
    const recipeDisplay = document.getElementById('recipe-display');

    // 🛑 IMPORTANT: Replace 'YOUR_API_KEY' with your actual Spoonacular API key
    const API_KEY = 'd5280ff618be4d269489d871c71433da'; // <<< PASTE YOUR KEY HERE >>>
    
    // --- DEMO RECIPE DATA (Fallback for resilience) ---
    const DEMO_RECIPE = {
        title: "Chef's Signature Garlic-Herb Pasta (DEMO)",
        image: "https://images.unsplash.com/photo-1595166687000-8805f63d047e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NjAxNzd8MHwxfHNlYXJjaHwxNXx8cGFzdGF8ZW58MHx8fHwxNzA4MzQ1OTQxfDA&ixlib=rb-4.0.3&q=80&w=1080", // High-quality placeholder image
        readyInMinutes: 25,
        servings: 4,
        sourceUrl: "#", // Dummy link for the demo
        extendedIngredients: [
            { original: "1 pound spaghetti or linguine" },
            { original: "1/4 cup extra virgin olive oil" },
            { original: "4 cloves garlic, minced" },
            { original: "1/2 cup grated Parmesan cheese" },
            { original: "1/4 cup fresh parsley, chopped" },
            { original: "Salt and freshly ground black pepper to taste" }
        ],
        instructions: "1. Cook pasta according to package directions. Reserve 1/2 cup of the pasta water. 2. While pasta cooks, heat olive oil in a large skillet over medium heat. Add garlic and sauté until fragrant (about 1 minute). 3. Drain the pasta and transfer it to the skillet. Toss to coat. 4. Add the reserved pasta water, Parmesan cheese, and parsley. Stir until the sauce is creamy. Season generously with salt and pepper. Serve immediately."
    };
    // ----------------------------------------------------


    searchButton.addEventListener('click', findRecipe);
    ingredientsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findRecipe();
        }
    });

    async function findRecipe() {
        if (API_KEY === 'YOUR_API_KEY') {
            // Display the demo if the key is the placeholder
            recipeDisplay.innerHTML = '<p class="error-message">⚠️ Using Demo Data: Please replace "YOUR_API_KEY" in script.js to enable live search.</p>';
            renderRecipe(DEMO_RECIPE);
            return;
        }

        const ingredients = ingredientsInput.value.trim();
        if (!ingredients) {
            alert('Please enter some ingredients!');
            return;
        }

        recipeDisplay.innerHTML = '<p class="initial-message">Searching for delicious recipes...</p>';

        try {
            // 1. Search for recipes by ingredients
            const encodedIngredients = encodeURIComponent(ingredients);
            const searchUrl = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${encodedIngredients}&number=1&ranking=1&ignorePantry=true`;
            
            const searchResponse = await fetch(searchUrl);

            if (!searchResponse.ok) {
                 // Throw an error to be caught below, improving error handling
                 throw new Error(`API Request failed with status: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();

            if (searchData.length === 0) {
                recipeDisplay.innerHTML = '<p class="error-message">Sorry, no recipes found for those ingredients. Showing a demo instead.</p>';
                renderRecipe(DEMO_RECIPE); // Show demo if no recipes found
                return;
            }

            const recipeId = searchData[0].id;

            // 2. Get detailed recipe information
            const detailUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
            
            const detailResponse = await fetch(detailUrl);
            const recipeData = await detailResponse.json();

            // 3. Render the recipe data
            renderRecipe(recipeData);

        } catch (error) {
            console.error('API Error:', error);
            
            let userMessage = '⚠️ Network or API Error. Showing a demo recipe instead.';
            
            // Customize user message based on common API failure status codes
            if (error.message.includes('401')) {
                userMessage = '❌ Error 401: Invalid API Key. Showing a demo.';
            } else if (error.message.includes('402')) {
                 userMessage = '⏳ Error 402: Daily Quota Used Up. Showing a demo.';
            }

            // Fallback: Display custom error message AND the demo recipe
            recipeDisplay.innerHTML = `<p class="error-message">${userMessage}</p>`;
            renderRecipe(DEMO_RECIPE);
        }
    }

    function renderRecipe(recipe) {
        // Build the ingredient list HTML
        const ingredientsHtml = recipe.extendedIngredients.map(ing => 
            `<li>${ing.original}</li>`
        ).join('');

        // Clean up instructions (removes HTML tags from the API response)
        const instructions = recipe.instructions ? recipe.instructions.replace(/<\/?[^>]+(>|$)/g, "") : 'Instructions not available. Please check the source link.';

        // Create the final HTML structure for the recipe card
        recipeDisplay.innerHTML = `
            <div class="recipe-card">
                <h2 class="recipe-title">${recipe.title}</h2>
                
                <div class="recipe-meta">
                    <span>⏱️ Prep Time: ${recipe.readyInMinutes} mins</span>
                    <span>🍽️ Servings: ${recipe.servings}</span>
                </div>

                <div class="recipe-content">
                    <div class="recipe-image-container">
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                        <p><a href="${recipe.sourceUrl}" target="_blank">View Full Recipe Source</a></p>
                    </div>

                    <div class="recipe-details">
                        <h3>Ingredients</h3>
                        <ul class="ingredient-list">
                            ${ingredientsHtml}
                        </ul>

                        <h3>Instructions</h3>
                        <p>${instructions}</p>
                    </div>
                </div>
            </div>
        ` + recipeDisplay.innerHTML; // Prepend the recipe card to the error message (if any)
    }
});