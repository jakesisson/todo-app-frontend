// README.md
# ToDo App Frontend

This is a simple, modern frontend for a ToDo application built using **Next.js 14**, **TailwindCSS**, and **Jotai** for state management. The application supports creating, editing, filtering, sorting, and searching ToDo items. This front end project is built as an internship test for Newline.Ai. 

## Features

- **Add and Edit Todos**: Users can add new tasks or edit existing ones.
- **Filter Todos**: Filter tasks based on their completion status (All, Completed, Not Completed).
- **Search Todos**: Quickly find tasks by their title using Fuse.js.
- **Sort Todos**: Sort tasks alphabetically by title (A-Z or Z-A).
- **Responsive Design**: Fully responsive interface built with TailwindCSS.

## Technologies Used

- **Next.js 14**: For building a fast, server-rendered React application.
- **TailwindCSS**: For easy and customizable styling.
- **Jotai**: Lightweight state management.
- **Fuse.js**: For efficient fuzzy searching.
- **Lodash**: For sorting and utility functions.

## Setup Instructions

Follow these steps to run the application locally:

### Prerequisites
- Install **Node.js** (v16 or higher) and **npm**.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jakesisson/todo-app-frontend.git
   cd todo-app-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Build for Production

To build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## File Structure

```
todo-app-frontend/
├── pages/
│   ├── _app.js       # Application entry point
│   ├── index.js      # Home page with todo list
│   ├── add-edit.js   # Page for adding/editing todos
├── store/
│   ├── atoms.js      # Jotai state atoms
├── styles/
│   ├── globals.css   # Global TailwindCSS styles
├── jsconfig.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── .gitignore        # Git ignored files
├── package.json      # Project dependencies and scripts
├── README.md         # Project documentation
```

## API Integration

For testing purposes, the app uses the [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) to fetch dummy todo data. Replace it with your own API endpoints for full functionality.

### Example API Endpoint
- `GET https://jsonplaceholder.typicode.com/users/1/todos`: Fetches the list of todos.

## Future Improvements

- **Authentication**: Add user authentication for secure access.
- **Back-end Integration**: Connect to a real backend API.
- **Pagination**: Support for large todo lists.
- **Dark Mode**: Include a toggle for light and dark themes.


## Author

Developed by [Jacob Sisson](https://github.com/jakesisson).
