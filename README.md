# Center of Excellence - Tangible (COE-Tangible)

## Overview

**COE-Tangible** is an interactive, web-based 3D educational platform designed to help students, engineers, and researchers explore the inner workings of complex electrical machines. Featuring rich 3D visualization using `react-three-fiber`, this platform provides an immersive way to interact with electrical machine models, such as DC Generators, DC Motors, Induction Motors, and Transformers.

Users can view internal parts, study detailed parameters, explore machine formulas, and even upload and interact with their own custom 3D models (GLB/GLTF). 

## Features

- **Interactive 3D Machine Viewer:** Explore intricate 3D models of electrical machines in real-time.
- **Laboratory Simulation:** Adjust lab parameters and view real-time formulas and outputs via a reactive simulation panel.
- **Custom Model Upload:** Upload your own GLTF/GLB models to explore within the same environment.
- **Authentication System:** Integrated backend authentication powered by Supabase.
- **Research Section:** Explore underlying principles, operations, and theoretical foundations of electrical machines.
- **Responsive Dark/Light Mode:** Full integration with Tailwind dark mode for cross-device support and better UX.

## Tech Stack

This project is built using modern web development technologies:

- **Framework:** React 18 / TypeScript
- **Bundler:** Vite
- **3D Rendering & Animation:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling UI:** Tailwind CSS, Radix UI (shadcn/ui), Framer Motion
- **State Management:** Zustand, React Query
- **Routing:** React Router v6
- **Backend/Auth:** Supabase
- **Testing:** Playwright, Vitest

## Getting Started

### Prerequisites

You need `Node.js` (v18+) and your preferred package manager (`npm`, `yarn`, `pnpm`, or `bun`) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd coe-tangible
   ```

2. **Install Dependencies:**
   If using Bun:
   ```bash
   bun install
   ```
   Or using npm:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   You will need to connect the app to your Supabase backend. Create a `.env.local` file in the root of the project and add the necessary environment variables (e.g., Supabase keys).

4. **Run the Development Server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173` to see the application running.

## Project Structure

- `src/components`: UI components, 3D Machine Viewer, Control Panels, and custom 3D machine models.
- `src/pages`: Top-level page views (`Auth`, `Index`, `LandingPage`, `Research`, `NotFound`).
- `src/data`: Data definitions and static structures for the electrical machines.
- `src/lib`: Utilities, theme initializers, and Supabase client configuration.
- `src/hooks`: Custom React hooks for responsive design and UI feedback.
- `supabase`: Contains backend edge functions and configurations.
- `public`: Static assets, model videos, and fonts.

## Testing

The project uses Vitest for unit tests and Playwright for end-to-end tests. Run the test commands defined in `package.json`:

```bash
# Run unit tests
npm run test

# Run e2e tests
npx playwright test
```

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

This project is private and proprietary.

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

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
