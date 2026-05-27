 Center of Excellence - Tangible (COE-Tangible)

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


## Project Structure

- `src/components`: UI components, 3D Machine Viewer, Control Panels, and custom 3D machine models.
- `src/pages`: Top-level page views (`Auth`, `Index`, `LandingPage`, `Research`, `NotFound`).
- `src/data`: Data definitions and static structures for the electrical machines.
- `src/lib`: Utilities, theme initializers, and Supabase client configuration.
- `src/hooks`: Custom React hooks for responsive design and UI feedback.
- `supabase`: Contains backend edge functions and configurations.
- `public`: Static assets, model videos, and fonts.

 Contributing

##Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

This project is private and proprietary.


