# Assets Folder

This folder contains all static assets for the application.

## Structure

- `images/` - All image files (SVG, PNG, JPG, etc.)
  - Place chess illustrations and other images here
  - Example: `chess-illustration.svg`

- `icons/` - Icon files (SVG icons, favicons, etc.)
  - Place icon files here
  - Example: `chess-piece-icon.svg`

## Usage in Code

To reference assets in your components, use paths relative to the `public` folder:

```tsx
import Image from 'next/image'

<Image
  src="/assets/images/chess-illustration.svg"
  alt="Chess illustration"
  width={500}
  height={500}
/>
```

Or for icons:

```tsx
<img src="/assets/icons/icon.svg" alt="Icon" />
```

