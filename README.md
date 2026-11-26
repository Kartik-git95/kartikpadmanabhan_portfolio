# KARTIK OS — a portfolio that boots like a computer

Kartik Padmanabhan's portfolio reimagined as a retro CRT operating system.
Visitors watch a BIOS boot sequence, then explore the desktop: draggable
windows, a taskbar, a start menu, and a real terminal they can type commands
into. Pure HTML/CSS/JS — no frameworks, no build step, perfect for GitHub
Pages.

## Files

| File       | Purpose                                        |
|------------|------------------------------------------------|
| index.html | All window content (about, projects, skills…) |
| style.css  | CRT themes (phosphor green / amber), layouts   |
| script.js  | Window manager, terminal, boot, easter eggs    |
| README.md  | This guide                                     |

## Deploy to GitHub Pages

1. Commit these files to your repo (root of `main`).
2. Repo → Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save.
3. Live at `https://<username>.github.io/<repo>/` in about a minute.

You can also just open `index.html` locally in any browser.

## How visitors use it

- Boot sequence plays (any key skips it) → desktop appears with terminal open
- One click on a desktop icon opens that app window
- Windows can be **dragged** (title bar), minimized, maximized (or double-click
  the title bar), and closed — they stack like a real OS
- The **terminal** accepts commands: `help`, `about`, `skills`, `projects`,
  `neofetch`, `socials`, `open projects`, `theme`, `clear`, `exit` …
- Right-click the desktop for a context menu; the Start menu has social links
- Taskbar clock is live; the theme button switches phosphor ↔ amber
- Easter eggs: try `sudo hire kartik`, `hack`, or click "end task" in skills
  or "EMPTY RECYCLE BIN" in the recycle bin

## Customize — everything is marked with `EDIT` comments

| What                | Where                                             |
|---------------------|---------------------------------------------------|
| Bio / about text    | index.html → `#win-about`                         |
| Skills + levels     | index.html → `#win-skills` rows (`data-cpu` 0-100)|
| Projects + links    | index.html → `#win-projects`                      |
| Education / certs   | index.html → `#win-education`                     |
| Social links        | index.html → search "github.com" etc.             |
| Email (form target) | script.js → `CONFIG.email`                        |
| Resume link         | script.js → `CONFIG.resume`                       |
| Terminal responses  | script.js → `COMMANDS` object                    |
| Boot messages       | script.js → `BOOT_LINES` array                   |
| Colors              | style.css → `:root` / `[data-theme="amber"]`     |
| Window sizes        | script.js → `APPS` object                        |

## Contact form

The form opens the visitor's email app (works with no backend). For direct
messages on GitHub Pages, create a free form at https://formspree.io and in
the submit handler in script.js replace the mailto block with a fetch POST
to your Formspree endpoint.

## Notes

- Fully responsive: on phones, windows open full-screen and icons become an
  app grid.
- Respects `prefers-reduced-motion` (skips boot animation + matrix rain).
- No emojis, no external images — icons are inline SVG, so nothing can break.
