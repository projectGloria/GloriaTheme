<div align="center">

<img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/gloriaBanner.png" alt="Gloria Theme Banner" width="100%" />

# プロジェクト_Gloria

**A luminous cyberpunk & retro-futuristic dark theme crafted for Visual Studio Code**

*Built primarily for the JavaScript ecosystem, with deep obsidian contrast, multi-layered neon bloom, and a real-time control panel—plus Counter-Strike 2 syntax support as a hobby project.*

<p align="center">
  <a href="https://github.com/Nihilnia"><img src="https://img.shields.io/badge/Built_by-Nihil-dc143c.svg?style=flat-square&logo=github&logoColor=white" alt="Built by Nihil" /></a>
  <img src="https://img.shields.io/badge/Built_For-JavaScript%20Ecosystem-f7df1e.svg?style=flat-square&logo=javascript&logoColor=f7df1e" alt="Built for the JavaScript Ecosystem" />
  <img src="https://img.shields.io/badge/Theme-Cyberpunk%20%7C%20Retro--Futuristic-00ffff.svg?style=flat-square" alt="Cyberpunk Theme" />
  <a href="package.json"><img src="https://img.shields.io/badge/VS_Code-%5E1.82.0-007ACC.svg?style=flat-square&logo=visual-studio-code&logoColor=white" alt="VS Code Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=Nihilnia.gloria-theme"><img src="https://img.shields.io/badge/Version-2.0.1-00ffff.svg?style=flat-square" alt="Gloria Version 2.0.1" /></a>
  <img src="https://img.shields.io/badge/Zero_Runtime_Deps-Pure%20Vanilla%20JS-00ff41.svg?style=flat-square" alt="Zero Dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/projectGloria/GloriaTheme"><img src="https://img.shields.io/badge/GitHub-Repo-00ffff.svg?style=flat-square&logo=github&logoColor=white" alt="GitHub Repo" /></a>
</p>

---

<p align="center">
  <a href="#-key-features"><b>Key Features</b></a> &bull;
  <a href="#-interactive-control-panel"><b>Control Panel</b></a> &bull;
  <a href="#-quick-start"><b>Quick Start</b></a> &bull;
  <a href="#-counter-strike-2-support"><b>CS2 Configs</b></a> &bull;
  <a href="#-configuration"><b>Settings</b></a> &bull;
  <a href="#-design-philosophy"><b>Design Lore</b></a>
</p>

</div>

---

## 🌌 Welcome to Gloria

**Gloria** (`プロジェクト_Gloria`) is an immersive, high-contrast dark theme built primarily for the JavaScript ecosystem in Visual Studio Code. Inspired by cyberpunk aesthetics, neon terminal command centers, and retro-futuristic computing lore (*Temet Nosce*), Gloria turns your code editor into a radiant terminal workspace.

**A theme you can tune while you code.** Gloria's built-in control panel lets you change glow brightness, syntax colors, and editor colors in real time. Try a preset or move a slider and watch the live preview respond—no JSON editing or editor restart needed for these adjustments.

<p align="center">
  <a href="#-interactive-control-panel"><img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/gloria-control-panel.png" alt="Gloria's actual control panel with a live code preview, glow sliders, presets, and color controls" width="100%" /></a>
  <br />
  <em>Live glow adjustments, presets, and color controls—all from the built-in panel.</em>
</p>

Unlike traditional color themes that are limited to simple static syntax tokens, Gloria integrates:
- 🔮 **Multi-Layer Neon Bloom**: Real-time radiant text glow with customizable white halo radius and brightness across syntax roles, structural HTML ancestors, CSS curly brackets, and Markdown headers.
- 🎛️ **Live Control Panel**: Change glow, syntax colors, and editor colors from the sidebar, with a built-in preview and live updates—no restart for these adjustments.
- 🍷 **High-Contrast Burgundy Selection**: Crisp, readable flat white text highlighted over a luminous burgundy background.
- 🎯 **Counter-Strike 2 CFG Support**: A hobby addition with dedicated TextMate grammar for glowing commands, aliases, keybinds, and cvars.
- 🛡️ **Zero Runtime Dependencies & Safe Cleanup**: Clean vanilla JavaScript architecture with single-command workbench file restoration.

---

## ⚡ Key Features

