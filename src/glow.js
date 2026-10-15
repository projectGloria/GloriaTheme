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

function glowShadow(color, settings) {
	const { brightness, disableGlow, whiteGlowRadius } = normalizeGlowSettings(settings);
	if (disableGlow || brightness === 0) return 'none';
	const alpha = Math.floor(brightness * 255).toString(16).padStart(2, '0');
	if (color === 'fdfdfd') {
		return `0 0 2px #393a33, 0 0 8px #ffffff${alpha}, 0 0 ${whiteGlowRadius}px #ffffff${alpha}`;
	}
	if (color === '1e90ff') return `0 0 2px #001716, 0 0 4px #1e90ff${alpha}, 0 0 8px #1e90ff${alpha}`;
	return `0 0 2px #000000, 0 0 4px #ff0000${alpha}, 0 0 6px #ff0000${alpha}`;
}

if (typeof module !== 'undefined' && typeof window === 'undefined') {
	module.exports = { normalizeGlowSettings, glowShadow };
}
