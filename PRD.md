# Coding Club Website for IIT Jammu

## Executive Summary and Objective

The IIT Jammu Coding Club Platform is the official, centralized web application for the institute's developer ecosystem. It serves a dual purpose: acting as a public-facing portfolio to showcase the technical prowess of IIT Jammu students to the world, and functioning as an internal, gamified hub to track, motivate, and manage club members. The platform will launch as a complete, fully featured ecosystem for the 2026-2027 academic session, driving engagement through a proprietary point system called **JmX**.

## User Roles & Access Control (RBAC)

The platform is divided into a public-facing global view and a secure internal portal. Internal access is strictly gated via Google OAuth, accepting only ```@iitjammu.ac.in``` email addresses.

### Public View (Hero Section)

* **Target Audience**: General Public, Alumni, Recruiters, and Prospective Students.

* **Permissions**: Read-only access to the institute/club overview, major upcoming events, the global verified project showcase, and top-tier leaderboard standings.

### Internal Authenticated Roles

* **Student/Member**: Can view internal events, mark attendance, submit independent projects for verification, post on the Collaborator Board, track personal JmX, and view all granular leaderboards.

* **Field Specialist (Domain Lead)**: Manages specific technical branches (CP, AI, Web Dev, Cybersecurity, Game Dev). Has the authority to review, approve, or reject independent project submissions within their respective domain.

* **Co-Manager/Technical Secretary**: Possesses administrative privileges to create and manage events, assign platform roles, trigger the dynamic attendance systems, and oversee the global state of the platform.

## Core Features & Workflows

### The Student Profile

Each authenticated student receives a dynamic developer profile acting as their digital identity on campus.

* **Automated Data Pulls**: Integrates external handles (GitHub, LeetCode, Codeforces, Kaggle, TryHackMe) to pull live stats.

* **Club History**: Displays the student's current role, total accumulated JmX, attended events, and verified project builds.

* **Settings & Account Binding**: A dedicated settings portal where students can upload profile pictures, update bio details, and manually bind external accounts (like CodeForces, LeetCode, or GitHub). This ensures that even if their external accounts are registered under personal Gmail addresses, the backend can still fetch their stats and map them to their official institute ID for JmX calculation.

### Event Management & Anti-Proxy Attendance

Admins can spin up dedicated pages for upcoming hackathons and workshops, complete with registration tracking and image galleries. To definitively curb proxy attendance, the system mandates a dynamic verification method:

* **Dynamic Token Verification**: During an event, the admin dashboard projects a Time-Based One-Time Password (TOTP) or a rotating QR code that regenerates every 30 to 60 seconds.

* **Validation**: Students must log into their own accounts on their devices and submit the live token. The backend verifies the token's timestamp, making it impossible to mark attendance via screenshots shared to hostels.

### Project Showcase & Verification System

To maintain a high-quality public showcase without bottlenecking student momentum, project publishing utilizes a hybrid pipeline:

* **Tier 1(Event Projects)**: Projects built under supervision during official club hackathons are auto-verified. They immediately hit the student's profile, award JmX, and populate the event's public showcase.

* **Tier 2(Independent Projects)**: Students building side projects submit a repository link and live demo. The project immediately appears on their personal profile as "Pending Verification."

* **Approval Routing**: The submission alerts the respective Field Specialist. Upon manual review and approval, the project is granted a "Verified" badge, earns JmX, and is pushed to the public global showcase.

### The Collaborator Board

A dedicated networking space within the platform where students can form teams.

* **Listings**: Members can post open "Looking for Teammate" requests, specifying the required tech stack (e.g., "Need a React dev for an AI hackathon") or domain expertise.

* **Discovery**: Allows freshers to easily integrate into active projects and prevents the isolation of talent.

### Notification & Alert System

To ensure seamless communication and rapid project verification, the platform features a dual-layer notification system:

* **In-App Notifications**: A notification bell in the navigation bar that alerts students of status changes (e.g., "Your project was approved" or "Someone replied to your Collaborator request").

* **Automated Emails**: Integration with an email service (e.g., Resend or SendGrid) to automatically dispatch emails. Examples include alerting a Field Specialist when a new project requires verification, or emailing a student when their project is approved or rejected.

## Gamification: The JmX Currency & Leaderboards

### The JmX Economy 

All technical and managerial contributions are quantified into a unified club currency called **JmX**. To prevent client-side manipulation, all JmX calculations, point awards, and API synchronizations are strictly handled on the server side.

