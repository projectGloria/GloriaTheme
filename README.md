<div align="center">

<img src="nihilZone.jpg" alt="Gloria Logo" width="130" height="130" style="border-radius: 50%; box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);" />

# プロジェクト_Gloria

**A luminous cyberpunk & retro-futuristic dark theme crafted for Visual Studio Code**

*Temet Nosce — Deep obsidian contrast, radiant multi-layer neon glow, and tailored workbench chrome.*

<p>
  <a href="package.json"><img src="https://img.shields.io/badge/VS_Code-%5E1.60.0-007ACC.svg?style=flat-square&logo=visual-studio-code&logoColor=white" alt="VS Code Version" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/Version-1.0.8-ff007f.svg?style=flat-square" alt="Version 1.0.8" /></a>
  <img src="https://img.shields.io/badge/Theme-Cyberpunk%20%7C%20Retro--Futuristic-00ffff.svg?style=flat-square" alt="Cyberpunk Theme" />
  <img src="https://img.shields.io/badge/Language-Counter--Strike%202%20CFG-ff9900.svg?style=flat-square&logo=counter-strike" alt="CS2 Config Support" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-grey.svg?style=flat-square" alt="Cross Platform" />
  <img src="https://img.shields.io/badge/Zero_Runtime_Deps-Pure%20Vanilla%20JS-success.svg?style=flat-square" alt="Zero Dependencies" />
</p>

---

<p>
  <a href="#-about-gloria">About</a> &bull;
  <a href="#-key-features">Key Features</a> &bull;
  <a href="#-visual-tour">Visual Tour</a> &bull;
  <a href="#-interactive-control-panel">Control Panel</a> &bull;
  <a href="#-installation--setup">Installation</a> &bull;
  <a href="#-configuration">Configuration</a> &bull;
  <a href="#-counter-strike-2-support">CS2 Configs</a> &bull;
  <a href="#-development--packaging">Development</a> &bull;
  <a href="#-design-philosophy">Design Philosophy</a>
</p>

<img src="https://raw.githubusercontent.com/Nihilnia/Gloria-Theme/main/themes/Gloria_Borderless.gif" width="100%" alt="Gloria Theme Borderless Interface Preview" />

</div>

---

```
█   █  ███  █     █████     ███  █   █ ████      ███   ███  █████  ███  █   █    █████ ███ ████  █████ 
█   █ █   █ █       █      █   █ ██  █ █   █    █     █   █   █   █     █   █    █      █  █   █ █     
█████ █████ █       █      █████ █ █ █ █   █    █     █████   █   █     █████    ████   █  ████  ████  
█   █ █   █ █       █      █   █ █  ██ █   █    █     █   █   █   █     █   █    █      █  █  █  █     
█   █ █   █ █████   █      █   █ █   █ ████      ███  █   █   █    ███  █   █    █     ███ █   █ █████
```

> **HALT AND CATCH FIRE (HCF):**  
> *An early computer command that sent the machine into a race condition, forcing all instructions to compete for superiority at once.*  
> *Control of the computer could not be regained._*

---

## 🌌 About Gloria

**Gloria** (`プロジェクト_Gloria`) is an immersive, high-contrast dark theme and editor enhancement system for Visual Studio Code. Inspired by cyberpunk command centers, neon terminal aesthetics, and retro-futuristic computing lore (*Temet Nosce*), Gloria transforms the default development experience into a vivid, glowing workspace.

Unlike conventional color themes that stop at token coloring, Gloria includes an integrated workbench skin, an independent multi-layer text-glow engine, a real-time webview control panel, and full first-class syntax support for Counter-Strike 2 config files:

