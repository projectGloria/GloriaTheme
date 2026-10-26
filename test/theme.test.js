const assert = require('node:assert/strict');
const test = require('node:test');
const theme = require('../themes/gloria-color-theme.json');
const { DEFAULT_GLOW_COLORS, normalizeGlowSettings, glowShadow } = require('../src/glow');

function rgb(hex) { return hex.slice(1, 7).match(/../g).map(value => parseInt(value, 16) / 255); }
function luminance(color) {
	return rgb(color).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
		.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(first, second) {
	const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
	return (values[0] + 0.05) / (values[1] + 0.05);
}
function composite(foreground, background) {
	if (foreground.length <= 7) return foreground;
	const alpha = parseInt(foreground.slice(7, 9), 16) / 255;
	const base = rgb(background);
	return '#' + rgb(foreground).map((value, index) => Math.round((value * alpha + base[index] * (1 - alpha)) * 255)
		.toString(16).padStart(2, '0')).join('');
}

test('declared syntax colors retain readable base contrast and selected text retains contrast', () => {
	for (const rule of theme.tokenColors) {
		if (rule.settings.foreground) assert.ok(contrast(rule.settings.foreground, theme.colors['editor.background']) >= 4.5, rule.name);
	}
	assert.ok(contrast(theme.colors['editor.selectionForeground'], theme.colors['editor.selectionBackground']) >= 4.5);
	const inactive = composite(theme.colors['editor.inactiveSelectionBackground'], theme.colors['editor.background']);
	assert.ok(contrast(inactive, theme.colors['editor.background']) >= 4.5);
	assert.ok(contrast(theme.colors['list.hoverForeground'], theme.colors['list.hoverBackground']) >= 4.5);
});

test('control panel roles resolve to theme rules and glow defaults match the shipped colors', () => {
	const { TOKEN_CONTROLS, UI_COLOR_CONTROLS, glowColorsFor, getDefaults } = require('../src/controlPanel');
	const names = new Set(theme.tokenColors.map(rule => rule.name));
	for (const item of TOKEN_CONTROLS) {
		for (const name of item.ruleNames) assert.ok(names.has(name), `${item.id}: missing rule "${name}"`);
	}
	for (const item of UI_COLOR_CONTROLS) assert.ok(theme.colors[item.key], `missing color ${item.key}`);
	const defaults = getDefaults(require.resolve('../themes/gloria-color-theme.json'));
	assert.deepEqual(glowColorsFor(defaults.tokens), DEFAULT_GLOW_COLORS);
});

test('glow settings clamp invalid numbers and zero brightness removes every shadow layer', () => {
	assert.deepEqual(normalizeGlowSettings({ brightness: -1, whiteGlowRadius: 100 }), {
		brightness: 0, disableGlow: false, whiteGlowRadius: 50
	});
	assert.equal(normalizeGlowSettings({ brightness: 'invalid' }).brightness, 0.45);
	assert.equal(normalizeGlowSettings({ brightness: Infinity }).brightness, 0.45);
	assert.equal(glowShadow('fdfdfd', { brightness: 0 }), 'none');
	assert.equal(glowShadow('ff0000', { disableGlow: true }), 'none');
	assert.match(glowShadow('fdfdfd', { whiteGlowRadius: 12 }), /12px #ffffff72/);
});
