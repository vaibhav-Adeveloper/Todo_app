# Todo App

A full-stack task manager built with React, Redux Toolkit, Node.js, Express, and MongoDB. Create and organize tasks by priority, due date, and status, with account authentication and light/dark themes.

## Features

- Register and log in with an account; profile images are uploaded to Cloudinary.
- Create, view, edit, complete, and delete tasks.
- Track task priority, due date, due time, and status.
- Use the built-in demo account without configuring MongoDB.
- Switch between light and dark themes; the selected theme is saved in the browser.
- Keep each signed-in user's tasks private.

## Quick start: demo mode

Demo mode runs without MongoDB or Cloudinary. It uses an in-memory sample account and task list; changes are cleared when the backend restarts.

### 1. Install dependencies

Run these commands from the project root in separate terminals, or install both packages before starting the app:

```powershell
cd server
npm install
```

```powershell
cd client
npm install
```

### 2. Start the backend

Create `server/.env` from the example:

```powershell
cd server
Copy-Item .env.example .env
npm run dev
```

The example enables demo mode and starts the API at `http://localhost:2000`.

### 3. Start the frontend

In another terminal:

```powershell
cd client
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`) and select **Continue with demo account**.

**Demo credentials**

- Email: `demo@todo.local`
- Password: `demo1234`

The credentials are also displayed on the login page. Demo mode is for local development and should not be exposed publicly.

## Run with MongoDB

1. Create a MongoDB database and a Cloudinary account.
2. Set the following values in `server/.env`:

   ```env
   PORT=2000
   DEMO_MODE=false
   MONGODB_URI=mongodb://127.0.0.1:27017
   CORS_ORIGIN=http://localhost:5173
   ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

   For MongoDB Atlas, use your Atlas connection string for `MONGODB_URI`. Keep `.env` private and never commit real credentials.

3. Restart the backend and frontend using the commands above.

Cloudinary credentials are required for account registration because signup uploads a profile image. The upload accepts image files up to 5 MB.

The Vite development proxy targets `http://localhost:2000` by default. To use another backend URL, set `API_PROXY_TARGET` in `client/.env`, for example:

```env
API_PROXY_TARGET=http://localhost:3000
```

## API overview

All endpoints use the `/api/v1` prefix. Successful and error responses use JSON.

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `GET` | `/users/status` | Check demo mode and restore the current session, if present | No |
| `POST` | `/users/signup` | Register with `username`, `email`, `password`, and `profileImage` (multipart form data) | No |
| `POST` | `/users/login` | Log in with `email` and `password` | No |
| `GET` | `/users/current` | Get the current user | Yes |
| `POST` | `/users/logout` | Clear the login cookie | Yes |
| `GET` | `/todos` | List the signed-in user's tasks | Yes |
| `POST` | `/todos` | Create a task | Yes |
| `PATCH` | `/todos/:todoId` | Update task fields or status | Yes |
| `DELETE` | `/todos/:todoId` | Delete a task | Yes |

Todo status values are `pending`, `in-progress`, and `completed`. Priority values are `low`, `medium`, and `high`. Authentication uses an HTTP-only cookie; the API also accepts a bearer token.

## Scripts

Run these from the relevant folder:

| Folder | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run lint` | Run ESLint |
| `client` | `npm run build` | Build the frontend for production |
| `client` | `npm run preview` | Preview a production build |
| `server` | `npm run dev` | Start the Express server with nodemon |

## Project structure

```text
client/
  src/
    app/                 Redux store
    components/          Header and authentication forms
    features/            Authentication, theme, and task state
    lib/                 API client
    App.jsx              Dashboard and task management
server/
  src/
    controllers/         Authentication and task handlers
    db/                  MongoDB connection
    middlewares/         Authentication and file uploads
    models/              Mongoose user and task models
    routes/              Express API routes
    utils/               API responses, demo mode, and demo data
```

## Tech stack

- **Frontend:** React, Vite, React Router, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** HTTP-only cookies and JSON Web Tokens
- **Image uploads:** Multer and Cloudinary
