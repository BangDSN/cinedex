This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# CINEDEX: ARCHIVE & INDEXING PROTOCOL

Cinedex is a high-performance movie indexing platform and personal discovery engine. It is engineered for enthusiasts who require a sophisticated, data-driven interface to manage, rate, and explore global cinema.

**Live Deployment:** [https://cinedex-mauve.vercel.app/](https://cinedex-mauve.vercel.app/)

---

## PROJECT VISION
In a landscape of fragmented streaming services, Cinedex centralizes the cinematic experience. The platform utilizes a minimalist, high-contrast UI to prioritize metadata and visual assets. The core objective is to provide a "System OS" feel for film collections—merging technical database functionality with a premium gallery aesthetic.

## TECHNICAL SPECIFICATIONS
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS (Responsive Utility-First Architecture)
* **API Integration:** The Movie Database (TMDB) REST API
* **Deployment:** Vercel Production Environment
* **Database/Auth:** Supabase (Development Phase: Integration Pending)

## SYSTEM FEATURES
* **The Dex Profile:** A dedicated user environment for tracking "Watch Protocols," total engagement hours, and score distribution metrics.
* **Archive Discovery:** A comprehensive filtering engine allowing users to query the global database by genre, user rating, and release chronology.
* **Terminal Search:** A global indexing tool accessible via the `/` hotkey for instant retrieval of movie metadata.
* **Responsive Scaling:** Optimized viewport configurations ensuring a consistent professional experience across desktop and mobile hardware.

## DIRECTORY ARCHITECTURE
* `/app`: Root routing and core page logic.
* `/app/archive`: Discovery engine and genre-based filtering protocols.
* `/app/dex`: User-specific metrics and the "Top 10" data vault.
* `/app/components`: Modular UI components, including the Search Overlay and Navigation systems.

---

## DEVELOPMENT ROADMAP
Current Status: **Phase 2 (Standardization & Terminology Sync)**

* **Phase 3:** Supabase Authentication and User Session Management.
* **Phase 4:** Real-time PostgreSQL integration for dynamic "Top 10" and "Watchlist" updates.
* **Phase 5:** Enhanced Metadata linking for Actor and Director filmographies.

*Developed by BangDSN • 2026*