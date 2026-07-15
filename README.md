# Smart Queue Management System — Frontend

React frontend for the **Smart Queue Management System**, a hospital queue management platform that replaces physical waiting lines with digital tokens. Patients browse hospitals, join a department queue, track their live position, and get notified the moment they're called. Staff manage the queue from a dedicated dashboard.

This repo is the client application. For the backend (Spring Boot REST API, authentication, database), see the [backend repo](https://github.com/madhulika2028/smart-queue-backend).

**Live demo:** https://smart-queue-frontend-theta.vercel.app
*(hosted on a free tier — first load may take 30–40 seconds while the backend wakes up)*

## Features

- **Hospital & department browsing** — filter hospitals by city, view departments and average wait times
- **Authentication** — separate patient and staff accounts, JWT-based sessions persisted across page reloads
- **Role-based navigation** — patients and staff see different views; staff-only pages are protected
- **Join queue flow** — patients join a department queue and instantly see their token number
- **Live queue tracking** — polls the backend every few seconds to show queue position and estimated wait time
- **Real-time alerts** — in-app banner and native browser notification when a patient's token is called
- **Staff dashboard** — live queue view, "Call Next" (priority-aware), and "Mark Complete" actions

## Tech Stack

- React
- React Router
- Vite
- Fetch API (with polling for live updates)
- Browser Notifications API

## Architecture Notes

- All API calls are centralized in `src/api.js`, which reads the backend URL from an environment variable rather than hardcoding it — this lets the same code run against a local backend in development and a deployed backend in production.
- `AuthContext.jsx` manages login state and persists the JWT to `localStorage` so sessions survive a page refresh.
- `ProtectedRoute.jsx` gates access to authenticated/staff-only pages, redirecting to login when needed.
- Every protected request attaches an `Authorization: Bearer <token>` header; a global `401`/`403` handler logs the user out and redirects to login if their session is invalid or expired.

## Setup

### Prerequisites
- Node.js
- The [backend](https://github.com/madhulika2028/smart-queue-backend) running locally or deployed

### Install & run

```bash
git clone https://github.com/madhulika2028/smart-queue-frontend.git
cd smart-queue-frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default (or a nearby port if that one's in use).

### Environment variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

For local development, this can be omitted — the dev server proxies `/api` requests to `localhost:8080` automatically (see `vite.config.js`). It's required when deploying, pointing at the live backend URL instead.

## Deployment

Deployed on **Vercel**. Build command: `npm run build`, output directory: `dist`. Set `VITE_API_BASE_URL` in the project's environment variables to point at the deployed backend.

## What I'd Improve Next

- Replace polling with WebSockets for true real-time queue updates
- Add form validation and better error messaging throughout
- Improve mobile responsiveness
- Add a public "Now Serving" display board view

## Author

Built by [Your Name] as a full-stack portfolio project.
