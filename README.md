# Nuxt WebSockets Todo

A todo application using websockets.

## Description

This todo app is very limited at the moment.
All updates are sent via WebSockets.

**Highlight**: The websocket end-points are type-safe on the server and the client.

### Caveats

All of the following are not yet implemented, but are planned:

- There is no authentication / authorization
- Sub-Tasks

## Setup

Make sure to install dependencies:

```bash
bun install
```

Create the .env file and add your [PostgreSQL](https://www.postgresql.org/download/) connection as `DATABASE_UR`

```bash
cp .env.example .env
```

## Development Server

Make sure you have your [PostgreSQL](https://www.postgresql.org/download/) database running.

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```
