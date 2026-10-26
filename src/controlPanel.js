const fs = require('fs');
const path = require('path');
const { normalizeGlowSettings } = require('./glow');

const THEME_KEY = '[Gloria]';

const UI_COLOR_CONTROLS = [
	{ key: 'editor.background', label: 'Editor Background', group: 'Editor' },
	{ key: 'editor.foreground', label: 'Editor Foreground', group: 'Editor' },
	{ key: 'editor.selectionBackground', label: 'Selection (Focused)', group: 'Selection' },
	{ key: 'editor.selectionForeground', label: 'Selection Text', group: 'Selection' },
	{ key: 'editor.inactiveSelectionBackground', label: 'Selection (Unfocused)', group: 'Selection' },
	{ key: 'editorCursor.foreground', label: 'Cursor', group: 'Editor' },
	{ key: 'editorGutter.background', label: 'Line Numbers Background', group: 'Gutter' },
	{ key: 'editorLineNumber.foreground', label: 'Line Numbers', group: 'Gutter' },
	{ key: 'editorLineNumber.activeForeground', label: 'Active Line Number', group: 'Gutter' },
	{ key: 'editorGroupHeader.tabsBackground', label: 'Tabs Bar Background', group: 'Tabs & Sidebar' },
	{ key: 'tab.activeBackground', label: 'Active Tab Background', group: 'Tabs & Sidebar' },
	{ key: 'tab.inactiveBackground', label: 'Inactive Tab Background', group: 'Tabs & Sidebar' },
	{ key: 'tab.activeBorder', label: 'Active Tab Border', group: 'Tabs & Sidebar' },
	{ key: 'titleBar.activeBackground', label: 'Title Bar Background', group: 'Tabs & Sidebar' },
	{ key: 'sideBar.background', label: 'Sidebar Background', group: 'Tabs & Sidebar' },
	{ key: 'activityBar.background', label: 'Activity Bar Background', group: 'Tabs & Sidebar' },
	{ key: 'activityBar.activeBorder', label: 'Activity Bar Border', group: 'Tabs & Sidebar' },
	{ key: 'statusBar.background', label: 'Status Bar Background', group: 'Tabs & Sidebar' },
	{ key: 'list.hoverBackground', label: 'List Hover Background', group: 'Tabs & Sidebar' },
	{ key: 'list.activeSelectionBackground', label: 'List Selection', group: 'Tabs & Sidebar' },
	{ key: 'terminal.foreground', label: 'Terminal Foreground', group: 'Terminal' }
];

const TOKEN_CONTROLS = [
	{
		id: 'variables',
		label: 'Variables & Properties',
		ruleNames: ['Variables and Parameters', 'Object Properties', 'CSS Property Names (Non-glowing)', 'CSS Variables (Non-glowing)', 'Python Interpolation Expressions'],
		semantic: ['variable', 'parameter', 'property'],
		scopes: [
			'variable', 'entity.name.variable', 'variable.parameter', 'variable.other',
			'support.variable', 'meta.block variable', 'variable.other.readwrite', 'variable.language',
			'variable.other.property', 'meta.property.object', 'support.type.property-name'
		]
	},
	{
		id: 'strings',
		label: 'Strings & CSS Values',
		ruleNames: ['String', 'CSS Values (Non-glowing)', 'Markdown Code (Non-glowing)'],
		semantic: ['string'],
		scopes: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string']
	},
	{
		id: 'keywords',
		label: 'Keywords & CSS Selectors',
		ruleNames: ['Keyword', 'CSS Selectors (White Glow)', 'CSS Curly Braces (White Glow)'],
		semantic: ['keyword'],
		scopes: ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new']
	},
	{
		id: 'functions',
		label: 'Functions & Methods',
		ruleNames: ['Function'],
		semantic: ['function', 'method'],
		scopes: ['entity.name.function', 'variable.function', 'support.function', 'meta.function-call']
	},
	{
		id: 'types',
		label: 'Types, Classes & Links',
		ruleNames: ['Types and Classes', 'HTML Attributes', 'CSS Functions (Non-glowing)', 'Markdown Links (Non-glowing)'],
		semantic: ['class', 'type'],
		scopes: [
			'entity.name.type', 'entity.name.class', 'meta.attribute.class.html',
			'entity.other.inherited-class', 'support.type', 'support.class', 'entity.other.attribute-name.html'
		]
	},
	{
		id: 'numbers',
		label: 'Numbers & Units',
		ruleNames: ['Number', 'HTML Character Entities', 'CSS Units (Non-glowing)'],
		semantic: [],
		scopes: ['constant.numeric', 'constant.character.entity', 'source.css keyword.other.unit']
	},
	{
		id: 'brackets',
		label: 'Glowing Brackets',
		ruleNames: ['Brackets (Glowing)'],
		semantic: [],
		scopes: [
			'meta.brace', 'punctuation.definition.block', 'punctuation.definition.array',
			'punctuation.definition.parameters', 'punctuation.section.block', 'punctuation.section.array',
			'punctuation.section.parens', 'punctuation.section.class', 'punctuation.section.method',
			'punctuation.section.function'
		],
		uiMirrors: [
			'editorBracketHighlight.foreground1', 'editorBracketHighlight.foreground2',
			'editorBracketHighlight.foreground3', 'editorBracketHighlight.foreground4',
			'editorBracketHighlight.foreground5', 'editorBracketHighlight.foreground6'
		]
	},
	{
		id: 'comments',
		label: 'Comments & Quotes',
		ruleNames: ['Comment', 'Markdown Quotes (Non-glowing)', 'Python Docstring Delimiters'],
		semantic: [],
		scopes: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring.multi.python'],
		fontStyle: 'italic'
	},
	{
		id: 'headers',
		label: 'Markdown Headers',
		ruleNames: ['Markdown Headers (Red Glow)'],
		semantic: [],
		scopes: [
			'markup.heading.markdown', 'heading.1.markdown', 'heading.2.markdown',
			'heading.3.markdown', 'heading.4.markdown', 'heading.5.markdown',
			'heading.6.markdown', 'entity.name.section.markdown', 'punctuation.definition.heading.markdown'
		],
		fontStyle: 'bold'
	},
	{
		id: 'tags',
		label: 'HTML/CSS Tags & Parens',
		ruleNames: ['Tag Fallback (Non-glowing)', 'HTML Tag Punctuation', 'CSS Round Brackets (Non-glowing)'],
		semantic: [],
		scopes: ['entity.name.tag', 'punctuation.definition.tag', 'punctuation.definition.tag.begin.html', 'punctuation.definition.tag.end.html']
	}
];

