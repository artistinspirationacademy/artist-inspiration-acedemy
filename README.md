![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?logo=redis&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-fbf0df?logo=bun&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

# Artist Inspiration Academy

Running a course platform means juggling teachers, course catalogs, student bookings, and media — all while keeping the public site polished. Artist Inspiration Academy brings it together in a monorepo: a public-facing website where prospective students browse courses and submit bookings, and a full-featured admin panel where staff manage every aspect of the platform.

- **Course catalog** — Organize courses into categories with rich, composable detail sections: text blocks, accordions, images, and grid layouts.
- **Teacher profiles** — Showcase instructors with ratings, experience, bio, and optional profile video. Assign one or more teachers per course.
- **Student bookings** — Capture full student context at inquiry time: course, preferred teacher, experience level, country, and contact details.
- **Admin dashboard** — At-a-glance metrics for courses, bookings, and content activity, backed by charts and recent-event feeds.
- **Media library** — Centralized asset management for images, videos, audio, and documents, stored and served via UploadThing.
- **Content management** — Full CRUD for banners, testimonials, feature highlights, and about-page sections directly from the admin panel.
- **Email notifications** — Students receive a booking-confirmation email; admins are notified of each new booking via Resend and React Email.
- **Notification feed** — In-app admin notification system with read/archive lifecycle tied to booking events.
- **Activity logs** — Timestamped audit trail for every entity type, with a cron-triggered archive job that compresses old logs and stores them in UploadThing.
- **Site configuration** — Toggle booking on/off, set displayed statistics (learners, countries, teachers, content hours), and tune log-retention policy — all without a code deploy.

## Stack & Architecture

### Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19, TypeScript |
| Monorepo      | Turborepo + Bun workspaces                    |
| Database      | PostgreSQL via Drizzle ORM                    |
| Caching       | Redis (ioredis) — data cache + rate limiting  |
| UI            | Tailwind CSS v4, shadcn/ui, Radix UI          |
| Animations    | Motion (Framer Motion)                        |
| Forms         | React Hook Form + Zod                         |
| Data fetching | TanStack React Query                          |
| Charts        | Recharts                                      |
| File uploads  | UploadThing                                   |
| Email         | Resend + React Email                          |
| Auth          | JWT (jose, HttpOnly cookie) + bcryptjs        |

### Architecture

The repository is a Turborepo monorepo with two deployable Next.js applications and a set of shared packages:

- **`apps/web`** (port 3000) — Public website. Serves the course catalog, teacher directory, about page, contact form, and the student booking form.
- **`apps/admin`** (port 3001) — Admin panel. Protected by JWT auth. Manages courses, teachers, bookings, media, banners, testimonials, features, about sections, notifications, logs, and site configuration.

Shared code lives in `packages/`:

- **`packages/db`** — Drizzle schema, client, migrations, and query helpers.
- **`packages/cache`** — Redis client, per-entity cache methods, and a fixed-window rate limiter.
- **`packages/config`** — Shared constants, site metadata, Zod validations, icons, and utility functions.
- **`packages/email`** — Resend client and React Email templates (booking confirmation + admin new-booking alert).
- **`packages/react-query`** — Shared TanStack React Query setup.

### Authentication

Admin authentication is entirely in-house — no third-party provider. Admins sign in with email and password; the server hashes passwords with bcryptjs and issues a JWT (signed with `jose`) stored in an HttpOnly cookie. All admin routes verify the token server-side. Redis-backed rate limiting is applied per endpoint to mitigate brute-force attempts.

### Course Model

Each course belongs to a **category** and is assembled from ordered **detail sections**. Section types:

- `text` — Rich prose block
- `accordion` — Collapsible FAQ or outline
- `image` — Standalone image asset
- `grid` — Multi-column card layout

Multiple **teachers** can be assigned to a course via a join table. Courses and categories carry an `isActive` flag so drafts can be prepared without going live.

### Booking Flow

A student submits a booking from the public site with: name, email, phone, age, gender, country, experience level, desired course, and optional teacher preference. The booking lands in the database with `isActive: false` (pending review). On submission:

1. The student receives a **booking-confirmation email** via Resend.
2. The admin receives a **new-booking alert email** with full details.
3. An **in-app notification** is created in the admin panel.

Admins review bookings in the dashboard and activate or manage them from there.

### Media & File Uploads

All file assets (course images, teacher photos/videos, testimonial avatars, banners, feature images, log archives) are stored via **UploadThing** and referenced by key in the database. Accepted formats include WEBP, WEBM, WAV, MP3, PDF, DOCX, PPTX, and XLSX (up to 200 MB). The media library in the admin panel provides a centralized view with type filtering.

### Automated Jobs

A cron endpoint runs on a schedule to handle log maintenance:

1. **Archive logs** — Compresses activity-log entries older than the configured retention window into a file, uploads it to UploadThing, records the archive in the database, and purges the source entries from Redis.

The cron endpoint requires a `Bearer` token matching `CRON_SECRET` for authorization.

### Email

Emails are sent via the Resend API using React Email templates. Two templates are shipped:

- **Booking confirmation** — Sent to the student with their course and teacher details.
- **Admin new-booking alert** — Sent to the configured `ADMIN_EMAIL` address when a booking arrives.

## Getting Started

### Prerequisites

- Bun 1.x+
- PostgreSQL database
- Redis instance
- UploadThing account
- Resend account (optional for local dev — logs to console if key is absent)

### Installation

```bash
bun install
```

### Environment Variables

Both apps require `.env` files. Create them at their respective roots:

**`apps/web/.env`**

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379

RESEND_API_KEY=re_...
EMAIL_FROM=no-reply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_URL=http://localhost:3001

NEXT_PUBLIC_UPLOADTHING_BUCKET_ID=your-bucket-id

# Optional
NEXT_PUBLIC_DEPLOYMENT_URL=https://yourapp.com
```

**`apps/admin/.env`**

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379

UPLOADTHING_TOKEN=your-uploadthing-token

JWT_SECRET=your-secret-key-at-least-32-characters
CRON_SECRET=your-cron-auth-token-at-least-16-characters

NEXT_PUBLIC_UPLOADTHING_BUCKET_ID=your-bucket-id

# Optional
NEXT_PUBLIC_DEPLOYMENT_URL=https://youradmin.com
```

### Database

Run migrations to set up the schema:

```bash
bun run db:mig
```

### Development

Start both apps concurrently with Turborepo:

```bash
bun run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3001](http://localhost:3001)

### Email Preview

Preview React Email templates locally:

```bash
bun run email:dev
```

### Production

```bash
bun run build
bun run start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🌐 Contact

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/itsdrvgo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/itsdrvgo)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?logo=Twitch&logoColor=white)](https://twitch.tv/itsdrvgo)
[![X](https://img.shields.io/badge/X-%23000000.svg?logo=X&logoColor=white)](https://x.com/itsdrvgo)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@itsdrvgodev)
