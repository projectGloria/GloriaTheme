# Changelog

## 1.0.9

- Update extension description to be clear, descriptive, and self-explanatory for the VS Code Marketplace.
- Add authentic control panel interface screenshot to README.
- Fix image and logo URLs to resolve reliably on the Visual Studio Marketplace and GitHub CDN.
- Patch VS Code's workbench only while Gloria is the active theme; switching themes restores it once no Gloria window remains, and uninstalling restores it on the next restart (`vscode:uninstall`).
- Glow follows token roles instead of exact hex values, so recolored roles keep their glow; colorized brackets glow per nesting level.
- Control Panel no longer writes into the installed theme file; Reset only clears panel-managed customizations; webview gains a CSP, validated messages and serialized updates.
- Keywords get a distinct lavender hue; `true`/`false`/`null` render as yellow literals; Python call arguments no longer inherit function color.
- Translucent selections; readable unfocused selection text; visible buttons, list selection and debugging status bar; bracket pair colorization; terminal ANSI, diff, git, find and peek colors.
- CS2 grammar applies only to CS2 config folders and `autoexec.cfg` instead of every `.cfg` file.
- Warn when the pre-rename `Nihil.gloria-theme` build is installed alongside this one; require VS Code 1.82+.

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