const ORIGINAL_DEFAULTS = {
	colors: {
		'editor.background': '#000c18',
		'editor.foreground': '#fefefe',
		'editor.selectionBackground': '#800000',
		'editor.selectionForeground': '#fdfdfd',
		'editor.inactiveSelectionBackground': '#00FF41',
		'editorCursor.foreground': '#ffffff',
		'editorGutter.background': '#000c18',
		'editorLineNumber.foreground': '#808080',
		'editorLineNumber.activeForeground': '#ff0000',
		'editorGroupHeader.tabsBackground': '#000c18',
		'tab.activeBackground': '#0A0A0A',
		'tab.inactiveBackground': '#030306',
		'tab.activeBorder': '#ff4d4d',
		'titleBar.activeBackground': '#030306',
		'sideBar.background': '#000c18',
		'activityBar.background': '#000000',
		'activityBar.activeBorder': '#00ffff',
		'statusBar.background': '#000000',
		'list.hoverBackground': '#800000',
		'list.activeSelectionBackground': '#061F38',
		'terminal.foreground': '#40FF00'
	},
	tokens: {
		variables: '#ff0000',
		strings: '#40ff00',
		keywords: '#fdfdfd',
		functions: '#fdfdfd',
		types: '#4ec9b0',
		numbers: '#ffff00',
		brackets: '#1e90ff',
		comments: '#808080',
		headers: '#ff0001',
		tags: '#569CD6'
	}
};

const PRESETS = {
	default: {
		name: 'Gloria Default',
		glow: { brightness: 0.45, whiteGlowRadius: 25, disableGlow: false },
		colors: {},
		tokens: {}
	},
	matrix: {
		name: 'Matrix Rabbit',
		glow: { brightness: 0.65, whiteGlowRadius: 28, disableGlow: false },
		colors: {
			'editor.background': '#000802',
			'editorGutter.background': '#000802',
			'editorGroupHeader.tabsBackground': '#000802',
			'tab.activeBackground': '#000802',
			'tab.inactiveBackground': '#000802',
			'titleBar.activeBackground': '#000802',
			'sideBar.background': '#000802',
			'activityBar.background': '#000802',
			'statusBar.background': '#000802',
			'editor.selectionBackground': '#005515',
			'editor.inactiveSelectionBackground': '#00FF41',
			'editorLineNumber.activeForeground': '#00FF41',
			'tab.activeBorder': '#00FF41',
			'activityBar.activeBorder': '#00FF41',
			'list.hoverBackground': '#003b0f'
		},
		tokens: {
			variables: '#00FF41',
			strings: '#a8ffb8',
			types: '#39ff14',
			brackets: '#00FF41'
		}
	},
	cyber: {
		name: 'Cyber Cyan',
		glow: { brightness: 0.55, whiteGlowRadius: 30, disableGlow: false },
		colors: {
			'editor.background': '#020813',
			'editorGutter.background': '#020813',
			'editorGroupHeader.tabsBackground': '#020813',
			'tab.activeBackground': '#020813',
			'tab.inactiveBackground': '#01050c',
			'sideBar.background': '#020813',
			'editor.selectionBackground': '#004b6e',
			'editor.inactiveSelectionBackground': '#00ffff66',
			'editorLineNumber.activeForeground': '#00ffff',
			'tab.activeBorder': '#00ffff',
			'activityBar.activeBorder': '#ff0055'
		},
		tokens: {
			variables: '#00ffff',
			strings: '#50fa7b',
			brackets: '#ff0055'
		}
	},
	crimson: {
		name: 'Crimson Overdrive',
		glow: { brightness: 0.75, whiteGlowRadius: 32, disableGlow: false },
		colors: {
			'editor.background': '#090002',
			'editorGutter.background': '#090002',
			'editorGroupHeader.tabsBackground': '#090002',
			'tab.activeBackground': '#090002',
			'tab.inactiveBackground': '#050001',
			'sideBar.background': '#090002',
			'editor.selectionBackground': '#a80000',
			'editor.inactiveSelectionBackground': '#ff003380',
			'editorLineNumber.activeForeground': '#ff0033',
			'tab.activeBorder': '#ff0033',
			'activityBar.activeBorder': '#ff0033'
		},
		tokens: {
			variables: '#ff0033',
			strings: '#ff9900',
			brackets: '#ff3366'
		}
	}
};

function loadThemeFile(themePath) {
	return JSON.parse(fs.readFileSync(themePath, 'utf8'));
}

function getBaseDefaults() {
	return {
		colors: { ...ORIGINAL_DEFAULTS.colors },
		tokens: { ...ORIGINAL_DEFAULTS.tokens }
	};
}