- 🔮 **Luminescent Syntax & Structural Glow**: Multi-layered real-time neon bloom applied to keywords, functions, CSS braces, and structural HTML ancestors.
- 🎨 **Deep Injected Editor Chrome**: Polished borderless title bars, translucent activity indicator bars, burgundy selection contrast, and sleek tabs.
- 🐇 **Interactive Control Panel Webview**: Built-in sidebar GUI (featuring the Gloria Rabbit) for real-time live adjustments of syntax colors, UI tokens, and glow parameters without leaving the editor.
- 🎯 **Native Counter-Strike 2 (`.cfg`) Language Support**: Dedicated TextMate grammar with glowing commands, aliases, keybinds, cvars, and region folding.
- 🛡️ **Clean Opt-Out & Workbench Safety**: Single-command restoration restores VS Code's core workbench files cleanly whenever desired.

---

## ⚡ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🌟 Multi-Layered Neon Glow</h3>
      <p>Custom multi-layer text bloom with independent white halo radius and live brightness control (0.0 to 1.0) synchronized across all visible editor splits.</p>
    </td>
    <td width="50%">
      <h3>🐇 Interactive Control Panel</h3>
      <p>Dedicated sidebar panel in the Activity Bar to fine-tune UI colors, token scopes, and glow radiuses on the fly with live preview and instant reset.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧬 Structural HTML &amp; CSS Illuminations</h3>
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
      <p>Run <strong>Gloria: Restore VS Code Workbench</strong> at any time to instantly revert all file modifications, clear injected scripts, and return to stock VS Code.</p>
    </td>
  </tr>
</table>

---

## 📸 Visual Tour

### 1. Cyberpunk Borderless Workspace & Neon Glow
Immerse yourself in deep obsidian tones accented with radiant cyan, hot pink, vivid green, and luminous white glows.

<p align="center">
  <img src="https://raw.githubusercontent.com/Nihilnia/Gloria-Theme/main/themes/Gloria_Borderless.gif" alt="Gloria Borderless Glow Demonstration" width="900" />
</p>

### 2. Activity Bar & Theme Control Panel
Access the custom Gloria Rabbit icon in the activity bar to open the live Control Panel and tweak editor colors, syntax scopes, and glow intensities in real time.

<p align="center">
  <img src="assets/rabbit.svg" alt="Gloria Rabbit Icon" width="64" height="64" />
</p>

### 3. Structural Syntax Highlighting
- **HTML Ancestors**: Ordinary tags remain flat white; ancestor containers glow to guide your eyes through nested structures.
- **CSS Delimiters & Braces**: Curly braces glow with crisp white halos, while units glow yellow and functions maintain clear flat blue scopes.
- **Burgundy Selection**: Readable, high-contrast text selection that overrides VS Code's dim dark-mode selection.

---

## 🎛️ Interactive Control Panel

Gloria comes with an integrated Webview Control Panel embedded directly into your Activity Bar under the **Gloria Theme** view container:

| Action | Command / Shortcut | Description |
| :--- | :--- | :--- |
| **Open Control Panel** | `gloria.openControlPanel` | Opens the graphical tuning interface in your sidebar. |
| **Reset Customizations** | `gloria.resetColors` | Clears custom user overrides and restores default Gloria styling. |
| **Restore Workbench** | `gloria.restoreWorkbench` | Safely strips injected scripts and restores factory VS Code HTML files. |

Through the control panel, you can customize:
- **Editor Elements**: Background, foreground, cursor, active tab border, sidebar, gutter, and terminal colors.
- **Token Palettes**: Variables, strings, keywords, functions, types, numbers, comments, and brackets.
- **Glow Parameters**: Real-time glow brightness sliders and outer halo radius controls.

---

## 🚀 Installation & Setup

### 1. Install Extension

Install the packaged VSIX extension directly into VS Code:

```powershell
code --install-extension gloria-theme-custom.vsix
```

*Alternatively, press `Ctrl+Shift+P` (or `Cmd+Shift+P`), select **Extensions: Install from VSIX...**, and choose `gloria-theme-custom.vsix`.*

### 2. Activate the Theme

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type **Preferences: Color Theme** and select **Gloria**.
3. When prompted, reload the window to initialize the custom workbench skin.

