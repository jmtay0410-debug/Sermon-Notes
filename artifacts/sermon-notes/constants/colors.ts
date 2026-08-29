/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#25302B',
    tint: '#53715B',

    // Core surfaces
    background: '#F8F7F2',
    foreground: '#25302B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#25302B',

    // Primary action color (buttons, links, active states)
    primary: '#53715B',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E9EEE8',
    secondaryForeground: '#36503D',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF0EB',
    mutedForeground: '#728078',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E8D8B5',
    accentForeground: '#705A32',

    // Destructive actions (delete, error states)
    destructive: '#B85C4A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DDE3DC',
    input: '#D2DAD2',
  },
  dark: {
    text: '#F2F3EC',
    tint: '#A9C3A7',
    background: '#1B211D',
    foreground: '#F2F3EC',
    card: '#252D27',
    cardForeground: '#F2F3EC',
    primary: '#A9C3A7',
    primaryForeground: '#1B211D',
    secondary: '#2F3C32',
    secondaryForeground: '#D7E4D5',
    muted: '#29332C',
    mutedForeground: '#A8B5AA',
    accent: '#8E7A4E',
    accentForeground: '#FFF7DC',
    destructive: '#D47A68',
    destructiveForeground: '#1B211D',
    border: '#3B493E',
    input: '#435246',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
