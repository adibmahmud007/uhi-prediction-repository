# Urban Heat Analytics landing page

[Outcrowd’s Dribbble shot](https://dribbble.com/shots/26742281-Website-for-an-Incident-Management-Platform) is the motion reference. The inspection used a full-page capture and sampled the 15-second showcase at the hero-to-content transition, the feature sections, and the closing CTA. [Reference poster](https://cdn.dribbble.com/userupload/45607569/file/still-2dcab65931e7307811c93c646a1133f6.png) · [Reference motion clip](https://cdn.dribbble.com/userupload/45607569/file/large-21d6ac304de5c3829a68f0e508ccd0b8.mp4)

The reference shows a dark canvas, luminous blue accents, translucent product panels and space between sections as the viewport moves. Exact fonts, breakpoints, and easing curves were not inferred from the clip.

## Landing design

| Role | Implementation |
| --- | --- |
| Backdrop | Deep navy `#050c18` with a moving starfield and the existing NASA Blue Marble Earth texture |
| Typography | Public Sans, large tightly tracked headings, and blue-gray supporting text |
| Accents | Sky blue `#8fdefe` for actions and orange to red for thermal values |
| Glass surfaces | Translucent navy, a thin blue-gray border, and a soft backdrop blur |
| Layout | Header-free full-height hero, dashboard CTA on the right, and stacked content in narrow viewports |

The next sections explain heat indicators, demonstrate an LST/UHI reading, walk through a prediction, and answer common questions. The example values come from the dashboard’s illustrative data.

## Motion

- Earth rotates slowly at rest. Scrolling adds rotation and lowers the Earth and Moon together while the stars move at a different rate.
- Content reveals as it enters the viewport. The dashboard CTA transitions to `/dashboard`, with a fade fallback when native view transitions are unavailable.
- Reduced-motion mode uses a stationary scene, visible sections, and direct navigation.