<table>
  <tr>
    <td width="50%" height="180" valign="top">
      <h3>🔮 Multi-Layered Neon Glow</h3>
      <p>Custom multi-layer text bloom with independent white halo radius and live brightness control (0.0 to 1.0) synchronized across all visible editor splits.</p>
    </td>
    <td width="50%" height="180" valign="top">
      <h3>🎛️ Interactive Control Panel</h3>
      <p>Built-in sidebar GUI (featuring the Gloria Rabbit), live code preview, and color presets. Adjust syntax colors, editor colors, and glow while you code—no restart needed for these adjustments.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" height="180" valign="top">
      <h3>🧬 Structural AST Highlighting</h3>
      <p>Intelligent AST-aware decorations: qualifying ancestor tags glow to clarify deep hierarchies, while CSS units, parentheses, and braces receive distinct radiant styling.</p>
    </td>
    <td width="50%" height="180" valign="top">
      <h3>🎯 Counter-Strike 2 CFG Grammar</h3>
      <p>Built-in language mode for <code>.cfg</code> files featuring glowing commands, aliases, cvars, keybind strings, numbers, booleans, and <code>// #region</code> folding.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" height="180" valign="top">
      <h3>🍷 High-Contrast Burgundy Selection</h3>
      <p>Selected text displays crisp, readable flat white over deep burgundy through lightweight editor decorations in both standard dark and high-contrast environments.</p>
    </td>
    <td width="50%" height="180" valign="top">
      <h3>🛡️ Safe Injection &amp; One-Click Restore</h3>
      <p>Gloria automatically cleans up workbench injections when switching themes. Run <strong>Gloria: Restore VS Code Workbench</strong> at any time to instantly revert to stock VS Code.</p>
    </td>
  </tr>
</table>

---

## 🎛️ Interactive Control Panel

> **Move a slider. Pick a color. Keep coding. Your changes apply live.**

Open **Gloria Theme** in the VS Code Activity Bar to adjust your theme while you work. The panel includes a live code preview, four color presets, glow sliders, and individual color controls for syntax and the editor. Brightness, radius, preset, and color adjustments apply without restarting the editor or reloading the window.

<p align="center">
  <img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/gloria-control-panel.png" alt="Actual Gloria control panel with live code preview, four presets, glow sliders, editor color pickers, and syntax token color pickers" width="100%" />
  <br />
  <em>The complete control panel, rendered directly from the extension's HTML and styles.</em>
</p>

The initial workbench skin setup requires one window reload when prompted. After setup, the live adjustments above need no further reloads.

### How to Open the Control Panel

1. Click the **Gloria Rabbit** icon in the Activity Bar on the left edge of your VS Code window:
   <p align="center">
     <img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/rabbit.png" alt="Gloria Rabbit Icon" width="48" height="48" />
   </p>
2. Or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> (macOS: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) and run:
   ```
   Gloria: Open Theme Control Panel
   ```

### What You Can Customize

- ⚡ **Glow & Atmosphere**:
  - **Glow Brightness Slider**: Smoothly scale glow bloom from `0%` (flat) to `100%` (maximum radiance).
  - **White Glow Radius Slider**: Fine-tune the outer white halo thickness (`0px` to `50px`).
  - **Neon Glow Toggle**: Instantly toggle text bloom on or off.
  - **Workbench Skin Toggle**: Toggle custom borderless title bars and glow injections.

- 🎨 **Syntax Token Colors**:
  - Live color pickers and hex inputs for **Variables**, **Keywords**, **Functions**, **Strings**, **Glowing Brackets**, **Types**, **Numbers**, and **Markdown Headers**.
  - Recolor any syntax role and its glow automatically adapts!

- 🖌️ **Editor & Workbench Palettes**:
  - Customize Editor Background, Selection, Cursor, Line Numbers, Tab Borders, Sidebar, and Terminal foreground colors.

- 🔄 **Safe Presets & Reset**:
  - **Four Built-in Presets**: Switch between Gloria Default, Matrix Rabbit, Cyber Cyan, and Crimson Overdrive.
  - **Reset All**: Instantly restore default Gloria colors without touching your other VS Code preferences.

---

## 🚀 Quick Start

### 1. Install Extension

Search for **Gloria Theme** in the Extensions view (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>) and click **Install**, or run via terminal:

```powershell
code --install-extension Nihilnia.gloria-theme
```

### 2. Activate Theme

1. Press <kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>+<kbd>T</kbd> (or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> &rarr; **Preferences: Color Theme**).
2. Select **Gloria**.
3. Reload the window when prompted to activate the full custom workbench skin.

