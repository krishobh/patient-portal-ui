# Patient Portal

A Next.js application for patient management with login, patient selection, and patient details pages.

## Features

- **Login Page**: Authentication interface with admin/consultant selection
- **Patient Selection**: Grid view to select a patient from available patients
- **Patient Details**: Comprehensive patient page with:
  - Patient header with profile information
  - Therapist/consultant selection
  - Report types and reports list
  - Homework section
  - Notes section

## Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Static Export

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will create an `out` directory with static files ready for hosting.

## Project Structure

```
patient-portal/
├── src/
│   ├── components/
│   │   ├── patient/          # Patient-specific components
│   │   ├── ui/               # Reusable UI components
│   │   └── LoginTypeSelector.tsx
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utilities
│   ├── pages/                # Next.js pages
│   │   ├── login.tsx
│   │   ├── patient-selection.tsx
│   │   └── patient.tsx
│   └── styles/               # Global styles
├── public/                   # Static assets
└── package.json
```

## Pages

- `/login` - Login page
- `/patient-selection` - Patient selection page
- `/patient?patientId=<id>` - Patient details page (uses query parameters instead of dynamic routes)

## Technologies

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons

## Notes

- This application is configured for static export (`output: 'export'` in next.config.ts)
- No API calls are implemented - all data is mocked for UI demonstration
- The patient page uses query parameters (`?patientId=<id>`) instead of dynamic routes


