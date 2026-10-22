# LibraryChatbot

An AI-powered library reservation agent that lets members request and place book reservations through a conversational chat interface.

## Features

- Conversational book discovery and library assistance
- Book lookup using book information such as title and author
- Reservation creation using a library card number or library member's email
- Reservation confirmation with member name and reference ID
- Book-cover display when cover information is available
- PostgreSQL-backed reservation storage

## Tech Stack

- **Next.js 16** — web application and API routes
- **TypeScript** — application code
- **AI SDK** — conversational AI and tool execution
- **PostgreSQL** — database
- **Prisma ORM / PostgreSQL runtime** — database access
- **Open Library** — book metadata and cover images, where integrated

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js compatible with the project's Next.js version
- pnpm
- A PostgreSQL database
- The API credentials required by the AI provider configured in the project

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd nsw-library-bot
```

If you already have the project locally, open its root directory instead.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Add the database connection string and the API key required by your configured AI provider.

For example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
# Add the AI provider's API key using the variable name
# expected by your application.
```

Use the exact environment-variable names referenced by your application code. Do not commit `.env` or expose API keys in the repository.

### 4. Prepare the database

Ensure that your PostgreSQL database is running and that `DATABASE_URL` points to the correct database.

This project uses the Prisma contract and generated runtime metadata. Review the project's Prisma configuration and package scripts before running generation or migration commands. Do not edit generated JSON schema files manually.

### 5. Start the development server

```bash
pnpm dev
```

Open the local URL printed by Next.js—typically:

```text
http://localhost:3000
```

## How to Use

1. Open the LibraryChatbot interface.
2. Ask the chatbot to find or reserve a book.
3. Provide the requested library card number when prompted.
4. Review the reservation confirmation, including the book title and reference ID.

### Example request

> Please reserve *Breaking the Habit of Being Yourself* by Dr. Joe Dispenza using my library card number.

The chatbot can return a confirmation when the reservation is successfully created.

## Project Structure

The following are key files and directories referenced during development. Your repository may contain additional components and routes.

```text
.
├── app/
│   └── api/
│       └── chat/
│           └── tools.ts       # Chat tools, including reservation logic
├── lib/
│   └── prisma.ts              # PostgreSQL ORM client initialization
├── prisma/
│   ├── contract.prisma        # Prisma contract definition
│   └── contract.json          # Generated contract metadata
├── .env                       # Local environment variables (do not commit)
├── package.json
└── README.md
```

## Database Notes

The reservation model includes fields such as:

- `id` — reservation identifier
- `memberId` — associated library member
- `bookTitle` — reserved book title
- `openLibraryId` — book identifier, when available
- `coverId` — cover identifier, when available
- `status` — reservation status
- `createdAt` — reservation creation timestamp

The exact model and relations are defined in `prisma/contract.prisma`.

## Troubleshooting

### Database connection errors

- Confirm PostgreSQL is running.
- Verify the `DATABASE_URL` value in `.env`.
- Check that the database user has the required permissions.

### Unknown column errors

The runtime metadata must match the actual database schema. Check that `lib/prisma.ts` loads the correct generated contract metadata and that the database has the expected reservation fields.

### Temporal unavailable error

The PostgreSQL runtime may use JavaScript's `Temporal` API to handle timestamp values. If the runtime reports that Temporal is unavailable, verify that the Temporal polyfill is installed and imported before initializing the ORM client.

### AI provider errors

Confirm that the required provider API key is configured and that the key has access to the model used by the application.

## Development

Make changes in the application source files, then run the development server and test the chat and reservation flow.

Before deploying, verify:

- Environment variables are configured securely.
- Database schema and generated Prisma contract metadata are in sync.
- Reservation creation and error handling work as expected.
- Secrets and local environment files are excluded from version control.

## License

Add the license that applies to this project.