### 3. Safe Uninstallation & Restoration

Gloria patches the workbench only while **Gloria** is the active color theme. Switching away automatically unpatches VS Code. To restore anytime manually:
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>.
2. Run **Gloria: Restore VS Code Workbench**.
3. Reload the window. Stock VS Code HTML files are completely restored.

---

## 🎯 Counter-Strike 2 Support

<img src="https://img.shields.io/badge/Language-Counter--Strike%202%20CFG-ff9900.svg?style=flat-square&logo=counter-strike" alt="CS2 Config Support" />

Gloria features native TextMate syntax highlighting for Counter-Strike 2 (`.cfg`) configuration scripts:

```cs2
// #region Movement & Viewmodel
alias "+jumpthrow" "+jump; -attack; -attack2"
alias "-jumpthrow" "-jump"
bind "v" "+jumpthrow"

viewmodel_fov 68
sensitivity 1.45
fps_max 0
// #endregion
```

- **Commands & Aliases**: Rendered in glowing crisp white.
- **CVars & Settings**: Rendered in radiant neon red.
- **Key Binds & Strings**: Rendered in luminous cyber green.
- **Numeric Values**: Rendered in vibrant yellow.
- **Booleans**: Rendered in clean flat white.
- **Comments (`//`)**: Rendered in italic muted gray with line-comment toggling (<kbd>Ctrl</kbd>+<kbd>/</kbd>).
- **Folding Regions**: Native code folding support for `// #region` and `// #endregion`.

> [!TIP]
> Gloria automatically detects `autoexec.cfg` and `.cfg` files inside CS2 config directories (`.../csgo/cfg/` and `.../userdata/<id>/730/local/cfg/`). For custom locations, select **Counter-Strike 2 Config** in the status bar language selector.

---

## ⚙️ Configuration

Prefer editing your `settings.json` directly? All parameters are fully configurable:

```json
{
  "workbench.colorTheme": "Gloria",
  "gloria.enableWorkbench": true,
  "gloria.brightness": 0.45,
  "gloria.whiteGlowRadius": 25,
  "gloria.disableGlow": false,
  "gloria.maxDecorationFileSize": 1000000
}
```

### Settings Reference

| Setting | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `gloria.enableWorkbench` | `boolean` | `true` | Enables custom workbench skin and glow injection while Gloria is active. |
| `gloria.brightness` | `number` | `0.45` | Master brightness for glow effects (`0.0` = flat / no glow, `1.0` = maximum bloom). |
| `gloria.whiteGlowRadius` | `number` | `25` | Outer white halo radius in pixels (`0` to `50`), adjustable independently. |
| `gloria.disableGlow` | `boolean` | `false` | Disables token glow while retaining custom editor chrome styling. |
| `gloria.maxDecorationFileSize` | `integer` | `1000000` | Maximum document length in characters for structural AST decorations. |

---

## 🐇 Design Philosophy & Lore

<div align="center">

<img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/nihilZone.jpg" alt="Gloria Emblem" width="120" height="120" />

<br />

<em>"Temet Nosce" — Know Thyself</em>

</div>

Gloria was engineered on the principle that a coding environment should be an inspiring visual instrument without sacrificing long-term ergonomic readability:

- **Deep Obsidian Background (`#03070e`)**: Reduces eye fatigue during late-night coding sessions while maximizing contrast for neon accents.
- **Purposeful Bloom**: Glow highlights syntactic anchors (keywords, functions, variables, brackets, headers) while data values, strings, types, and comments remain flat and legible.
- **The Gloria Rabbit**: The cyber rabbit emblem symbolizes agility, swift navigation, and following curiosity down the programming rabbit hole.

---

## 📜 Credits & License

<table>
  <tr>
    <td><strong>Author</strong></td>
    <td><a href="https://github.com/Nihilnia">Nihil</a></td>
  </tr>
  <tr>
    <td><strong>Publisher</strong></td>
    <td>Nihil</td>
  </tr>
  <tr>
    <td><strong>Repository</strong></td>
    <td><a href="https://github.com/projectGloria/GloriaTheme"><img src="https://img.shields.io/badge/GitHub-Repo-00ffff.svg?style=flat-square&logo=github&logoColor=white" alt="GitHub Repo" /></a></td>
  </tr>
  <tr>
    <td><strong>License</strong></td>
    <td><a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" /></a> &copy; Nihil.</td>
  </tr>
</table>
