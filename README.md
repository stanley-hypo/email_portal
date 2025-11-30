# API Portal

A modern email management application built with Next.js, PostgreSQL, and Redis.

## Features

- Email management and organization
- Real-time updates with Redis
- Secure authentication
- Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Node.js 18
- **Database**: PostgreSQL
- **Caching**: Redis
- **DevOps**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18 or higher
- Yarn package manager

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
# Example: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/email_portal"

# Authentication
AUTH_SECRET="your-secret-key-here"
# Generate a secure random string for production
# You can use: openssl rand -base64 32
```

**Required Environment Variables:**

- `DATABASE_URL`: PostgreSQL connection string for the database
  - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`
  - Used by Drizzle ORM for database connections
  
- `AUTH_SECRET`: Secret key for NextAuth.js session encryption
  - Must be a secure random string (minimum 32 characters recommended)
  - Generate using: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - **Important**: Never commit this value to version control

For a complete example, see `.env.example` in the project root.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up your environment variables (see above)

4. Run database migrations:
   ```bash
   yarn db:migrate
   ```

5. (Optional) Seed the database with test data:
   ```bash
   yarn db:seed
   ```

6. Start the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

### Database Management

- **Generate migration**: `yarn db:generate`
- **Run migration**: `yarn db:migrate`
- **Seed database**: `yarn db:seed`
