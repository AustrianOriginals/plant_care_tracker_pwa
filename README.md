# Plant Care App
An offline-first plant care tracker focused on **reliable scheduling**, **data privacy**, and a **mobile-first** experience.

The app helps users track plant care schedules by calculating watering, fertilizing, and repotting intervals based on multiple plant-specific factors such as:
- plant type
- pot size
- sunlight exposure
- plant size
- watering history

The scheduling system dynamically adapts to user behavior and environmental changes.
For example:
- early watering adjusts future watering intervals
- increased heat exposure can shorten predicted watering cycles
- user activity continuously influences reminder calculations

> Status: Paused development due to exam season

> Planned first public release: Q3 2026

> The project evolved from an earlier prototype and is currently being rebuilt as a Progressive Web App using React and TypeScript.

## Placeholder Screenshots

## Placeholder Architecture Diagram

## Tech Stack
**Frontend**
- React + TypeScript
- Vite

**UI**
- Tailwind CSS
- shadcn/ui

**State & Data**
- Zustand (local app state)
- Dexie.js (IndexedDB persistence, offline-first)
- Zod (runtime validation / schemas)
- React Hook Form (forms + validation integration)

**PWA / Offline**
- vite-plugin-pwa (Service Worker, caching, installability)

## Features
### Planned Features
- plant creation and management
- adaptive watering calculations
- fertilizing reminders
- repotting schedules
- local encrypted storage
- priority-based plant overview
- offline-first architecture
- mobile push notifications
- plant artwork / illustrations
- advanced environmental adjustments
- optional cloud synchronization

## Technical Focus
This project focuses heavily on:
- maintainable code structure
- modular architecture
- practical performance
- user data protection
- offline reliability
- long-term extensibility
