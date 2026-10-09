# Fixora Backend

Fixora Backend is the server-side API for a service marketplace where customers can create job requests and providers can accept, work on, and complete those jobs. The application uses Express.js and MongoDB to manage authentication, user roles, and the full job lifecycle.

## Overview

This repository provides the backend foundation for a job marketplace experience focused on three primary workflows:

- User registration and login with JWT-based authentication
- Job creation and discovery for customers and providers
- Job lifecycle management from request to completion or cancellation

The codebase follows a layered architecture with route definitions, controller logic, middleware, and Mongoose models, making it straightforward to extend for additional marketplace features.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment configuration
- Nodemon for local development

## Project Structure

```text
fixora-backend/
├── src/
│   ├── app.js                     # Express app setup
│   ├── configs/
│   │   └── mongodb.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, user profile, logout
│   │   └── jobController.js       # Job CRUD and status transitions
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── errorMiddleware.js      # Centralized error handling
│   │   └── pagination.js          # Query pagination support
│   ├── models/
│   │   ├── userModel.js           # User schema and role model
│   │   └── jobModel.js            # Job schema with lifecycle status
│   └── routers/
│       ├── userRoute.js           # Authentication endpoints
│       └── jobRoute.js            # Job-related endpoints
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── server.js                     # Entry point for the app
└── README.md
```

## Features

### Authentication and authorization

- User registration with email uniqueness checks
- Login with bcrypt password validation
- JWT token generation and verification
- Role-based access for `customer` and `provider`
- Protected routes for authenticated actions

### Job management

- Create jobs with service, description, price, and location
- Browse available jobs with pagination
- View details for an individual job
- Retrieve jobs associated with the current user
- Transition job status across the workflow:
  - `requested`
  - `accepted`
  - `in_progress`
  - `awaiting_review`
  - `completed`
  - `cancel`

### Error handling and validation

- Input validation for required fields
- Authorization checks for protected operations
- Standardized JSON error responses

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Fetch the authenticated user's profile |
| POST | `/api/auth/logout` | Log out the current user |

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/jobs` | Create a new job request |
| GET | `/api/jobs/available-jobs` | View paginated available jobs |
| GET | `/api/jobs/available-jobs/:_id` | Fetch a single job by ID |
| GET | `/api/jobs/my-jobs` | Get jobs for the authenticated user |
| PATCH | `/api/jobs/:id/accept` | Provider accepts a job |
| PATCH | `/api/jobs/:id/in_progress` | Mark a job as in progress |
| PATCH | `/api/jobs/:id/complete` | Complete a job |
| PATCH | `/api/jobs/:id/submit-for-review` | Submit a job for review |
| PATCH | `/api/jobs/:id/cancel` | Cancel a requested job |

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixora
jwt_secret=your_super_secure_secret_key
```

Important notes:

- `MONGODB_URI` should point to your MongoDB instance.
- `jwt_secret` must be a secure secret string and should never be committed to source control in a production environment.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

If you prefer pnpm:

```bash
pnpm install
```

## Running the Application

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server starts on port `5000` by default unless `PORT` is overridden in your environment.

## Example User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "customer"
}
```

## Example Job Creation

```http
POST /api/jobs
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "service": "Plumbing",
  "description": "Fix leaking kitchen sink pipe",
  "price": 120,
  "location": "Nairobi"
}
```

## Database Model Notes

### User model

The `User` model includes:

- `name`
- `email` (unique)
- `password` (hashed)
- `role` (`customer` or `provider`)

### Job model

The `Job` model includes:

- `customer` reference to a user
- `provider` reference to a user (nullable until assignment)
- `service`
- `description`
- `location`
- `price`
- `status` with lifecycle validation

## Notes

This repository is structured as a backend service for a marketplace application and is suitable for learning, prototyping, or extending into a larger service platform. The code is intentionally simple and modular, which makes it easy to add features like reviews, payments, notifications, or file uploads.

## Contributing

Contributions are welcome. If you would like to improve the codebase, you can:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project currently does not include a license file. If you plan to share or distribute it publicly, consider adding an appropriate open-source license.
