# Food Recipe Application

## Description
The Food Recipe Application is a web-based platform that allows users to sign in, sign up, and explore recipes. The application features a user-friendly interface built with web technologies and a robust backend for handling user authentication and recipe management.

## Features
- **User Authentication**: Users sign up and sign in with an email and password (passwords are hashed with bcrypt). Recipe pages are only available once signed in.
- **Recipe Display**: Recipes come from the free [TheMealDB](https://www.themealdb.com) API (about 800 recipes with photos, ingredients and directions). The list has category filters and a "Load more" button, plus a recipe of the day.
- **Recipe Details**: Each recipe has a page with ingredients, directions, a video and source link where available, and visitor comments.
- **Responsive Design**: The application is designed to be responsive and works well on various screen sizes.
- **Comment and Rating System**: Users can leave a star rating and comment on a recipe. Comments are saved in the database, and the average becomes the recipe's rating.
- **Search**: Search the whole catalogue by recipe name, ingredient, category or country.
- **Recipe assistant**: A chat button (bottom right) opens an AI assistant that can find recipes, read ingredients and steps, and summarise visitor comments. It is built on the Claude API with tool use.
- **Friendly forms**: Show/hide password buttons, a live "passwords match" check, and clear inline error messages.

## Technologies Used

### Frontend Technologies
- **HTML**: The standard markup language for creating web pages.
- **CSS**: Used for styling the application.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **JavaScript**: The programming language used to create dynamic and interactive web content.
- **Google Fonts**: For custom typography and font styles.
- **Font Awesome**: For scalable vector icons that can be customized with CSS.
- **Responsive Design**: The application is designed to be responsive, ensuring a good user experience on both desktop and mobile devices.

### Backend Technologies
- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for Node.js to build APIs.
- **TheMealDB API**: Source of the recipes. The backend downloads the catalogue once, caches it in `backend/data/mealdb-cache.json` and serves it from memory.

### Database
- **MySQL**: stores user accounts and recipe comments.

## Installation
To run this project locally you need Node.js 20.6 or later and MySQL 8.

### 1. Database
1. Start MySQL (for example `brew services start mysql` on macOS).
2. Create the database and table by running `backend/schema.sql` in MySQL or DBeaver:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```

### 2. Backend
1. Go to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create your environment file and set `DB_PASSWORD` to your MySQL root password:
   ```bash
   cp .env.example .env
   ```
3. Start the API on port 3001:
   ```bash
   npm start
   ```

### 3. Recipe assistant (optional)
Add an Anthropic API key to `backend/.env` (see `.env.example`) and restart the backend:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
```
The assistant searches the same recipe catalogue as the website.

### 4. Recipes
Nothing to set up. The first time the backend starts it downloads the recipes from TheMealDB (about 10 seconds) and saves them in `backend/data/mealdb-cache.json`. After that it starts instantly, works offline, and refreshes the cache weekly. Delete that file to force a fresh download.

The free test key (`1`) is used by default. TheMealDB asks public or commercial projects to use a paid key, which you can set with `MEALDB_API_KEY` in `backend/.env`.

### 5. Frontend
In a second terminal:
```bash
cd frontend
npm start
```
Then open `http://localhost:8080/signup.html` to create an account.

`npm start` runs `serve.py`, a small static server that disables caching so edits show up on a normal refresh.

## Usage
- Sign Up: Navigate to the sign-up page and enter your details to create a new account.
- Sign In: Use your email and password to log in.
- Explore Recipes: After signing in, browse, search or filter the recipes on the main page.
- View Recipe Details: Click a recipe to see its ingredients and directions.
- Leave Comments: After trying a recipe, you can leave a comment and rate it.

## Project Structure

```
Recipe-explorer/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── db.js                     # MySQL connection pool (reads backend/.env)
│   ├── routes/
│   │   ├── auth.js               # POST /api/auth/signup, /api/auth/signin
│   │   ├── recipes.js            # GET /api/recipes, /categories, /featured, /:id
│   │   ├── comments.js           # GET/POST /api/recipes/:id/comments
│   │   └── chat.js               # POST /api/chat (Claude agent with recipe tools)
│   ├── services/recipes.js       # TheMealDB client, cache and search
│   ├── data/mealdb-cache.json    # Downloaded recipes (generated, not in git)
│   ├── schema.sql                # Database and table definitions
│   └── .env.example              # Copy to .env and fill in your MySQL password
│
├── frontend/
│   ├── index.html                # Sign-in page
│   ├── signup.html               # Sign-up page
│   ├── recipes.html              # Recipe list with search and category filters
│   ├── recipe.html               # Recipe page (recipe.html?id=52772)
│   ├── app.js                    # Shared helpers (API calls, sign-in state, password toggle)
│   ├── signin.js, signup.js      # Auth page logic
│   ├── home.js                   # Recipe list logic (search, filters, paging)
│   ├── chat.js                   # Floating recipe assistant widget
│   ├── recipe.js                 # Recipe page logic (recipe, rating and comments)
│   ├── serve.py                  # Local dev server
│   ├── styles.css, dist/         # Tailwind source and built CSS
│   └── assets/                   # Images
│
└── README.md
```

## Notes
- The signed-in state is stored in the browser only. It stops casual access to the pages but is not real security, so a production version would need server-side sessions or tokens.
- TheMealDB has no cooking times or ratings, so ratings on this site come only from visitor comments.
- Comments are stored against the TheMealDB recipe id. Comments saved before the switch to the API (under names like `tandoori-chicken`) are still in the database but no longer shown.

## Acknowledgments
- Tailwind CSS for the styling framework.
- Google Fonts for typography.
- Font Awesome for icons.
- TheMealDB for the recipe data.
- Express for the web framework.
- Mysql for the database.
