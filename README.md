# Nuxt WebSockets Todo

A todo application using websockets.

## Description

This todo app is very limited at the moment.
On the plus-side, you can just run it without any configuration.
All updates are sent via WebSockets.

**Highlight**: The websocket end-points are type-safe on the server and the client.

### Caveats

All of the following are not yet implemented, but are planned:

- The app is not styled
- There is no persistence in a database
- There is no authentication / authorization

## Setup

Make sure to install dependencies:

```bash
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```
