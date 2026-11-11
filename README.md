# Kartik Padmanabhan — Portfolio Website

A modern, data-science themed personal portfolio built as a static site deployable on GitHub Pages.

## 🌐 Live Site
**https://kartik-git95.github.io/kartikpadmanabhan_portfolio/**

## ✨ Features

- **Dark/Light Theme** — System preference detection + manual toggle with localStorage persistence
- **Hero Scene** — Interactive Three.js particle/neural-network visualization reacting to mouse movement
- **Skills Radar** — Animated Chart.js radar chart showing proficiency across 5 categories
- **Project Visualizations** —
  - ROC curve (Chart.js) for Churn Prediction project
  - Custom canvas crowd density simulation for Surveillance project
- **Animated Counters** — Real metrics: 0.912 ROC-AUC, 0.787 PR-AUC, 10.6 MAE, 8.05 CGPA, Top 12/60
- **Smooth Scrolling** — Lenis-powered smooth scroll with scroll progress indicator
- **Custom Cursor** — Desktop-only magnetic cursor with hover states
- **Fully Responsive** — Mobile-first, works from 320px to 4K
- **Accessible** — Semantic HTML5, ARIA labels, keyboard navigation, prefers-reduced-motion support
- **SEO Ready** — Open Graph, Twitter Cards, JSON-LD Person schema, canonical URLs

## 📁 Project Structure

```
├── index.html          # Main HTML (semantic, accessible, SEO-optimized)
├── css/
│   └── style.css       # 1200+ lines, CSS variables, dark/light themes, animations
├── js/
│   └── main.js         # Modular ES6: Three.js, Chart.js, Lenis, interactions
├── assets/
│   ├── kartikpadmanabhan_Resume.pdf  # Resume (98KB)
│   ├── favicon.svg       # SVG favicon with gradient
│   ├── og-image.svg      # Open Graph social card
│   ├── apple-touch-icon.png
│   └── manifest.json     # PWA manifest
└── README.md
```

## 🛠 Local Development

```bash
# Clone the repo
git clone https://github.com/Kartik-git95/kartikpadmanabhan_portfolio.git
cd kartikpadmanabhan_portfolio

# Start local server (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .

# Open http://localhost:8000
```

## 📝 Updating Content

### Resume
Replace `assets/kartikpadmanabhan_Resume.pdf` with your updated PDF. The download links in hero, navbar, and contact sections will automatically serve the new file.

### Projects
Edit the project cards in `index.html` (lines ~470-580):
- Update `[ADD LINK]` placeholders with real demo/GitHub URLs
- Modify descriptions, metrics, or tech stacks as needed

### Skills
Modify `SkillsData.categories` in `js/main.js` (lines ~15-40):
```javascript
{
  name: 'Category Name',
  icon: '<svg>...</svg>',
  skills: ['Skill 1', 'Skill 2', ...]
}
```

### Colors & Theme
Adjust CSS variables in `css/style.css` (lines 1-80):
```css
:root {
  --bg: #080b12;
  --accent-cyan: #22d3ee;
  --accent-violet: #a855f7;
  --accent-magenta: #f43f5e;
  --gradient-1: linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f43f5e 100%);
  /* ... */
}
```

### Typography
Change Google Fonts imports in `index.html` (lines 60-62) and font variables in CSS:
```css
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

## 🚀 Deployment

The site is configured for GitHub Pages deployment from the `main` branch root.

1. Push to `main` branch
2. GitHub Pages automatically builds and deploys
3. Live at: `https://kartik-git95.github.io/kartikpadmanabhan_portfolio/`

### Required GitHub Pages Settings
- **Source**: Deploy from a branch
- **Branch**: `main` / `(root)`
- **Custom domain**: (optional) Add your domain if needed

## 📋 Placeholders to Fill

| Location | Placeholder | Action |
|----------|-------------|--------|
| Project 1 (Churn) | `[ADD LINK] Live Demo` | Add Streamlit app URL |
| Project 1 (Churn) | `[ADD LINK] Source Code` | Add GitHub repo URL |
| Project 2 (Crowd) | `[ADD LINK] Live Demo` | Add Flask dashboard URL |
| Project 2 (Crowd) | `[ADD LINK] Source Code` | Add GitHub repo URL |
| Contact Form | `your-form-id` | Create Formspree form and update `action` attribute |

## ⚠️ Known Issues / Notes

1. **GitHub Username Mismatch**: The resume PDF lists `github.com/Kartik-95` but the actual username is `Kartik-git95`. The website uses the correct `Kartik-git95`. Update the resume PDF to fix this.

2. **Phone Number**: Not displayed on the public site (privacy). Only email and LinkedIn are shown.

3. **Formspree Form**: The contact form uses a placeholder endpoint. Create a free Formspree form at https://formspree.io and update the `action` attribute in `index.html`.

4. **Heavy Assets**: Three.js hero canvas may impact mobile performance. `prefers-reduced-motion` disables animations for users who prefer it.

## 📊 Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, Grid/Flexbox, animations, glassmorphism
- **JavaScript (ES6+)** — Modular, no build step required
- **Three.js** — Hero particle/neural network visualization
- **Chart.js** — Skills radar + ROC curve
- **Lenis** — Smooth scrolling
- **GitHub Pages** — Static hosting

## 📄 License

MIT License — Feel free to use as inspiration for your own portfolio.

---

Built with Python, patience, and a bias-variance tradeoff.