# Web App

Public website application for AVAD.

## Implemented Pages

- / (Home)
- /videos
- /auth/sign-in
- /auth/sign-up
- /auth/admin/register
- /auth/forgot-password
- /auth/verify-code
- /auth/verify-email
- /auth/reset-password
- /auth/change-password
- /dashboard
- /dashboard/users
- /dashboard/users/invite
- /dashboard/blogs
- /dashboard/videos
- /dashboard/settings

## Key Implementation Details

- App Router with Server Components by default.
- Feature-based modules in features/home and features/videos.
- Reusable cards and UI primitives in components/cards and components/ui.
- Global public layout with shared navbar and footer.
- Public home/videos pages now fetch video cards from API data, including recommended-only home video section.
- Dashboard videos supports syncing from YouTube, recommending videos, and creating playlists.
- The homepage hero video uses the configured `NEXT_PUBLIC_HOME_HERO_YOUTUBE_ID` and does not fetch the latest YouTube feed.
- Dashboard and auth route access is protected by Next.js proxy.ts role guards.
- Frontend auth and user actions are proxied through app/api route handlers.

## Environment

Use apps/web/.env.example as reference.

Homepage hero configuration:

- NEXT_PUBLIC_HOME_HERO_YOUTUBE_ID

Optional YouTube feed fallback configuration for the videos page:

- YOUTUBE_CHANNEL_ID
- NEXT_PUBLIC_FALLBACK_YOUTUBE_EMBED

## Commands

From the monorepo root:

```bash
pnpm dev
pnpm lint
pnpm typecheck
```