function getThemeFileValues(themePath) {
	const theme = loadThemeFile(themePath);
	const colors = {};
	for (const item of UI_COLOR_CONTROLS) {
		colors[item.key] = theme.colors[item.key] || ORIGINAL_DEFAULTS.colors[item.key] || '#000000';
	}
	const tokens = {};
	for (const item of TOKEN_CONTROLS) {
		const rule = theme.tokenColors.find(entry => item.ruleNames.includes(entry.name));
		tokens[item.id] = rule?.settings?.foreground || ORIGINAL_DEFAULTS.tokens[item.id] || '#fefefe';
	}
	return { colors, tokens };
}

function readCurrentState(vscode, themePath) {
	const defaults = getBaseDefaults();
	const fileValues = getThemeFileValues(themePath);
	const gloriaConfig = vscode.workspace.getConfiguration('gloria');
	const workbenchConfig = vscode.workspace.getConfiguration('workbench');
	const editorConfig = vscode.workspace.getConfiguration('editor');

	const colorCustomizations = workbenchConfig.get?.('colorCustomizations', {})?.[THEME_KEY] || {};
	const tokenCustomizations = editorConfig.get?.('tokenColorCustomizations', {})?.[THEME_KEY]?.textMateRules || [];

	const colors = { ...fileValues.colors };
	for (const item of UI_COLOR_CONTROLS) {
		if (typeof colorCustomizations[item.key] === 'string') {
			colors[item.key] = colorCustomizations[item.key];
		}
	}

	const tokens = { ...fileValues.tokens };
	for (const item of TOKEN_CONTROLS) {
		const customRule = tokenCustomizations.find(rule => rule.name === `gloria.${item.id}`);
		if (customRule?.settings?.foreground) {
			tokens[item.id] = customRule.settings.foreground;
		}
	}

	const glow = normalizeGlowSettings({
		brightness: gloriaConfig.get('brightness', 0.45),
		disableGlow: gloriaConfig.get('disableGlow', false),
		whiteGlowRadius: gloriaConfig.get('whiteGlowRadius', 25)
	});

	return {
		defaults,
		colors,
		tokens,
		glow,
		enableWorkbench: gloriaConfig.get('enableWorkbench', true)
	};
}

const MIRROR_COLOR_KEYS = {
	'editor.selectionBackground': ['selection.background'],
	'editorGroupHeader.tabsBackground': ['editorGroupHeader.noTabsBackground'],
	'tab.activeBackground': ['tab.unfocusedActiveBackground'],
	'tab.inactiveBackground': ['tab.unfocusedInactiveBackground'],
	'titleBar.activeBackground': ['titleBar.inactiveBackground'],
	'sideBar.background': ['sideBarSectionHeader.background'],
	'statusBar.background': ['statusBar.noFolderBackground', 'statusBar.debuggingBackground']
};

async function applyCustomizations(vscode, themePath, nextState, isReset = false) {
	const defaults = getBaseDefaults();
	const workbenchConfig = vscode.workspace.getConfiguration('workbench');
	const editorConfig = vscode.workspace.getConfiguration('editor');
	const gloriaConfig = vscode.workspace.getConfiguration('gloria');

	// 1. Update workbench.colorCustomizations
	const allColorCustomizations = { ...(workbenchConfig.get?.('colorCustomizations') || {}) };
	const themeColors = isReset ? {} : { ...(allColorCustomizations[THEME_KEY] || {}) };

	if (!isReset) {
		for (const item of UI_COLOR_CONTROLS) {
			const value = nextState.colors?.[item.key];
			const mirrors = MIRROR_COLOR_KEYS[item.key] || [];
			if (value && value.toLowerCase() !== defaults.colors[item.key].toLowerCase()) {
				themeColors[item.key] = value;
				for (const m of mirrors) themeColors[m] = value;
			} else {
				delete themeColors[item.key];
				for (const m of mirrors) delete themeColors[m];
			}
		}

		// Mirror glowing bracket color to native bracket highlight colors
		for (const tokenItem of TOKEN_CONTROLS) {
			if (!tokenItem.uiMirrors) continue;
			const val = nextState.tokens?.[tokenItem.id];
			const isCustom = val && val.toLowerCase() !== defaults.tokens[tokenItem.id].toLowerCase();
			for (const mirrorKey of tokenItem.uiMirrors) {
				if (isCustom) themeColors[mirrorKey] = val;
				else delete themeColors[mirrorKey];
			}
		}
	}

	if (Object.keys(themeColors).length > 0) {
		allColorCustomizations[THEME_KEY] = themeColors;
	} else {
		delete allColorCustomizations[THEME_KEY];
	}
	await workbenchConfig.update?.(
		'colorCustomizations',
		Object.keys(allColorCustomizations).length ? allColorCustomizations : undefined,
		vscode.ConfigurationTarget.Global
	);

	// 2. Update editor.tokenColorCustomizations & editor.semanticTokenColorCustomizations
	const allTokenCustomizations = { ...(editorConfig.get?.('tokenColorCustomizations') || {}) };
	const allSemanticCustomizations = { ...(editorConfig.get?.('semanticTokenColorCustomizations') || {}) };
	const textMateRules = [];
	const semanticRules = {};

	if (!isReset) {
		for (const item of TOKEN_CONTROLS) {
			const value = nextState.tokens?.[item.id];
			if (value && value.toLowerCase() !== defaults.tokens[item.id].toLowerCase()) {
				const settings = { foreground: value };
				if (item.fontStyle) settings.fontStyle = item.fontStyle;
				textMateRules.push({
					name: `gloria.${item.id}`,
					scope: item.scopes,
					settings
				});
				for (const semKey of item.semantic) {
					semanticRules[semKey] = value;
				}
			}
		}
	}

	if (textMateRules.length > 0) {
		allTokenCustomizations[THEME_KEY] = { textMateRules };
	} else {
		delete allTokenCustomizations[THEME_KEY];
	}
	await editorConfig.update?.(
		'tokenColorCustomizations',
		Object.keys(allTokenCustomizations).length ? allTokenCustomizations : undefined,
		vscode.ConfigurationTarget.Global
	);

	if (Object.keys(semanticRules).length > 0) {
		allSemanticCustomizations[THEME_KEY] = { enabled: true, rules: semanticRules };
	} else {
		delete allSemanticCustomizations[THEME_KEY];
	}
	await editorConfig.update?.(
		'semanticTokenColorCustomizations',
		Object.keys(allSemanticCustomizations).length ? allSemanticCustomizations : undefined,
		vscode.ConfigurationTarget.Global
	);

	// 3. Update Gloria glow settings if changed
	if (nextState.glow) {
		const normalized = normalizeGlowSettings(nextState.glow);
		if (gloriaConfig.get('brightness') !== normalized.brightness) {
			await gloriaConfig.update('brightness', normalized.brightness, vscode.ConfigurationTarget.Global);
		}
		if (gloriaConfig.get('whiteGlowRadius') !== normalized.whiteGlowRadius) {
			await gloriaConfig.update('whiteGlowRadius', normalized.whiteGlowRadius, vscode.ConfigurationTarget.Global);
		}
		if (gloriaConfig.get('disableGlow') !== normalized.disableGlow) {
			await gloriaConfig.update('disableGlow', normalized.disableGlow, vscode.ConfigurationTarget.Global);
		}
	}
	if (typeof nextState.enableWorkbench === 'boolean' && gloriaConfig.get('enableWorkbench') !== nextState.enableWorkbench) {
		await gloriaConfig.update('enableWorkbench', nextState.enableWorkbench, vscode.ConfigurationTarget.Global);
	}
}