| Action/Achievements             | Base JmX Reward                  |
|---------------------------------|----------------------------------|
| Validated Event Attendance      | +10 JmX                          |
| Organizing/Volunteering         | +150 JmX                         |
| Podium Finish in Hackathons     | +150 to +300 JmX                 |
| Verified Independent Project    | +100 JmX                         |
| API-Verified External Milestone | +100 JmX(per milestone unlocked) |

### Leaderboard Structure

Every leaderboard features a toggle to switch between an "Everyone" view and a "Juniors Only" view (restricted to first-year students) to maintain motivation across all batches.

* **Branch-Wise Boards**: Standings specifically for Competitive Programming, AI, Web Development, Cybersecurity, and Game Development. These are driven by external API integrations and domain-specific verified projects.

* **The Cumulative Board**: The ultimate campus ranking, aggregating a student's total JmX earned across all activities, management, and technical branches.

## UI/UX Design: Cinematic Scroll Animation

The website will completely avoid static, standard web layouts in favor of an immersive, cinematic experience.

* **Frame-by-Frame Animation**: The public-facing site will feature a continuous background sequence that animates dynamically as the user scrolls.

* **Glassmorphism UI**: Text, cards, and UI components will utilize translucent, blurred backgrounds to ensure the dynamic background animations remain visible.

* **Implementation Engine**: Achieved using Canvas-based frame rendering tied to scroll position, powered by animation libraries like GSAP (ScrollTrigger) to ensure smooth performance without stuttering.

## Technical Architecture

The application follows a strict decoupled architecture to ensure security and future server scalability.

* **Repository Structure**: The codebase is split into two distinct directories: ```/client``` (Frontend) and ```/server``` (Backend).

* **Frontend** (```/client```): Built with React.js (via Vite). It handles all UI/UX and routes.

* **Backend** (```/server```): Built with Node.js and Express. It acts as a secure REST API, executing all JmX calculations, rate limiting, and third-party API fetching.

* **Database**: Supabase (PostgreSQL), strictly accessed via the backend to prevent client-side exposure.

* **Future Server Readiness**: Both directories will be containerized using Docker. This ensures that if the institute provides a dedicated server (Physical or Cloud VPS like AWS/DigitalOcean) in the future, the application can be migrated and spun up instantly.

## Security, Compliance & Auditing

Security is the highest priority. A breach compromises the integrity of the JmX system and the privacy of the student body. The application must be hardened against manipulation and leaks.

### Strict Development Constrains

* **Zero Client-Side Trust**: All critical logic, specifically JmX calculations, role assignment, and attendance token validation, must execute exclusively on the server.

* **Rate Limiting**: The Sign-Up and Authentication endpoints must be strictly rate-limited to prevent automated bot attacks on the database.

* **Environment Variables**: No API keys (Supabase, GitHub, Codeforces, etc.) shall ever be exposed to the client bundle. They must remain strictly within .env.local server environments.

* **Data Privacy**: Personally Identifiable Information (PII) must never be transmitted to external analytics providers, third-party loggers, or exposed in unsanitized error messages.

* **Failsafe Error Handling**: The application must utilize comprehensive try/catch blocks and global error boundaries. Server errors must fail gracefully without revealing stack traces to the end user.

### Mandatory Pre-Deployment Audits

Before the platform is pushed to the production environment, the codebase must pass the following five mandatory security checks:

* **Secret Leak Prevention Audit**: Scanning all commits and client-side bundles to ensure zero credential exposure.

* **Personal Data Flow Audit**: Verifying that student emails and profile data are securely routed and never logged in plain text.

* **Pre-Deploy Production Audit**: A full staging run to test database connection limits, rate-limiter efficacy, and environment variable bindings.

* **Deep Security Audit for Complex Logic**: Manual code review of the RBAC middleware and the TOTP/Rotating QR attendance validation to ensure no bypass vulnerabilities exist.

* **Attacker's Perspective Review**: Simulating endpoint exploitation (e.g., attempting to manually POST a payload to increase JmX or spoof an approval request) to validate server-side rejections.

## Development Roadmap

To streamline development and ensure robust security testing, the build will follow a strict phased approach:

* **Phase 1: Frontend First**: The UI/UX, routing, and component architecture in the ```/client``` directory will be built first using mock data. This allows the design and user flow to be finalized early.

* **Phase 2: Backend and Security Integration**: Once the frontend is locked, the ```/server``` directory will be developed. The mock data will be replaced by secure API endpoints, rate limiters, and the Supabase database connection.