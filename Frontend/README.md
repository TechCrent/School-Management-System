# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7e113c58-83ac-43fe-ba61-7b9f0f35ef30

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7e113c58-83ac-43fe-ba61-7b9f0f35ef30) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7e113c58-83ac-43fe-ba61-7b9f0f35ef30) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Project Architecture

- **src/hooks/**: Custom React hooks (e.g., theme, toast, mobile detection)
- **src/components/**: UI and layout components, organized by type and feature
- **src/pages/**: Page-level components for routing
- **src/api/**: API utilities for backend communication
- **src/data/**: Mock/sample data for development
- **src/lib/**: Utility functions
- **public/**: Static assets

## Testing

This project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration tests.

- To run tests: `npm test`
- Test files should be named `*.test.tsx` or `*.test.ts` and placed next to the code they test.

## Accessibility (a11y)

- UI components are designed with accessibility in mind (focus management, ARIA attributes, keyboard navigation).
- Please use [axe](https://www.deque.com/axe/) or [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) to check for accessibility issues.
- Contributions to improve a11y are welcome!

## Contribution Guidelines

1. Fork the repository and create a new branch for your feature or fix.
2. Write clear, descriptive commit messages.
3. Add or update tests for your changes.
4. Ensure all tests and linter checks pass before submitting a pull request.
5. For UI changes, check accessibility and add documentation if needed.

---

For questions or suggestions, please open an issue or start a discussion.
