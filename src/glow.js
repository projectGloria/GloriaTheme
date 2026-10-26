// Glow shapes. The renderer only sees final token colors (VS Code merges equal colors into one
// .mtkN class), so a role's glow is keyed by its current 6-digit hex. Roles sharing a color share a glow.
const GLOW_KINDS = ['halo', 'bracket', 'ember'];

// Stock theme colors of the glowing roles. The extension writes the live map (including
// user customizations) into the state file; this is only the fallback for older state files.
const DEFAULT_GLOW_COLORS = {
	fdfdfd: 'halo', // keywords, functions, CSS selectors and curly braces
	'1e90ff': 'bracket',
	ff0000: 'ember', // variables and properties
	ff0001: 'ember' // Markdown headers
};

function normalizeGlowSettings(settings = {}) {
	const clamp = (value, fallback, maximum) => {
		const number = Number.parseFloat(value);
		return Number.isFinite(number) ? Math.min(maximum, Math.max(0, number)) : fallback;
	};
	return {
		brightness: clamp(settings.brightness, 0.45, 1),
		disableGlow: !!settings.disableGlow,
		whiteGlowRadius: clamp(settings.whiteGlowRadius, 25, 50)
	};
}

// The state file is plain JSON on disk; reject anything that is not hex -> known kind.
function normalizeGlowColors(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const colors = {};
	for (const [hex, kind] of Object.entries(value)) {
		if (/^[0-9a-f]{6}$/i.test(hex) && GLOW_KINDS.includes(kind)) colors[hex.toLowerCase()] = kind;
	}
	return colors;
}

function glowShadow(color, settings, kind = DEFAULT_GLOW_COLORS[color] || 'ember') {
	const { brightness, disableGlow, whiteGlowRadius } = normalizeGlowSettings(settings);
	if (disableGlow || brightness === 0) return 'none';
	const alpha = Math.floor(brightness * 255).toString(16).padStart(2, '0');
	if (kind === 'halo') {
		// Off-white tokens get a pure white halo; tinted roles glow in their own hue.
		const halo = color === 'fdfdfd' ? 'ffffff' : color;
		return `0 0 2px #393a33, 0 0 8px #${halo}${alpha}, 0 0 ${whiteGlowRadius}px #${halo}${alpha}`;
	}
	if (kind === 'bracket') return `0 0 2px #001716, 0 0 4px #${color}${alpha}, 0 0 8px #${color}${alpha}`;
	const ember = color === 'ff0001' ? 'ff0000' : color;
	return `0 0 2px #000000, 0 0 4px #${ember}${alpha}, 0 0 6px #${ember}${alpha}`;
}

if (typeof module !== 'undefined' && typeof window === 'undefined') {
	module.exports = { GLOW_KINDS, DEFAULT_GLOW_COLORS, normalizeGlowSettings, normalizeGlowColors, glowShadow };
}
