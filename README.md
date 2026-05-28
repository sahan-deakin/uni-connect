# UniConnect

A web platform that connects university students through shared academic resources, community forums, events, and peer reviews. Built for Deakin University SIT725.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Pages](#pages)
- [Features](#features)

---

## Overview

UniConnect allows students to:

- Upload and discover academic resources (notes, past exams, slides, textbooks)
- Participate in a community forum with post and comment support
- View and RSVP to university events
- Review and rate peers
- Receive real-time notifications via Socket.IO
- Report inappropriate content for admin review

Admins can manage users, moderate reported resources and forum posts, block/unblock accounts, and oversee platform activity through a dedicated dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.IO 4 |
| File uploads | Multer |
| Frontend | Vanilla JS + Materialize CSS |
| Testing | Mocha + Chai + Sinon |
| Container | Docker |

---

## Project Structure

```
uni-connect/
├── controllers/        # Route handler logic (MVC controllers)
├── middleware/         # Auth middleware (requireAuth)
├── models/             # Mongoose schemas
├── public/             # Static frontend (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   ├── Images/
│   └── partials/       # Shared navbar component
├── routes/             # Express route definitions
├── scripts/            # Database seed scripts
├── services/           # Business logic layer
├── test/               # Automated test suites
├── uploads/            # Uploaded resource files
├── server.js           # App entry point
└── Dockerfile
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
git clone https://github.com/sahan-deakin/uni-connect.git
cd uni-connect
npm install
```

### Run the development server

```bash
npm start
```

The server starts at `http://localhost:3000`.

For auto-restart on file changes:

```bash
npm run dev
```

### Docker

```bash
docker build -t uni-connect .
docker run -p 3000:3000 uni-connect
```

---

## Environment Variables

Create a `.env` file in the root directory if you want to override defaults:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/uni-connect
JWT_SECRET=your-secret-key
```

The app runs without a `.env` file using the defaults above.

---

## Seeding the Database

Seed all users, students, events, resources, and forum posts:

```bash
npm run seed
```

Seed only dashboard-related data:

```bash
npm run seed:dashboard
```

Default seeded credentials:

| Email | Password | Role |
|---|---|---|
| alex.johnson@deakin.edu.au | password123 | user |
| rootadmin@admin.com | password123 | admin |

---

## Running Tests

Ensure the server is running first, then in a separate terminal:

```bash
# Run all tests
npm test

# Run admin API tests only
npx mocha test/admin.test.js --timeout 10000

# Run notification tests only
npx mocha test/notification.test.js --timeout 10000
```

Test output follows the format:

```
TEST|T01|GET /users — returns 200|GET|/api/admin/users|expected=200|actual=200|pass=Y
SUMMARY|pass=Y|failed=0|total=27
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/blocked-users` | List blocked users |
| PUT | `/api/admin/block-user/:userId` | Block a user |
| PUT | `/api/admin/unblock-user/:userId` | Unblock a user |

### Resources

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resources` | List all resources |
| GET | `/api/resources/reported` | List reported resources |
| GET | `/api/resources/:id` | Get a single resource |
| POST | `/api/resources` | Upload a resource |
| POST | `/api/resources/:id/report` | Report a resource |
| PUT | `/api/resources/:id/resolve-report` | Resolve a report |
| DELETE | `/api/resources/:id` | Delete a resource |

### Forum

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/forum/posts` | List all posts |
| POST | `/api/forum/posts` | Create a post |
| POST | `/api/forum/posts/:postId/comments` | Add a comment |
| POST | `/api/forum/posts/:postId/report` | Report a post |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create an event |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/:userId` | Get notifications for a user |
| PUT | `/api/notifications/:id/read` | Mark notification as read |

---

## Pages

| Page | Path | Description |
|---|---|---|
| Landing | `/index.html` | Public landing page |
| Login / Register | `/login.html` | Authentication |
| Dashboard | `/dashboard.html` | Student home |
| Resources | `/resources.html` | Browse and upload resources |
| Resource View | `/resourceView.html` | Single resource detail |
| Forum | `/forum.html` | Community posts |
| Events | `/event.html` | University events |
| Admin | `/admin.html` | Admin dashboard |

---

## Features

### Real-time Notifications (Socket.IO)
- Students receive live notifications via a persistent socket connection
- Forum page shows a live banner when another user submits a new post
- Socket rooms: per-user session rooms for notifications, `forum-room` for forum updates

### Resource Reporting
- Students can flag resources with a reason via a popup modal
- Duplicate reports on unresolved items are blocked (409)
- Admins can resolve or delete reported resources from the admin panel

### Admin Dashboard
- Sidebar navigation with active state and section panels
- Reported Resources panel with live data
- User block/unblock with configurable duration
- Logo branding and logout button

### Navbar
- Shared across all pages via a reusable partial
- Context-aware: Dashboard hidden on index, Features/How it works hidden when logged in
- Notification bell only visible when authenticated
- Logout redirects to index page