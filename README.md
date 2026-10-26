<div align="center">

<a href="https://marketplace.visualstudio.com/items?itemName=Nihilnia.gloria-theme">
  <img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/gloria-banner.png" alt="Gloria Theme Banner" width="100%" />
</a>

# プロジェクト_Gloria

**A luminous cyberpunk & retro-futuristic dark theme crafted for Visual Studio Code**

*Deep obsidian contrast, multi-layered neon bloom, real-time control panel, and dedicated Counter-Strike 2 syntax.*

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Nihilnia.gloria-theme"><img src="https://img.shields.io/visual-studio-marketplace/v/Nihilnia.gloria-theme?style=flat-square&label=Marketplace&color=00ffff" alt="Visual Studio Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=Nihilnia.gloria-theme"><img src="https://img.shields.io/visual-studio-marketplace/i/Nihilnia.gloria-theme?style=flat-square&color=ff007f" alt="Marketplace Installs" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/VS_Code-%5E1.82.0-007ACC.svg?style=flat-square&logo=visual-studio-code&logoColor=white" alt="VS Code Version" /></a>
  <img src="https://img.shields.io/badge/Theme-Cyberpunk%20%7C%20Retro--Futuristic-00ffff.svg?style=flat-square" alt="Cyberpunk Theme" />
  <img src="https://img.shields.io/badge/Language-Counter--Strike%202%20CFG-ff9900.svg?style=flat-square&logo=counter-strike" alt="CS2 Config Support" />
  <img src="https://img.shields.io/badge/Zero_Runtime_Deps-Pure%20Vanilla%20JS-00ff41.svg?style=flat-square" alt="Zero Dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
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

**Gloria** (`プロジェクト_Gloria`) is an immersive, high-contrast dark theme and ambient developer experience designed for Visual Studio Code. Inspired by cyberpunk aesthetics, neon terminal command centers, and retro-futuristic computing lore (*Temet Nosce*), Gloria turns your code editor into a radiant terminal workspace.

Unlike traditional color themes that are limited to simple static syntax tokens, Gloria integrates:
- 🔮 **Multi-Layer Neon Bloom**: Real-time radiant text glow with customizable white halo radius and brightness across syntax roles, structural HTML ancestors, CSS curly brackets, and Markdown headers.
- 🎛️ **Sidebar Control Panel GUI**: An interactive, real-time customizer embedded directly into your Activity Bar to tweak glow parameters, theme tokens, and editor chrome on the fly.
- 🍷 **High-Contrast Burgundy Selection**: Crisp, readable flat white text highlighted over a luminous burgundy background.
- 🎯 **First-Class Counter-Strike 2 CFG Support**: Dedicated TextMate grammar with glowing commands, aliases, keybinds, and cvars for CS2 configuration files.
- 🛡️ **Zero Runtime Dependencies & Safe Cleanup**: Clean vanilla JavaScript architecture with single-command workbench file restoration.

---

## ⚡ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🔮 Multi-Layered Neon Glow</h3>
      <p>Custom multi-layer text bloom with independent white halo radius and live brightness control (0.0 to 1.0) synchronized across all visible editor splits.</p>
    </td>
    <td width="50%">
      <h3>🎛️ Interactive Control Panel</h3>
      <p>Built-in sidebar GUI (featuring the Gloria Rabbit) for real-time live adjustments of syntax colors, UI tokens, and glow parameters without leaving the editor.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧬 Structural AST Highlighting</h3>
      <p>Intelligent AST-aware decorations: qualifying ancestor tags glow to clarify deep hierarchies, while CSS units, parentheses, and braces receive distinct radiant styling.</p>
    </td>
    <td width="50%">
      <h3>🎯 Counter-Strike 2 CFG Grammar</h3>
      <p>Built-in language mode for <code>.cfg</code> files featuring glowing commands, aliases, cvars, keybind strings, numbers, booleans, and <code>// #region</code> folding.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🍷 High-Contrast Burgundy Selection</h3>
      <p>Selected text displays crisp, readable flat white over deep burgundy through lightweight editor decorations in both standard dark and high-contrast environments.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Safe Injection &amp; One-Click Restore</h3>
      <p>Gloria automatically cleans up workbench injections when switching themes. Run <strong>Gloria: Restore VS Code Workbench</strong> at any time to instantly revert to stock VS Code.</p>
    </td>
  </tr>
</table>

---

## 🎛️ Interactive Control Panel

> **Tune your aesthetic in real time without editing JSON or restarting your editor.**

Gloria includes a dedicated Webview Control Panel embedded right into the VS Code Activity Bar under the **Gloria Theme** view container.

<p align="center">
  <img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/gloria-control-panel.png" alt="Gloria Theme Control Panel in VS Code" width="100%" />
</p>

### How to Open the Control Panel

1. Click the **Gloria Rabbit** icon in the Activity Bar on the left edge of your VS Code window:
   <p align="center">
     <img src="https://raw.githubusercontent.com/projectGloria/GloriaTheme/main/assets/rabbit-badge.svg" alt="Gloria Rabbit Icon" width="72" height="72" />
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

- **Commands & Aliases**: Rendered in glowing crisp white; the `alias` keyword glows in vibrant lavender.
- **CVars & Settings**: Rendered in radiant neon red.
- **Key Binds & Strings**: Rendered in luminous cyber green.
- **Numbers & Booleans**: Rendered in vibrant yellow.
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

- **Author**: Nihil ([@projectGloria](https://github.com/projectGloria))
- **Publisher**: Nihilnia
- **Repository**: [projectGloria/GloriaTheme](https://github.com/projectGloria/GloriaTheme)
- **License**: Distributed under the [MIT License](LICENSE) &copy; Nihil.
