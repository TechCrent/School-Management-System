# Developer Guide: School Management System

Welcome, developer! This guide will help you set up, run, test, and extend the School Management System.

---

## 1. Setup
- **Install dependencies:**
  ```bash
  npm install
  # or
  yarn install
  ```
- **Environment:**
  - Node.js 18+ recommended
  - Uses Vite for frontend, React, and Vitest for testing

## 2. Running the App
- **Start the frontend:**
  ```bash
  npm run dev
  # or
  yarn dev
  ```
- **Backend:** (if present, see backend/README.md)

## 3. Running Tests
- **Unit/Integration tests:**
  ```bash
  npm run test
  # or
  yarn test
  ```
- Tests are located alongside components/pages (e.g., `Students.test.tsx`).
- Uses Vitest and React Testing Library.

## 4. Code Structure
- `src/pages/` — Main pages (Dashboard, Students, Teachers, etc.)
- `src/components/` — Reusable UI components (modals, sidebar, forms, etc.)
- `src/data/` — Mock data for development
- `src/api/` — API calls (replace with real backend as needed)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions

## 5. Adding Features
- **Add a new page:** Create a file in `src/pages/` and add a route in `App.tsx`.
- **Add a new component:** Place it in `src/components/` and import where needed.
- **Add a new test:** Create a `.test.tsx` file next to the component/page.
- **Add a new sidebar link:** Update the navigation array in `Sidebar.tsx`.

## 6. Contributing
- Use clear, descriptive commit messages.
- Write or update tests for new features.
- Run `npm run lint` before pushing changes.
- Document new features in the appropriate guide.

## 7. Accessibility & Best Practices
- Use semantic HTML and ARIA attributes.
- Ensure all forms and navigation are keyboard accessible.
- Test color contrast and responsive design.

---

For more, see the User/Admin Guide or contact the project maintainer. 