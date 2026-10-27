<div align="center">
  <img src="public/logo-main.png" alt="Urban Heat Island Analytics logo" width="100" />

  <h1>Urban Heat Island Analytics</h1>

  <p>A dashboard interface for exploring urban heat and environmental indicators in Dhaka and Sylhet.</p>

  <p><strong>React 18 · Vite 5 · Tailwind CSS 4 · React Router 6</strong></p>

  <p>
    <a href="#getting-started">Getting started</a> ·
    <a href="#dashboard-experience">Dashboard</a> ·
    <a href="#project-structure">Project structure</a> ·
    <a href="#customization">Customization</a>
  </p>
</div>

---

## Overview

Urban Heat Island Analytics provides a responsive interface for presenting land surface temperature (LST), urban heat island (UHI) intensity, heat exposure, and environmental coverage. It brings key indicators, scenario controls, and dedicated analysis routes into one workspace.

> [!NOTE]
> This repository currently contains a frontend prototype. KPI values are static examples, most charts and detail views are placeholders, and the **Run prediction** button is a UI control without a prediction handler. The home-page LST card contains an interactive basemap, but no backend, trained model, or predicted temperature layer is connected. Changing location recenters the map; changing filters does not recalculate the summary metrics.

## Dashboard experience

- **Six summary cards** with distinct icons, clear units, and coordinated accents.
- **An interactive home-page map** with a visual layer picker, five map types, zoom controls, city reset, and optional current traffic.
- **Prediction controls** for location, date, temporal scale, and climate scenario.
- **A dark header** with a light control palette and a blue–indigo action gradient.
- **An animated navigation drawer** with grouped links, active-route highlighting, and a scrollable menu with a hidden scrollbar.
- **Responsive layouts** for mobile and desktop, using the Public Sans font.
- **Dedicated detail routes** with space for future visualizations, analysis, and comparisons.
- **Interaction details** including labeled inputs, keyboard focus indicators, Escape-to-close navigation, and reduced-motion styles.

### Key indicators

| Indicator | Example value | Description |
| --- | --- | --- |
| Predicted LST | 36.8 °C | Land surface temperature |
| UHI intensity | +4.2 °C | Urban–rural temperature gap |
| Hotspot area | 128.4 km² | Area affected by heat hotspots |
| High-risk population | 1.24 million | People exposed to high heat |
| Vegetation cover | 18.6% | Share of land with vegetation |
| Water bodies | 6.3% | Share of land covered by water |

### Filter options

| Control | Available options |
| --- | --- |
| Location | Dhaka, Sylhet |
| Prediction date | January 1, 2026 – December 31, 2050 |
| Temporal scale | Daily, Monthly, Yearly |
| Scenario | SSP2-4.5, SSP5-8.5 |

### Analysis sections

The dashboard and sidebar link to eight analysis views: **Predicted LST Map**, **UHI Intensity Map**, **Heat-Risk Distribution**, **LST Trend**, **Seasonal Comparison**, **Environmental Factors**, **Hotspot Evolution**, and **Recommendations**. These views currently provide layout placeholders for future content.

## Getting started

Install Node.js and npm before running the project. Vite 5 requires Node.js `^18.0.0 || >=20.0.0`; use a maintained Node.js release compatible with that range.

```bash
git clone https://github.com/adibmahmud007/uhi-prediction-repository.git
cd uhi-prediction-repository
npm ci
npm run dev
```

Open the local URL printed by Vite in your terminal, usually `http://localhost:5173`.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the dependency versions recorded in `package-lock.json` |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the production build in `dist/` |
| `npm run preview` | Preview an existing production build locally |

To check the production version locally:

```bash
npm run build
npm run preview
```

No environment variables or API keys are required for the current prototype.

### Interactive thermal previews

The home page presents equal-width **Predicted LST**, **UHI Intensity**, and **LST Trend** cards in its primary analysis row. The LST and UHI cards show Bangladesh with Dhaka District highlighted, plus a detailed zoomed view containing 20 numbered monitoring points. Select a point such as Mirpur to open its land surface temperature, air temperature, and UHI intensity in a compact map popup. Zoom controls move between the country, district, and monitoring-point views; after zooming, drag the map to pan in any direction. The Bangladesh overview shrinks as the main map zooms and marks the visible viewport. District boundaries come from [geoBoundaries](https://www.geoboundaries.org/) (Bangladesh ADM2, CC BY 3.0 IGO; source: Bangladesh Bureau of Statistics and OCHA ROAP).

The values are intentionally marked as demonstration data. They do not represent satellite observations or model results yet. The interaction and layout are ready to receive Google Earth Engine or prediction-model outputs later.

## Project structure

```text
public/                     Logos and favicon assets
src/
  components/
    Card.jsx                Shared content container
    FilterBar.jsx           Location, date, scale, and scenario controls
    KpiCard.jsx             Summary metric presentation
    LstMap.jsx              Interactive basemap and optional traffic overlay
    MapLayerPicker.jsx      Visual map-type selector
    Sidebar.jsx             Navigation drawer and active-route styling
  pages/
    Home.jsx                Dashboard overview and widget grid
    Detail.jsx              Shared detail-page layout
  App.jsx                   Header, application layout, and routes
  config.js                 KPI values, widgets, and filter options
  context.jsx               Shared filter state and initial selections
  index.css                 Theme settings and shared styles
  main.jsx                  Application entry point and providers
  mapLayers.js              Map providers, attribution, and traffic tile URLs
  trafficCoverage.js        Visible traffic tile coverage detection
  hooks/
    useMapLocation.js       Browser location watch and blue-dot controls
index.html                  HTML entry point and font loading
vite.config.js              React and Tailwind build configuration
```

## Customization

| To change… | Edit… |
| --- | --- |
| Metric labels, values, units, and icons | `KPIS` in `src/config.js` |
| Widget titles, routes, descriptions, and grid spans | `WIDGETS` in `src/config.js` |
| Cities, temporal scales, and scenarios | `CITIES`, `SCALES`, and `SCENARIOS` in `src/config.js` |
| City map centers and initial zoom | `CITIES` in `src/config.js` |
| Map providers and tile URLs | `src/mapLayers.js` |
| Map controls and traffic refresh behavior | `src/components/LstMap.jsx` |
| Map-type picker layout | `src/components/MapLayerPicker.jsx` |
| Initial filter selections | `src/context.jsx` |
| KPI accent palettes and card layout | `src/components/KpiCard.jsx` |
| Header branding and layout | `src/App.jsx` |
| Navigation styling | `src/components/Sidebar.jsx` |
| Theme colors and font family | `src/index.css` |
| Logos and favicons | `public/` |

The interface uses native date and select controls, Lucide icons, and React Context for filter state. Public Sans loads through Google Fonts; system fonts act as the fallback.

## Hosting

The production output is a static site in `dist/`. Configure your host to serve `index.html` for application routes so refreshing a detail page works with React Router's `BrowserRouter`.

`node_modules/`, `dist/`, local environment files, and editor settings are excluded from Git through `.gitignore`.
