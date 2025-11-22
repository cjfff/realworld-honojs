# ![RealWorld Example App](logo.png)

> ### [honojs] codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.


### [Demo](https://readlworld-nextjs16.netlify.app)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged backend application built with **[honojs]** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **[nohojs]** community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works

A full-stack RealWorld API implementation using [Hono.js](https://hono.dev/), SQLite, and Prisma ORM.

## Features

- ✅ Complete RealWorld API specification implementation
- ✅ JWT-based authentication
- ✅ SQLite database with Prisma ORM
- ✅ Type-safe with TypeScript
- ✅ Input validation with Zod
- ✅ Password hashing with bcrypt
- ✅ CORS enabled
- ✅ Error handling
- ✅ Clean architecture with separated routes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono.js
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jose)
- **Password Hashing**: bcryptjs

## API Endpoints

### Authentication

- `POST /api/users/login` - Login
- `POST /api/users` - Register
- `GET /api/user` - Get current user (Auth required)
- `PUT /api/user` - Update user (Auth required)

### Profiles

- `GET /api/profiles/:username` - Get profile
- `POST /api/profiles/:username/follow` - Follow user (Auth required)
- `DELETE /api/profiles/:username/follow` - Unfollow user (Auth required)

### Articles

- `GET /api/articles` - List articles (supports `tag`, `author`, `favorited`, `limit`, `offset` query params)
- `GET /api/articles/feed` - Feed articles (Auth required)
- `GET /api/articles/:slug` - Get article
- `POST /api/articles` - Create article (Auth required)
- `PUT /api/articles/:slug` - Update article (Auth required)
- `DELETE /api/articles/:slug` - Delete article (Auth required)
- `POST /api/articles/:slug/favorite` - Favorite article (Auth required)
- `DELETE /api/articles/:slug/favorite` - Unfavorite article (Auth required)

### Comments

- `POST /api/articles/:slug/comments` - Add comment (Auth required)
- `GET /api/articles/:slug/comments` - Get comments
- `DELETE /api/articles/:slug/comments/:id` - Delete comment (Auth required)

### Tags

- `GET /api/tags` - Get tags

## Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Token <jwt-token>
```

## API Response Format

All responses follow the RealWorld API specification format:

```json
{
  "user": {
    "email": "jake@jake.jake",
    "token": "jwt.token.here",
    "username": "jake",
    "bio": "I work at statefarm",
    "image": null
  }
}
```

Error responses:

```json
{
  "errors": {
    "body": ["error message"]
  }
}
```

## Database

The database schema is defined in `prisma/schema.prisma`. To view your database:

```bash
npm run prisma:studio
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── profiles.ts        # Profile routes
│   │   ├── articles.ts        # Article routes
│   │   ├── comments.ts        # Comment routes
│   │   └── tags.ts            # Tag routes
│   ├── utils/
│   │   ├── auth.ts            # JWT utilities
│   │   ├── password.ts        # Password hashing
│   │   ├── slug.ts            # Slug generation
│   │   ├── transform.ts       # Response transformers
│   │   └── validation.ts      # Zod schemas
│   └── index.ts               # Main server file
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Best Practices Implemented

- ✅ Singleton Prisma Client to prevent connection exhaustion
- ✅ Environment variables for configuration
- ✅ Input validation with Zod schemas
- ✅ Password hashing with bcrypt
- ✅ JWT authentication with secure token handling
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Type-safe code with TypeScript
- ✅ Clean separation of concerns (routes, utils, middleware)
- ✅ Response transformers for consistent API format

# Getting started

> npm install, npm start, etc.

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3000
```

3. Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`
