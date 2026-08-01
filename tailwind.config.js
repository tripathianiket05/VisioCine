/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "secondary-container": "#00a572",
        "surface-variant": "#2e3447",
        "surface-bright": "#33394c",
        "on-secondary-fixed": "#002113",
        "primary": "#ffb3b6",
        "tertiary-fixed": "#ffddb8",
        "on-primary-container": "#fffaf9",
        "surface-container-low": "#151b2d",
        "inverse-surface": "#dce1fb",
        "on-tertiary": "#472a00",
        "surface": "#0c1324",
        "on-surface-variant": "#e5bdbe",
        "on-background": "#dce1fb",
        "error": "#ffb4ab",
        "secondary": "#4edea3",
        "on-primary-fixed": "#40000c",
        "surface-container-high": "#23293c",
        "on-secondary-fixed-variant": "#005236",
        "tertiary-fixed-dim": "#ffb95f",
        "on-secondary": "#003824",
        "outline": "#ac8889",
        "outline-variant": "#5c3f40",
        "tertiary": "#ffb95f",
        "surface-container-lowest": "#070d1f",
        "tertiary-container": "#a36700",
        "surface-tint": "#ffb3b6",
        "surface-dim": "#0c1324",
        "secondary-fixed-dim": "#4edea3",
        "on-tertiary-container": "#fffaf9",
        "on-tertiary-fixed": "#2a1700",
        "background": "#0c1324",
        "on-error": "#690005",
        "surface-container-highest": "#2e3447",
        "inverse-on-surface": "#2a3043",
        "on-surface": "#dce1fb",
        "primary-container": "#e11d48",
        "on-primary-fixed-variant": "#920028",
        "primary-fixed": "#ffdada",
        "primary-fixed-dim": "#ffb3b6",
        "on-tertiary-fixed-variant": "#653e00",
        "inverse-primary": "#be0037",
        "secondary-fixed": "#6ffbbe",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "on-secondary-container": "#00311f",
        "on-primary": "#68001a",
        "surface-container": "#191f31"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "margin-desktop": "48px",
        "gutter": "24px",
        "container-max": "1280px",
        "unit": "4px",
        "margin-mobile": "16px"
      },
      "fontFamily": {
        "headline-md": ["Geist"],
        "headline-lg": ["Geist"],
        "headline-lg-mobile": ["Geist"],
        "label-md": ["Geist"],
        "body-lg": ["Geist"],
        "display": ["Geist"],
        "body-md": ["Geist"]
      },
      "fontSize": {
        "headline-md": ["20px", { "lineHeight": "1.4", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "display": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "800" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/forms')
  ]
}
