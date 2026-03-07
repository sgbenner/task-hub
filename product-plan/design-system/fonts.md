# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or global CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** Inter — section titles, card headers, modal headings
- **Body text:** Inter — all UI text, labels, descriptions, navigation
- **Code/technical:** JetBrains Mono — any code display, API keys, technical identifiers

## CSS Variables

```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

## Tailwind Usage

```
font-['Inter',sans-serif]      /* apply Inter */
font-['JetBrains_Mono',monospace]  /* apply JetBrains Mono */
```

Or configure in your Tailwind setup:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    }
  }
}
```
