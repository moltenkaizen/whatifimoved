# What If I Moved - Address Comparison Tool

A Vue.js application that helps you compare commute times from your current address and a potential new address to various destinations using the Google Maps API.

## Features

- Compare drive and walk times from multiple addresses
- Add multiple destinations (work, gym, etc.)
- Real-time distance and duration calculations
- Clean, responsive UI built with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Google Maps API key:
   - Copy `.env.example` to `.env`
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Enable the Distance Matrix API
   - Add your API key to `.env`

3. Update the Google Maps script in `index.html`:
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - Or use an environment variable in your build process

## Development

Run the development server:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm preview
```

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Lucide Vue Icons
- Google Maps Distance Matrix API
