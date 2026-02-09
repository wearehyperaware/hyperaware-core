# Hyperaware — Visualization Demo

> **This is an illustrative demo only.** The codebase is deprecated and exists solely to demonstrate the core concept of Hyperaware: real-time geospatial vehicle tracking with automated congestion zone detection and charging.

## What This Shows

A single vehicle animates smoothly along a real London route (LineString), passing through congestion zones. When the vehicle enters a zone it activates (turns red), stays active while inside, and deactivates on exit. Toast notifications display on entry/exit events.

This is the *concept* — the underlying code (IoTeX/Web3 contracts, socket architecture, React class components) is legacy and will be rebuilt on the [Astral SDK](https://github.com/AstralProtocol).

## Running the Demo

```
npm install
npm run dev-mock
```

Open [http://localhost:3000](http://localhost:3000). Use **PLAY** to animate the vehicle through the route, **ADVANCE** to step through one segment at a time, and **PAUSE** to stop.

## What You're Seeing

- **Map**: Mapbox GL rendering of London with congestion zone overlays
- **Vehicle**: Blue dot animating along a LineString route using Turf.js interpolation
- **Zone detection**: Client-side point-in-polygon check — dot turns red inside zones
- **Notifications**: Ethereum-style toasts on zone entry/exit
- **Panels**: Zone and vehicle statistics (placeholder data)

## Status

This code is **not under active development**. It serves as a reference for the visualization pattern that will be re-implemented using Astral.
