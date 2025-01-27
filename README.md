# Next Login Boilerplate

This project is a boilerplate for user authentication and registration using Next.js, MongoDB, and TypeScript. It includes features such as email verification, multi-factor authentication (MFA), and password hashing.

## Features

- User registration with email verification
- Password hashing using bcrypt
- Multi-factor authentication (MFA)
- Environment variable configuration
- Error handling and logging

## Getting Started

### Prerequisites

- Node.js (>= 20.x)
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/next-login-boilerplate.git
   cd next-login-boilerplate
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   DOMAIN=http://localhost:3000
   SENDER_EMAIL=your-email@example.com
   MAIL_HOST=smtp.example.com
   MAIL_PORT=465
   MAIL_USER=your-email@example.com
   MAIL_PASS=your-email-password
   MONGO_URL=mongodb://localhost:27017/your-database
   TOKEN_SECRET=your-secret-key-here
   ```

   Make sure to use a strong, random string for your TOKEN_SECRET in production. You can generate one using a secure random generator or use a command like this in your terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

### Project Structure

- `src/`: Contains the source code for the project.
  - `app/`: Contains the Next.js pages and API routes.
    - `api/`: contains APIs for the project
  - `common/`: Contains common utilities, types, and constants.
  - `services/`: Contains service classes for authentication, mailing, etc.
  - `models/`: Contains Mongoose models for MongoDB collections.