> [!NOTE]  
> Because Gloria modifies VS Code's workbench installation files to inject custom CSS chrome and structural neon glow, VS Code may display an informational badge reporting that the installation is modified. This is expected behavior for custom workbench enhancements.

### 3. Safe Uninstallation / Restoration

Before uninstalling or updating VS Code:
1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **Gloria: Restore VS Code Workbench**.
3. Reload the window. This safely reverts the workbench HTML, removes injected scripts and state files, and resets `gloria.enableWorkbench` to `false`.

---

## ⚙️ Configuration

Tune Gloria's aesthetic directly in your `settings.json` or through the interactive Control Panel:

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
| `gloria.enableWorkbench` | `boolean` | `true` | Enables custom workbench skin and glow injection. Set to `false` to keep stock chrome. |
| `gloria.brightness` | `number` | `0.45` | Master brightness for glow effects (`0.0` = fully transparent, `1.0` = maximum bloom). |
| `gloria.whiteGlowRadius` | `number` | `25` | Outer white halo radius in pixels (`0` to `50`), adjustable independently of brightness. |
| `gloria.disableGlow` | `boolean` | `false` | Disables token glow while retaining custom editor chrome styling. |
| `gloria.maxDecorationFileSize` | `integer` | `1000000` | Document size limit in characters for structural AST decorations. |

---

## 🎯 Counter-Strike 2 Support

Gloria includes an integrated, high-performance TextMate language grammar for Counter-Strike 2 (`.cfg`) configuration scripts:

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
- **Comments (`//`)**: Rendered in italic muted gray with line-comment toggling (`Ctrl+/`).
- **Folding Regions**: Native code folding support for `// #region` and `// #endregion`.

> [!TIP]  
> If `.cfg` files open as a different language due to another extension, simply click the language selector in the status bar and choose **Counter-Strike 2 Config**, or add `"files.associations": { "*.cfg": "cs2-cfg" }` to your settings.

---

## 🛠️ Development & Packaging

Gloria's runtime is engineered with **zero external dependencies** — native VS Code APIs and clean vanilla JavaScript ensure optimal performance and minimal memory footprint.

### Prerequisites

- **Node.js**: Versions `22.22.2+`, `24.15.0+`, or `26+`
- **PowerShell**: For automated packaging on Windows

### Build & Test Workflow

1. **Install dev test dependencies:**
   ```powershell
   npm ci
   ```

2. **Run regression tests:**
   ```powershell
   npm test
   ```
   *Runs comprehensive unit tests for CSS bracket scanners, HTML grandparent parsers, color contrast benchmarks, and workbench restoration routines.*

3. **Rebuild the VSIX package:**
   ```powershell
   npm run package
   ```
   *Executes `scripts/package.ps1` to assemble the latest grammars, templates, themes, and workbench modules into `gloria-theme-custom.vsix`.*

---

## 🐇 Design Philosophy

<p align="center">
  <img src="nihilZone.jpg" alt="Gloria Icon Close-up" width="110" height="110" style="border-radius: 50%; box-shadow: 0 0 25px rgba(255, 0, 127, 0.5);" />
  <br />
  <em>"Temet Nosce" — Know Thyself</em>
</p>

Gloria was built on the premise that a coding theme should be both an inspiring visual instrument and an ergonomically sound work environment:

- **Deep Obsidian Black**: Relieves visual strain during extended late-night sessions while providing a high-contrast canvas.
- **Intentional Bloom**: Glow is reserved for key structural landmarks and syntax anchors, directing focus without cluttering readability.
- **The Gloria Rabbit**: The cyber rabbit emblem represents agility, swift navigation, and the curious journey down the programming rabbit hole.

---

## 📜 Credits & License

- **Author**: Nihil ([@projectGloria](https://github.com/projectGloria))
- **Repository**: [projectGloria/GloriaTheme](https://github.com/projectGloria/GloriaTheme)
- **License**: Distributed under the [MIT License](https://opensource.org/licenses/MIT) &copy; Nihil.
