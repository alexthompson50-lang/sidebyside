# Lyman vs. Maloy Campaign Comparison Card

An editable campaign comparison card. Double-click any text to edit it inline. Click photos to replace them. Print directly from the browser as a landscape PDF.

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repo
4. Vercel auto-detects Create React App — just click **Deploy**

That's it. Your editor will be live at a public URL.

## How to Edit

- **Double-click** any text to edit it inline
- **Click a photo** to upload a replacement image
- **Bold phrase** fields (shown in small text below each row) control which phrase appears highlighted in that cell
- **Add Row** button adds a new comparison row at the bottom
- **Remove Row** (the ✕ button on each row) deletes that row
- **Print / Save PDF** triggers the browser print dialog — choose "Save as PDF" and set paper to Landscape

## Customizing Colors

Colors are defined as constants at the top of `src/App.js`. Search for `const NAVY` to find them.
