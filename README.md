# Lab Reservation Application – Codebase Overview

This repository is a full-stack TypeScript web application for reserving computer laboratory seats.

## Tech Stack

- **Frontend:** Vanilla TypeScript compiled to browser JavaScript, HTML, CSS.
- **Backend:** Express + TypeScript.
- **Database:** MongoDB via Mongoose.
- **Session/Auth:** `express-session` with server-side session checks.

## Project Structure

- `src/server/`
  - `server.ts`: Main Express app, route handlers, authorization helpers, reservation validation/serialization logic.
  - `models/`: Mongoose schemas (`User`, `Reservation`, `Lab`, `Building`, `Activity`).
- `src/frontend/`
  - Per-page scripts for dashboard, reservation, profile, seat selection, admin pages.
  - `util/ClientDbUtil.ts`: client-side API wrapper for common fetch calls.
- `src/shared/`
  - Shared type contracts (`modelTypes.d.ts`).
  - Lab metadata (`labNames.ts`) and seat/building configuration (`labSeatConfig.ts`).
- Root HTML/CSS files
  - Multi-page UI templates (e.g., `index.html`, `dashboard.html`, `reservation.html`, `seat-reservation.html`).

## Data Model (High-Level)

- **User**: identity, role (`Student` / `Lab Technician`), profile fields, plaintext password (currently not hashed).
- **Reservation**: user, lab, selected `seatNumbers`, date/start/end, computed status (`upcoming`, `today`, `past`, `cancelled`).
- **Lab**: canonical room code + building/floor + total seat count.
- **Building**: building name and floor count.
- **Activity**: per-seat reservation/cancellation audit trail.

## Request Flow Summary

1. Frontend pages submit or fetch data using `fetch(...)` and session storage.
2. Express routes in `server.ts` validate payloads, enforce authorization, and query/write MongoDB.
3. Reservation routes normalize seat/time inputs and reject conflicts on overlapping timeslots/seats.
4. Responses are serialized and consumed by page scripts for rendering tables, seat states, and activity lists.

## Key API Areas

- **Auth / session:** `/signup`, `/login`, `/logout`, `/auth/me`, `/delete-account`
- **Users/profile:** `/users/:id` (`GET`, `PUT` with image upload)
- **Reservations (core):** `/reservations` (`GET` for technicians, `POST` create), `/reservations/:id` (`PUT`, `DELETE`), `/reservations/user/:id`, `/reservations/occupied`, `/availability`
- **Labs:** `/lab/name/:name`, `/lab/id/:id`
- **Activities:** `/activity`, `/activities`, `/activities/user/:id`
- **Legacy form-routing endpoints:** `/reservation`, `/view-slot-availability`, `/seat-reservation`

## Reservation Logic Highlights

The server has a fairly robust normalization pipeline in helper functions:

- Parses seat lists from array/comma-separated/single value input.
- Enforces positive, unique seat numbers and capacity bounds per lab.
- Parses date and flexible time formats (12-hour and 24-hour input handling).
- Ensures duration increments are 30-minute multiples.
- Prevents booking in the past.
- Detects overlapping seat conflicts in the same lab/time window.

## Notable Observations

- The app serves static assets from repository root (`express.static(path.join(process.cwd()))`).
- MongoDB connection string is hardcoded in `server.ts`.
- Passwords are compared as plaintext in login route.
- There are both modernized API routes and older compatibility routes in parallel.
- `src/frontend` has a mix of strongly-typed code and legacy `@ts-nocheck` sections.

## Local Development

```bash
npm install
npm run dev
```

Build both frontend and backend TypeScript:

```bash
npm run build
```

Server default runtime port is **3000**.
