```
█   █  ███  █     █████     ███  █   █ ████      ███   ███  █████  ███  █   █    █████ ███ ████  █████ 
█   █ █   █ █       █      █   █ ██  █ █   █    █     █   █   █   █     █   █    █      █  █   █ █     
█████ █████ █       █      █████ █ █ █ █   █    █     █████   █   █     █████    ████   █  ████  ████  
█   █ █   █ █       █      █   █ █  ██ █   █    █     █   █   █   █     █   █    █      █  █  █  █     
█   █ █   █ █████   █      █   █ █   █ ████      ███  █   █   █    ███  █   █    █     ███ █   █ █████
```

<img src="https://raw.githubusercontent.com/Nihilnia/Gloria-Theme/main/themes/Gloria_Borderless.gif" alt="Gloria" width="100%">

```
# HALT AND CATCH FIRE (HCF):
An early computer command that sent
the machine into a race condition,
forcing all instructions to compete
for superiority at once.

Control of the computer could not
be regained._
```

## Personal setup

Install `gloria-theme-custom.vsix`, select **Gloria**, and reload the window when prompted. The custom glow and chrome modify VS Code's workbench installation; VS Code can report that the installation has been modified. An editor update can require reinstalling the styling and another reload.

Brightness and glow settings apply application-wide and synchronize with the workbench within one second while the window is visible:

```json
{
  "gloria.brightness": 0.45,
  "gloria.whiteGlowRadius": 25,
  "gloria.disableGlow": false,
  "gloria.maxDecorationFileSize": 1000000
}
```

`whiteGlowRadius` adjusts the outer white halo independently of brightness. A brightness of zero removes every glow layer. Structural decorations are cached across split editors and skipped above the configured document length or 20,000 ranges; ordinary syntax highlighting stays available.

Ordinary HTML names are flat white; qualifying ancestors glow. CSS units are yellow, function parentheses are flat blue, and CSS curly braces glow white. Structural decorations preserve CSS punctuation styling alongside native bracket pair coloring, including in embedded style blocks.

Selected text becomes flat white over burgundy through a lightweight editor decoration, including in ordinary dark mode. The native `editor.selectionForeground` setting alone only affects high-contrast themes.

Before uninstalling, run **Gloria: Restore VS Code Workbench** from the Command Palette. This removes Gloria's injected script and state file and restores the workbench HTML. It also sets `gloria.enableWorkbench` to `false` so reloads do not reinstall the skin. Set it back to `true` to re-enable custom styling. Theme switching clears injected styles automatically; extension deactivation disables the renderer state.

## Counter-Strike 2 configs

Open a `.cfg` file to use the **Counter-Strike 2 Config** language mode automatically. Commands and alias names use Gloria's glowing white, setting names use glowing red, bind keys and text strings use green, numeric values use yellow, booleans use flat white, and `//` comments use italic gray. Quoted command payloads stay green as strings; semicolons outside quotes separate commands.

Use VS Code's Toggle Line Comment command to toggle `//` comments. Quote pairing and `// #region` / `// #endregion` folding are included. If another extension or a saved file association selects a different language, choose **Counter-Strike 2 Config** in the status bar or add `"files.associations": { "*.cfg": "cs2-cfg" }` to your settings.

## Development

Use a supported Node.js version (22.22.2+, 24.15.0+, or 26+), run `npm ci`, then `npm test`. Runtime code has no external dependencies; jsdom, vscode-textmate, and vscode-oniguruma are used only by the regression tests.
