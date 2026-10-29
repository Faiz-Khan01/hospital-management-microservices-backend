# Hospital Management Frontend

React and Vite frontend for the Hospital Management System. The application provides authenticated dashboards and operational modules for patients, doctors, appointments, prescriptions, billing, admissions, laboratory workflows, pharmacy, payments, and settings.

## Requirements

- Node.js 18+
- npm
- A running backend API or configured mock-data fallback

## Getting Started

```bash
npm install
npm run dev
```

The frontend uses `http://localhost:8080/api/v1` by default. To point it at another gateway, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Production Build

```bash
npm run build
npm run preview
```

## Frontend Performance

- Feature modules are loaded with `React.lazy` and `Suspense`, so large screens are downloaded only when opened.
- Patient, doctor, and appointment lists use reusable client-side pagination.
- Search and filter changes reset the list to page one.
- Pagination displays the current range and disables navigation at the first and last pages.

## Validation

```bash
npm run build
npm run lint
```

`npm run build` is the production validation command. The repository currently contains some pre-existing ESLint findings in unrelated components; build validation must pass before deployment.
