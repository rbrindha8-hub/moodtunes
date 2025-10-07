# MoodTunes - AI-Powered Music Generation App

## Overview

MoodTunes is a full-stack web application that transforms user emotions into personalized music using AI-powered composition. Users can analyze their mood through text input or manual selection, then generate custom music tracks that match their emotional state. The app features real-time audio generation, playback controls, and a history system to track previously created compositions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server with HMR support
- **Tailwind CSS** with shadcn/ui components for consistent, responsive design
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query** for server state management and API caching
- **Tone.js** for real-time audio synthesis and music generation
- **Web Audio API** integration for advanced audio processing and playback

### Backend Architecture
- **Express.js** server with TypeScript for REST API endpoints
- **In-memory storage** with interface-based design for easy database migration
- **Modular route handling** with centralized error handling middleware
- **Development-optimized** with Vite middleware integration and request logging

### Audio Processing System
- **Real-time audio synthesis** using Tone.js synthesizers (triangle, sawtooth, sine waves)
- **Procedural music generation** based on mood parameters (tempo, key, scale, rhythm)
- **Dynamic audio effects** including reverb, delay, and filtering
- **AudioBuffer management** for seamless playback and audio manipulation

### Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL with type-safe schema definitions
- **Database schema** includes users, music tracks, and mood analyses tables
- **Memory storage adapter** for development with easy PostgreSQL migration path
- **UUID-based primary keys** with automatic timestamp tracking

### Mood Analysis Engine
- **Keyword-based mood detection** using predefined emotional vocabularies
- **Text analysis algorithms** that score content against 10 different mood categories
- **Confidence scoring system** with fallback logic for ambiguous inputs
- **Mood-to-music parameter mapping** for consistent audio generation

### UI Component System
- **shadcn/ui component library** with Radix UI primitives for accessibility
- **Design system** with CSS custom properties for theming and mood-based colors
- **Responsive layout patterns** optimized for desktop and mobile experiences
- **Interactive audio controls** with custom sliders, progress bars, and playback buttons

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with schema validation and migration support
- **express**: Web framework for REST API development
- **vite**: Build tool with fast development server and optimized production builds

### Audio Processing Libraries
- **tone**: Web Audio API wrapper for music synthesis and audio effects
- **Web Audio API**: Browser-native audio processing capabilities

### UI and Styling Libraries
- **@radix-ui/react-***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe CSS class composition utility
- **lucide-react**: Icon library with consistent SVG icons

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form**: Form state management with validation support
- **@hookform/resolvers**: Form validation resolver integration

### Development and Build Tools
- **typescript**: Static type checking for enhanced development experience
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for development server
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### Database and Schema Management
- **drizzle-kit**: Database schema migration and management CLI
- **drizzle-zod**: Zod integration for runtime schema validation
- **zod**: TypeScript schema validation library