function writeThemeJson(themePath, state) {
	const theme = loadThemeFile(themePath);
	for (const item of UI_COLOR_CONTROLS) {
		const val = state.colors?.[item.key];
		if (val) {
			theme.colors[item.key] = val;
			for (const m of (MIRROR_COLOR_KEYS[item.key] || [])) {
				theme.colors[m] = val;
			}
		}
	}
	for (const item of TOKEN_CONTROLS) {
		const val = state.tokens?.[item.id];
		if (!val) continue;
		for (const rule of theme.tokenColors) {
			if (item.ruleNames.includes(rule.name)) {
				rule.settings.foreground = val;
			}
		}
		for (const semKey of item.semantic) {
			if (theme.semanticTokenColors) theme.semanticTokenColors[semKey] = val;
		}
		if (item.uiMirrors) {
			for (const mirrorKey of item.uiMirrors) {
				theme.colors[mirrorKey] = val;
			}
		}
	}
	fs.writeFileSync(themePath, JSON.stringify(theme, null, 2) + '\n', 'utf8');
}

async function saveToThemeFile(vscode, themePath, state) {
	writeThemeJson(themePath, state);
	// Keep customizations active in settings so VS Code reflects all colors without needing a reload
	await applyCustomizations(vscode, themePath, state, false);
}

