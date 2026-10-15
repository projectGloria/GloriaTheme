# Changelog

## 1.0.8

- Add automatic `.cfg` language detection for Counter-Strike 2 console configs.
- Highlight commands and alias declarations, setting names, bind keys, strings, quoted and unquoted numbers, booleans, and comments with Gloria's existing palette and glow.
- Add `//` comment toggling, quote pairing, and region folding for CS2 configs.
- Test the grammar with VS Code's TextMate and Oniguruma engines, including semicolon-separated statements, escaped quotes, artwork strings, and incomplete lines.

## 1.0.7

- Clear injected styles when leaving Gloria and synchronize glow settings while running.
- Share glow calculations, support an independent white halo radius, and make zero brightness fully disable glow.
- Add persistent workbench opt-out and a restore command for installation cleanup.
- Preserve burgundy selection with readable selected text in dark mode; improve inactive selections, keyboard focus, and native active-tab feedback.
- Use native cyan activity indicators in side, top, and bottom layouts; respect reduced motion.
- Distinguish HTML ancestors from ordinary tags, correct CSS function scopes and units, restore Markdown emphasis, and unify Python docstring styling.
- Fix optional HTML end tags and raw-text CSS detection, cache parsing across split editors, and budget large-file decorations.
- Add renderer, extension, contrast, scanner, and restoration regression coverage.
