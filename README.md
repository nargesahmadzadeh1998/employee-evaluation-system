# Employee Evaluation System

A complete web application for evaluating new joiner employees with skills-based scoring, auto-evaluation suggestions, and reporting dashboards.

## Launch Instantly (One Click)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/nargesahmadzadeh1998/employee-evaluation-system?ref=claude/employee-evaluation-app-Q54wF&quickstart=1)

**That's it.** Click the button above, wait ~2 minutes for setup, and you'll get a live URL with the app running. The database seeds automatically.

**Login:** `admin@example.com` / `admin123`

---

## Features

- **Employee Management** — Add/edit employees with department grouping
- **Skills & Criteria** — Define evaluation skills with sub-criteria, assign to job titles
- **Scoring System** — Department-based scoring grid with per-criterion modal evaluation (1-5 + N/A)
- **Auto Evaluation** — System suggestions: Best fit / Good fit / Needs improvement / Not fit
- **Reporting Dashboard** — Charts, filters by department and evaluation category
- **Role-based Auth** — Admin and Evaluator roles with department-level access control
- **Team Management** — Invite users via secure links with role and department assignment
- **User Profiles** — Edit name, phone, job title, password

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **UI:** Tailwind CSS
- **Charts:** Recharts

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Evaluator | evaluator@example.com | eval123 |

## Local Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```