function buildWebviewHtml(initialState) {
	const payload = JSON.stringify({
		uiControls: UI_COLOR_CONTROLS,
		tokenControls: TOKEN_CONTROLS,
		presets: PRESETS,
		state: initialState
	});

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gloria Control Panel</title>
<style>
  :root {
    --bg: #03070e;
    --panel: #07111e;
    --border: #14283d;
    --accent: #ff0033;
    --cyan: #00ffff;
    --green: #00ff41;
    --text: #fefefe;
    --muted: #8a9bb0;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 14px;
    background: var(--bg);
    color: var(--text);
    font-family: var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);
    font-size: 12.5px;
    line-height: 1.4;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand svg {
    width: 26px;
    height: 26px;
    filter: drop-shadow(0 0 6px #ff0033aa);
  }
  .brand-title {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.6px;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
  }
  .brand-sub {
    font-size: 11px;
    color: var(--muted);
  }
  .actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  button {
    background: #0c1d31;
    color: var(--text);
    border: 1px solid #1f3b5c;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 11.5px;
    cursor: pointer;
    transition: all 120ms ease;
  }
  button:hover {
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.25);
  }
  button.primary {
    background: #5c0011;
    border-color: #ff3355;
  }
  button.primary:hover {
    background: #800018;
    box-shadow: 0 0 10px rgba(255, 0, 51, 0.45);
  }
  .presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .preset-btn {
    flex: 1 1 auto;
    text-align: center;
    padding: 5px 8px;
    font-size: 11px;
  }
  /* Live Preview Box */
  .preview-card {
    position: sticky;
    top: 8px;
    z-index: 10;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
    background: #000c18;
  }
  .preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #030306;
    border-bottom: 1px solid #142234;
    font-size: 11px;
  }
  .preview-tabs {
    display: flex;
    background: #000c18;
    border-bottom: 1px solid #0d1b2a;
  }
  .preview-tab {
    padding: 6px 12px;
    font-size: 11px;
    color: #fefefe99;
    background: #030306;
    position: relative;
  }
  .preview-tab.active {
    color: #fefefe;
    background: #0A0A0A;
    box-shadow: inset 0 -5px 18px #a0000080;
  }
  .preview-tab.active .tab-border {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: #ff4d4d;
  }
  .preview-body {
    display: grid;
    grid-template-columns: 110px 1fr;
    min-height: 158px;
  }
  @media (max-width: 420px) {
    .preview-body {
      grid-template-columns: 1fr;
    }
    .preview-sidebar {
      display: none;
    }
  }
  .preview-sidebar {
    padding: 8px 0;
    border-right: 1px solid rgba(255,255,255,0.06);
    font-size: 11px;
    border-left: 2px solid #00ffff;
  }
  .preview-side-item {
    padding: 3px 10px;
    cursor: default;
  }
  .preview-editor {
    padding: 0;
    font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
    font-size: 12px;
    line-height: 1.55;
    overflow-x: auto;
    white-space: pre;
  }
  .code-line {
    display: flex;
    align-items: stretch;
    gap: 10px;
  }
  .ln {
    width: 30px;
    padding: 1px 6px 1px 0;
    text-align: right;
    user-select: none;
    flex-shrink: 0;
  }
  .code-text {
    padding: 1px 4px;
    border-radius: 2px;
  }
  .section {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  .section-title {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--cyan);
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .control-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 8px 12px;
  }
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 6px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  .control-label {
    font-size: 11.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .color-inputs {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  input[type="color"] {
    -webkit-appearance: none;
    border: 1px solid #2b4562;
    width: 24px;
    height: 22px;
    padding: 0;
    background: transparent;
    border-radius: 3px;
    cursor: pointer;
  }
  input[type="color"]::-webkit-color-swatch-wrapper { padding: 1px; }
  input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
  .hex-input {
    width: 74px;
    background: #03070e;
    color: var(--text);
    border: 1px solid #1f3b5c;
    border-radius: 3px;
    padding: 2px 5px;
    font-family: monospace;
    font-size: 11px;
  }
  .mini-reset {
    padding: 2px 5px;
    font-size: 10px;
    color: var(--muted);
    background: transparent;
    border-color: transparent;
  }
  .mini-reset:hover {
    color: var(--text);
    border-color: #2b4562;
  }
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  .slider-top {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  .status-toast {
    font-size: 11px;
    color: var(--green);
    min-height: 16px;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <svg viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M7.5 1.5C6.1 1.5 5 2.8 5 4.6c0 2.4.7 5.4 1.4 7.3-.9 1.1-1.4 2.5-1.4 4.1 0 3.6 3.1 6.5 7 6.5s7-2.9 7-6.5c0-1.6-.5-3-1.4-4.1.7-1.9 1.4-4.9 1.4-7.3 0-1.8-1.1-3.1-2.5-3.1-1.3 0-2.4 1.2-2.8 3.2-.5 2.1-.8 4.2-.9 5.4-.3 0-.5-.1-.8-.1s-.5 0-.8.1c-.1-1.2-.4-3.3-.9-5.4C9.9 2.7 8.8 1.5 7.5 1.5zm0 1.8c.5 0 .9.6 1.2 1.9.4 1.8.7 3.7.8 5.1-.7.2-1.4.4-2 .8-.5-1.8-1-4.3-1-6.1 0-1.1.4-1.7 1-1.7zm9 0c.6 0 1 .6 1 1.7 0 1.8-.5 4.3-1 6.1-.6-.4-1.3-.6-2-.8.1-1.4.4-3.3.8-5.1.3-1.3.7-1.9 1.2-1.9zM9.2 14.8c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3zm5.6 0c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3zm-2.8 3.2l1.4 1.3h-1v1.2h-.8v-1.2h-1l1.4-1.3z"/>
      </svg>
      <div>
        <div class="brand-title">プロジェクト_Gloria // Control Panel</div>
        <div class="brand-sub">Live Dynamic Theme &amp; Glow Customizer</div>
      </div>
    </div>
    <div class="actions">
      <button id="btn-reset" title="Restore default Gloria colors">Reset All</button>
      <button id="btn-save" class="primary" title="Write current colors permanently into gloria-color-theme.json">Save to Theme JSON</button>
    </div>
  </div>

  <div class="presets" id="presets-bar"></div>

  <!-- Live Dynamic Preview -->
  <div class="preview-card" id="preview-card">
    <div class="preview-toolbar" id="preview-toolbar">
      <span>LIVE PREVIEW <span id="status-toast" class="status-toast"></span></span>
      <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
        <input type="checkbox" id="preview-unfocus-toggle">
        <span>Swap Focused / Unfocused Selection</span>
      </label>
    </div>
    <div class="preview-tabs" id="preview-tabs">
      <div class="preview-tab active" id="preview-tab-active">
        gloria.js
        <div class="tab-border" id="preview-tab-border"></div>
      </div>
      <div class="preview-tab" id="preview-tab-inactive">index.html</div>
    </div>
    <div class="preview-body">
      <div class="preview-sidebar" id="preview-sidebar">
        <div class="preview-side-item" id="preview-side-selected">gloria.js</div>
        <div class="preview-side-item" id="preview-side-hover">styles.css</div>
        <div class="preview-side-item">README.md</div>
      </div>
      <div class="preview-editor" id="preview-editor">
        <div class="code-line"><span class="ln" id="ln-1">1</span><span class="code-text"><span id="tok-comment">// Temet Nosce — Follow the white rabbit</span></span></div>
        <div class="code-line"><span class="ln" id="ln-2">2</span><span class="code-text"><span id="tok-kw">export function</span> <span id="tok-fn">awakenRabbit</span><span id="tok-br1">(</span><span id="tok-var">signal</span><span id="tok-op">: </span><span id="tok-type">CyberDeck</span><span id="tok-br2">) {</span></span></div>
        <div class="code-line"><span class="ln" id="ln-3">3</span><span class="code-text">  <span id="tok-kw2">const</span> <span id="tok-var2">code</span> = <span id="tok-num">404</span>; <span id="tok-tag">&lt;section&gt;</span><span id="tok-hdr"># GLORIA</span><span id="tok-tag2">&lt;/section&gt;</span></span></div>
        <div class="code-line"><span class="ln" id="ln-4">4</span><span class="code-text" id="sel-focused"><span id="sel-focused-text">console.log("selected (focused)");</span></span></div>
        <div class="code-line"><span class="ln" id="ln-5">5</span><span class="code-text" id="sel-unfocused">  <span id="tok-fn2">console</span>.<span id="tok-var3">log</span><span id="tok-br3">(</span><span id="tok-str">"unfocused (#00FF41)"</span><span id="tok-br4">)</span>;</span></div>
        <div class="code-line"><span class="ln" id="ln-6">6</span><span class="code-text"><span id="tok-br5">}</span></span></div>
      </div>
    </div>
  </div>

  <!-- Glow Section -->
  <div class="section">
    <div class="section-title">Glow &amp; Atmosphere</div>
    <div class="control-grid">
      <div class="slider-row">
        <div class="slider-top">
          <span>Glow Brightness</span>
          <strong id="val-brightness">45%</strong>
        </div>
        <input type="range" id="rng-brightness" min="0" max="1" step="0.01">
      </div>
      <div class="slider-row">
        <div class="slider-top">
          <span>White Glow Radius</span>
          <strong id="val-radius">25px</strong>
        </div>
        <input type="range" id="rng-radius" min="0" max="50" step="1">
      </div>
      <div class="toggle-row">
        <span class="control-label">Enable Neon Glow</span>
        <input type="checkbox" id="chk-glow">
      </div>
      <div class="toggle-row">
        <span class="control-label">Enable Workbench Skin</span>
        <input type="checkbox" id="chk-workbench">
      </div>
    </div>
  </div>

  <!-- UI Colors Section -->
  <div class="section">
    <div class="section-title">Editor &amp; Workbench Colors</div>
    <div class="control-grid" id="ui-controls-grid"></div>
  </div>

  <!-- Syntax Token Colors Section -->
  <div class="section">
    <div class="section-title">Syntax Token Colors</div>
    <div class="control-grid" id="token-controls-grid"></div>
  </div>

<script>
  const vscode = acquireVsCodeApi();
  const INIT = ${payload};
  let state = JSON.parse(JSON.stringify(INIT.state));
  let debounceTimer;

  function toSixHex(color) {
    const clean = (color || '').trim();
    if (/^#[0-9a-fA-F]{6,8}$/.test(clean)) return clean.slice(0, 7);
    return '#000000';
  }

  function makeShadow(hexColor, type) {
    if (state.glow.disableGlow || Number(state.glow.brightness) === 0) return 'none';
    const alpha = Math.floor(Number(state.glow.brightness) * 255).toString(16).padStart(2, '0');
    const c = toSixHex(hexColor);
    if (type === 'white') {
      return \`0 0 2px #393a33, 0 0 8px \${c}\${alpha}, 0 0 \${state.glow.whiteGlowRadius}px \${c}\${alpha}\`;
    }
    if (type === 'blue') {
      return \`0 0 2px #001716, 0 0 4px \${c}\${alpha}, 0 0 8px \${c}\${alpha}\`;
    }
    return \`0 0 2px #000000, 0 0 4px \${c}\${alpha}, 0 0 6px \${c}\${alpha}\`;
  }

  function renderPreview() {
    const c = state.colors;
    const t = state.tokens;
    const swap = document.getElementById('preview-unfocus-toggle').checked;

    const editor = document.getElementById('preview-editor');
    editor.style.background = c['editor.background'];
    editor.style.color = c['editor.foreground'];

    const sidebar = document.getElementById('preview-sidebar');
    sidebar.style.background = c['sideBar.background'];
    sidebar.style.borderLeftColor = c['activityBar.activeBorder'];

    document.getElementById('preview-toolbar').style.background = c['titleBar.activeBackground'];
    document.getElementById('preview-tabs').style.background = c['editorGroupHeader.tabsBackground'];
    document.getElementById('preview-side-selected').style.background = c['list.activeSelectionBackground'];
    document.getElementById('preview-side-hover').style.background = c['list.hoverBackground'];
    document.getElementById('preview-tab-active').style.background = c['tab.activeBackground'];
    document.getElementById('preview-tab-inactive').style.background = c['tab.inactiveBackground'];
    document.getElementById('preview-tab-border').style.background = c['tab.activeBorder'];

    for (let i = 1; i <= 6; i++) {
      const ln = document.getElementById('ln-' + i);
      ln.style.background = c['editorGutter.background'] || c['editor.background'];
      ln.style.color = i === 4 ? c['editorLineNumber.activeForeground'] : c['editorLineNumber.foreground'];
    }

    const selFocused = document.getElementById('sel-focused');
    const selFocusedText = document.getElementById('sel-focused-text');
    const selUnfocused = document.getElementById('sel-unfocused');

    selFocused.style.background = swap ? c['editor.inactiveSelectionBackground'] : c['editor.selectionBackground'];
    selFocusedText.style.color = c['editor.selectionForeground'];
    selUnfocused.style.background = swap ? c['editor.selectionBackground'] : c['editor.inactiveSelectionBackground'];

    // Syntax colors + glow
    const whiteShadow = makeShadow(t.keywords, 'white');
    const fnShadow = makeShadow(t.functions, 'white');
    const redShadow = makeShadow(t.variables, 'red');
    const hdrShadow = makeShadow(t.headers, 'red');
    const blueShadow = makeShadow(t.brackets, 'blue');

    const applyTok = (id, color, shadow = 'none', extraStyle = '') => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.color = color;
      el.style.textShadow = shadow;
      if (extraStyle === 'italic') el.style.fontStyle = 'italic';
      if (extraStyle === 'bold') el.style.fontWeight = 'bold';
    };

    applyTok('tok-comment', t.comments, 'none', 'italic');
    applyTok('tok-kw', t.keywords, whiteShadow);
    applyTok('tok-kw2', t.keywords, whiteShadow);
    applyTok('tok-fn', t.functions, fnShadow);
    applyTok('tok-fn2', t.functions, fnShadow);
    applyTok('tok-var', t.variables, redShadow);
    applyTok('tok-var2', t.variables, redShadow);
    applyTok('tok-var3', t.variables, redShadow);
    applyTok('tok-type', t.types);
    applyTok('tok-num', t.numbers);
    applyTok('tok-str', t.strings);
    applyTok('tok-hdr', t.headers, hdrShadow, 'bold');
    applyTok('tok-tag', t.tags);
    applyTok('tok-tag2', t.tags);
    for (const id of ['tok-br1', 'tok-br2', 'tok-br3', 'tok-br4', 'tok-br5']) {
      applyTok(id, t.brackets, blueShadow);
    }
  }

  function scheduleSync() {
    renderPreview();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      vscode.postMessage({ type: 'update', state });
    }, 60);
  }

  function buildControls() {
    // Presets
    const presetsBar = document.getElementById('presets-bar');
    presetsBar.innerHTML = '';
    for (const [key, preset] of Object.entries(INIT.presets)) {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.textContent = 'Preset: ' + preset.name;
      btn.addEventListener('click', () => {
        state.colors = { ...state.defaults.colors, ...preset.colors };
        state.tokens = { ...state.defaults.tokens, ...preset.tokens };
        state.glow = { ...preset.glow };
        syncInputsFromState();
        scheduleSync();
      });
      presetsBar.appendChild(btn);
    }

    // UI Controls
    const uiGrid = document.getElementById('ui-controls-grid');
    uiGrid.innerHTML = '';
    for (const item of INIT.uiControls) {
      uiGrid.appendChild(createColorRow(
        item.label,
        () => state.colors[item.key],
        val => { state.colors[item.key] = val; scheduleSync(); },
        () => { state.colors[item.key] = state.defaults.colors[item.key]; syncInputsFromState(); scheduleSync(); },
        'ui-' + item.key
      ));
    }

    // Token Controls
    const tokenGrid = document.getElementById('token-controls-grid');
    tokenGrid.innerHTML = '';
    for (const item of INIT.tokenControls) {
      tokenGrid.appendChild(createColorRow(
        item.label,
        () => state.tokens[item.id],
        val => { state.tokens[item.id] = val; scheduleSync(); },
        () => { state.tokens[item.id] = state.defaults.tokens[item.id]; syncInputsFromState(); scheduleSync(); },
        'tok-' + item.id
      ));
    }

    // Glow Controls
    const rngBrightness = document.getElementById('rng-brightness');
    const rngRadius = document.getElementById('rng-radius');
    const chkGlow = document.getElementById('chk-glow');
    const chkWorkbench = document.getElementById('chk-workbench');

    rngBrightness.addEventListener('input', () => {
      state.glow.brightness = Number(rngBrightness.value);
      document.getElementById('val-brightness').textContent = Math.round(state.glow.brightness * 100) + '%';
      scheduleSync();
    });
    rngRadius.addEventListener('input', () => {
      state.glow.whiteGlowRadius = Number(rngRadius.value);
      document.getElementById('val-radius').textContent = state.glow.whiteGlowRadius + 'px';
      scheduleSync();
    });
    chkGlow.addEventListener('change', () => {
      state.glow.disableGlow = !chkGlow.checked;
      scheduleSync();
    });
    chkWorkbench.addEventListener('change', () => {
      state.enableWorkbench = chkWorkbench.checked;
      scheduleSync();
    });
    document.getElementById('preview-unfocus-toggle').addEventListener('change', renderPreview);

    document.getElementById('btn-reset').addEventListener('click', () => {
      vscode.postMessage({ type: 'resetAll' });
    });
    document.getElementById('btn-save').addEventListener('click', () => {
      vscode.postMessage({ type: 'saveToThemeFile', state });
    });
  }

  function createColorRow(label, getter, setter, resetter, domId) {
    const row = document.createElement('div');
    row.className = 'control-row';

    const lbl = document.createElement('span');
    lbl.className = 'control-label';
    lbl.textContent = label;
    lbl.title = label;

    const inputs = document.createElement('div');
    inputs.className = 'color-inputs';

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.id = 'picker-' + domId;

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.className = 'hex-input';
    hex.id = 'hex-' + domId;
    hex.maxLength = 9;

    const reset = document.createElement('button');
    reset.className = 'mini-reset';
    reset.textContent = '↺';
    reset.title = 'Reset to default';

    picker.addEventListener('input', () => {
      const current = getter() || '';
      const alphaSuffix = current.length === 9 ? current.slice(7, 9) : '';
      const next = picker.value + alphaSuffix;
      hex.value = next;
      setter(next);
    });

    hex.addEventListener('input', () => {
      const val = hex.value.trim();
      if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(val)) {
        picker.value = val.slice(0, 7);
        setter(val);
      }
    });

    reset.addEventListener('click', resetter);

    inputs.append(picker, hex, reset);
    row.append(lbl, inputs);
    return row;
  }

  function syncInputsFromState() {
    for (const item of INIT.uiControls) {
      const val = state.colors[item.key] || '#000000';
      const picker = document.getElementById('picker-ui-' + item.key);
      const hex = document.getElementById('hex-ui-' + item.key);
      if (picker) picker.value = toSixHex(val);
      if (hex) hex.value = val;
    }
    for (const item of INIT.tokenControls) {
      const val = state.tokens[item.id] || '#fefefe';
      const picker = document.getElementById('picker-tok-' + item.id);
      const hex = document.getElementById('hex-tok-' + item.id);
      if (picker) picker.value = toSixHex(val);
      if (hex) hex.value = val;
    }
    document.getElementById('rng-brightness').value = state.glow.brightness;
    document.getElementById('val-brightness').textContent = Math.round(state.glow.brightness * 100) + '%';
    document.getElementById('rng-radius').value = state.glow.whiteGlowRadius;
    document.getElementById('val-radius').textContent = state.glow.whiteGlowRadius + 'px';
    document.getElementById('chk-glow').checked = !state.glow.disableGlow;
    document.getElementById('chk-workbench').checked = !!state.enableWorkbench;
    renderPreview();
  }

  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg.type === 'syncState') {
      state = msg.state;
      syncInputsFromState();
    } else if (msg.type === 'toast') {
      const toast = document.getElementById('status-toast');
      toast.textContent = ' // ' + msg.text;
      setTimeout(() => { toast.textContent = ''; }, 2500);
    }
  });

  buildControls();
  syncInputsFromState();
</script>
</body>
</html>`;
}

function registerControlPanel(vscode, context, extensionRoot) {
	const themePath = path.join(extensionRoot, 'themes', 'gloria-color-theme.json');
	const iconUri = vscode.Uri?.file?.(path.join(extensionRoot, 'assets', 'rabbit.svg'))
		|| { fsPath: path.join(extensionRoot, 'assets', 'rabbit.svg') };
	const webviews = new Set();
	let activePanel;
	let applying = false;
	let ignoreConfigUntil = 0;

	function broadcastState(toastText) {
		const state = readCurrentState(vscode, themePath);
		for (const webview of webviews) {
			webview.postMessage({ type: 'syncState', state });
			if (toastText) webview.postMessage({ type: 'toast', text: toastText });
		}
	}

	async function handleMessage(message) {
		try {
			applying = true;
			ignoreConfigUntil = Date.now() + 400;
			if (message.type === 'update' && message.state) {
				await applyCustomizations(vscode, themePath, message.state, false);
			} else if (message.type === 'resetAll') {
				const defaults = getBaseDefaults();
				writeThemeJson(themePath, defaults);
				await applyCustomizations(vscode, themePath, {
					colors: defaults.colors,
					tokens: defaults.tokens,
					glow: { brightness: 0.45, whiteGlowRadius: 25, disableGlow: false },
					enableWorkbench: true
				}, true);
				broadcastState('Reset to defaults');
			} else if (message.type === 'saveToThemeFile' && message.state) {
				await saveToThemeFile(vscode, themePath, message.state);
				broadcastState('Saved to gloria-color-theme.json');
			}
		} finally {
			ignoreConfigUntil = Date.now() + 400;
			applying = false;
		}
	}

	function attachWebview(webview) {
		webview.options = { enableScripts: true };
		webview.html = buildWebviewHtml(readCurrentState(vscode, themePath));
		webviews.add(webview);
		const sub = webview.onDidReceiveMessage(handleMessage);
		return () => {
			sub.dispose();
			webviews.delete(webview);
		};
	}

	// 1. Sidebar WebviewViewProvider
	const viewProvider = {
		resolveWebviewView(webviewView) {
			const detach = attachWebview(webviewView.webview);
			webviewView.onDidDispose?.(detach);
		}
	};
	if (vscode.window.registerWebviewViewProvider) {
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider('gloria.controlPanelView', viewProvider)
		);
	}

	// 2. Command to open full Editor Tab WebviewPanel
	const openCommand = vscode.commands.registerCommand('gloria.openControlPanel', () => {
		if (activePanel) {
			activePanel.reveal();
			return;
		}
		if (!vscode.window.createWebviewPanel) return;
		const column = vscode.ViewColumn?.One || 1;
		const panel = vscode.window.createWebviewPanel(
			'gloria.controlPanel',
			'Gloria Control Panel',
			column,
			{ enableScripts: true, retainContextWhenHidden: true }
		);
		panel.iconPath = iconUri;
		activePanel = panel;
		const detach = attachWebview(panel.webview);
		panel.onDidDispose(() => {
			detach();
			activePanel = undefined;
		});
	});
	context.subscriptions.push(openCommand);

	// 3. Command to reset all customizations
	const resetCommand = vscode.commands.registerCommand('gloria.resetColors', async () => {
		await handleMessage({ type: 'resetAll' });
	});
	context.subscriptions.push(resetCommand);

	// 4. Bottom Status Bar Rabbit Icon (right side, like GitHub Copilot & Biome)
	let statusBarItem;
	if (vscode.window.createStatusBarItem) {
		const alignment = vscode.StatusBarAlignment?.Right ?? 2;
		statusBarItem = vscode.window.createStatusBarItem(alignment, 100);
		statusBarItem.text = '$(gloria-rabbit) Gloria';
		statusBarItem.tooltip = 'Open Gloria Theme Control Panel';
		statusBarItem.command = 'gloria.openControlPanel';
		statusBarItem.show();
		context.subscriptions.push(statusBarItem);
	}

	// Keep open webviews synced if settings change externally
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(event => {
			if (applying || Date.now() < ignoreConfigUntil || webviews.size === 0) return;
			if (
				event.affectsConfiguration('gloria') ||
				event.affectsConfiguration('workbench.colorCustomizations') ||
				event.affectsConfiguration('editor.tokenColorCustomizations')
			) {
				broadcastState();
			}
		})
	);

	return {
		dispose() {
			activePanel?.dispose();
			statusBarItem?.dispose();
			webviews.clear();
		}
	};
}

module.exports = {
	UI_COLOR_CONTROLS,
	TOKEN_CONTROLS,
	PRESETS,
	readCurrentState,
	applyCustomizations,
	saveToThemeFile,
	registerControlPanel
};
