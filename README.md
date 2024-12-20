# Food Recipe Application

## Description
The Food Recipe Application is a web-based platform that allows users to sign in, sign up, and explore recipes. The application features a user-friendly interface built with web technologies and a robust backend for handling user authentication and recipe management.

## Features
- **User  Authentication**: Users can sign in and sign up to access the application.
- **Recipe Display**: Users can view a list of popular recipes with images, ratings, and brief descriptions.
- **Recipe Details**: Each recipe has a dedicated page that includes ingredients, cooking directions, and user comments.
- **Responsive Design**: The application is designed to be responsive and works well on various screen sizes.
- **Comment and Rating System**: Users can leave comments and rate recipes.

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

### Database
- **Mysql**: database for storing user data.

## Installation
To run this project locally, follow these steps:

### Frontend Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>

### Backend Setup
1. **Navigate to the backend directory**: 
   ```bash
   cd backend
2. **Install dependencies**:   
    ```bash
   npm install
3. **Set up environment variables**:  
    ```bash
    PORT=5000
    DATABASE_URI=mysql://<root>:<sri@2004>@localhost:27017/recipe_explorer_db
4. **Start the mysql server**:
    ```bash
    mysqld
5. **Run the backend application**:
    ```bash
    npm start
## Usage
- Sign Up: Navigate to the sign-up page and enter your details to create a new account.
- Sign In: Use your email and password to log in.
- Explore Recipes: After signing in, you can explore recipes displayed on the main page.
- View Recipe Details: Click on a recipe to view its details, including ingredients and cooking instructions.
- Leave Comments: After trying a recipe, you can leave a comment and rate it.

## Project Structure

/project-root
│
├── backend/                         # Backend directory                        
│   ├── controllers/                 # Controllers for handling requests
│   ├── models/ 
│   ├── routes/                      # API routes
│   ├── frontend/                    # front files
│   
│
├── frontend/                        # Frontend directory
│   ├── signup.html                  # Sign-up page
│   ├── signin.html                  # Sign-in page
│   ├── third.html                   # explore recipes page
│   ├── pannerbuttermasala.html      # detailed view of panner butter masala recipe 
|   ├── Tandoori.html                # detailed view of Tandoori recipe 
│   ├── briyani.html                 # detailed view of chicken briyani recipe 
│   ├── oreomilkshake.html           # detailed view of oreomilkshake recipe 
│   ├── dist                         # folder for styling
│   └── styles.css                   # styling file 
|   
|
│
└── README.md                        # Project documentation

## Acknowledgments
- Tailwind CSS for the styling framework.
- Google Fonts for typography.
- Font Awesome for icons.
- Express for the web framework.
- Mysql for the database.
