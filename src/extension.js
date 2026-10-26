const path = require('path');
const vscode = require('vscode');
const { findGrandparentTagRanges, parseHtmlElements } = require('./htmlGrandparents');
const { findCssPunctuationRanges, findEmbeddedCssPunctuationRanges } = require('./cssBraces');
const { normalizeGlowSettings, glowShadow } = require('./glow');
const {
	OWNER_HEARTBEAT_MS, resolveWorkbench, installWorkbench, isInstalled, liveOwners,
	claimState, releaseState, restoreWorkbench
} = require('./workbench');
const { registerControlPanel, readCurrentState, glowColorsFor } = require('./controlPanel');

// Builds published before the publisher rename; both copies would register the same commands.
const LEGACY_EXTENSION_IDS = ['Nihil.gloria-theme'];
const themePath = path.join(__dirname, '..', 'themes', 'gloria-color-theme.json');
const usingGloria = () => vscode.workspace.getConfiguration('workbench').get('colorTheme') === 'Gloria';

let shutdown;

function readGlowSettings() {
	const config = vscode.workspace.getConfiguration('gloria');
	return normalizeGlowSettings({
		brightness: config.get('brightness', 0.45),
		disableGlow: config.get('disableGlow', false),
		whiteGlowRadius: config.get('whiteGlowRadius', 25)
	});
}

function readSettings() {
	return {
		...readGlowSettings(),
		// Effective role colors (theme + customizations), so recolored roles keep glowing.
		glowColors: glowColorsFor(readCurrentState(vscode, themePath).tokens)
	};
}

function warnAboutLegacyCopies(context) {
	for (const id of LEGACY_EXTENSION_IDS) {
		if (id.toLowerCase() === context.extension?.id?.toLowerCase()) continue;
		if (!vscode.extensions?.getExtension?.(id)) continue;
		vscode.window.showWarningMessage(`Gloria is also installed under the old ID "${id}". Uninstall that copy: both register the same commands and patch the same workbench files.`);
	}
}

function activate(context) {
	// Runs first: if a legacy copy already registered our commands, the registrations below throw.
	warnAboutLegacyCopies(context);
	const files = resolveWorkbench(vscode.env.appRoot);
	const reportError = error => vscode.window.showErrorMessage(`Gloria: ${error.message}`);
	// Installing the extension alone must not modify VS Code: patch only while Gloria is the active theme.
	const wanted = () => vscode.workspace.getConfiguration('gloria').get('enableWorkbench', true) && usingGloria();
	let claimed = false;

	const promptReload = () => vscode.window.showInformationMessage(
		'Gloria workbench styling installed. Reload the window to load it. VS Code may report its installation as modified.',
		'Reload window'
	).then(action => {
		if (action) vscode.commands.executeCommand('workbench.action.reloadWindow');
	});

	const synchronize = () => {
		if (!files) return;
		try {
			if (wanted()) {
				claimState(files, readSettings());
				const firstClaim = !claimed;
				claimed = true;
				// Install checks read several files; repeat them only when this window starts rendering Gloria.
				if (firstClaim && installWorkbench(files, __dirname)) promptReload();
			} else {
				const others = claimed ? releaseState(files) : liveOwners(files).length;
				claimed = false;
				// Another window may still render Gloria through a workspace-level theme override.
				if (!others && isInstalled(files)) restoreWorkbench(files);
			}
		} catch (error) { reportError(error); }
	};

	context.subscriptions.push(vscode.commands.registerCommand('gloria.restoreWorkbench', async () => {
		if (!files) return;
		try {
			await vscode.workspace.getConfiguration('gloria').update('enableWorkbench', false, vscode.ConfigurationTarget.Global);
			// Explicit request: restore even if another window still holds a claim.
			claimed = false;
			restoreWorkbench(files);
			await vscode.window.showInformationMessage('Gloria workbench files restored. You can now disable or uninstall Gloria. Re-enable gloria.enableWorkbench to restore the custom styling.');
		} catch (error) { reportError(error); }
	}));

	const decorations = registerDynamicGlowDecorations(context);
	const selectionContrast = registerSelectionContrast(context);
	const controlPanel = registerControlPanel(vscode, context, path.join(__dirname, '..'));
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
		if (['gloria', 'workbench.colorTheme', 'workbench.colorCustomizations', 'editor.tokenColorCustomizations']
			.some(section => event.affectsConfiguration(section))) synchronize();
	}));

	synchronize();
	// Re-claiming refreshes the owner file's mtime so other windows can tell it from a recycled PID.
	const heartbeat = setInterval(() => { if (claimed) synchronize(); }, OWNER_HEARTBEAT_MS);
	heartbeat.unref?.();
	shutdown = () => {
		clearInterval(heartbeat);
		decorations.dispose();
		selectionContrast.dispose();
		controlPanel.dispose();
		// Leave the patch in place on shutdown; the next startup would only reinstall it.
		if (files && claimed) {
			try { releaseState(files); } catch (error) { console.error(error); }
		}
	};
}

// Decoration CSS goes through `textDecoration: 'none; <more css>'`: VS Code concatenates that string
// into a style rule unsanitized. It is the only way to set text-shadow or override token colors from an
// extension, and an unsupported one: if VS Code ever sanitizes it, these decorations silently lose styling.
function registerDynamicGlowDecorations(context) {
	const timers = new Map();
	const cache = new WeakMap();
	let disposed = false;
	let decoration = createWhiteGlowDecorationType();
	const quietPunctuation = vscode.window.createTextEditorDecorationType({
		color: '#569cd6',
		textDecoration: 'none; color: #569cd6 !important; text-shadow: none !important',
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	function rangesFor(document) {
		const maximum = vscode.workspace.getConfiguration('gloria').get('maxDecorationFileSize', 1000000);
		const previous = cache.get(document);
		if (previous?.version === document.version && previous.maximum === maximum) return previous.ranges;
		const text = document.getText();
		let glowing = [];
		let quiet = [];
		if (text.length <= maximum) {
			if (document.languageId === 'html') {
				const elements = parseHtmlElements(text);
				const punctuation = findEmbeddedCssPunctuationRanges(text, elements);
				glowing = findGrandparentTagRanges(text, elements).concat(punctuation.curly);
				quiet = punctuation.round;
			} else if (document.languageId === 'css') {
				const punctuation = findCssPunctuationRanges(text);
				glowing = punctuation.curly;
				quiet = punctuation.round;
			}
		}
		const convert = raw => raw.map(range => new vscode.Range(
			document.positionAt(range.start), document.positionAt(range.start + range.length)
		));
		const ranges = glowing.length + quiet.length > 20000
			? { glowing: [], quiet: [] }
			: { glowing: convert(glowing), quiet: convert(quiet) };
		cache.set(document, { version: document.version, maximum, ranges });
		return ranges;
	}

	function updateEditor(editor) {
		if (disposed || !editor) return;
		const supported = ['html', 'css'].includes(editor.document.languageId);
		const enabled = vscode.workspace.getConfiguration('gloria').get('enableWorkbench', true);
		const ranges = enabled && supported && usingGloria() ? rangesFor(editor.document) : { glowing: [], quiet: [] };
		editor.setDecorations(decoration, ranges.glowing);
		editor.setDecorations(quietPunctuation, ranges.quiet);
	}
	function updateVisibleEditors() {
		for (const editor of vscode.window.visibleTextEditors) updateEditor(editor);
	}
	function schedule(document) {
		if (disposed || !usingGloria() || !['html', 'css'].includes(document.languageId)) return;
		const key = document.uri.toString();
		clearTimeout(timers.get(key));
		timers.set(key, setTimeout(() => {
			timers.delete(key);
			for (const editor of vscode.window.visibleTextEditors) {
				if (editor.document === document) updateEditor(editor);
			}
		}, 75));
	}
	const lifetime = {
		dispose() {
			if (disposed) return;
			disposed = true;
			for (const timer of timers.values()) clearTimeout(timer);
			timers.clear();
			decoration.dispose();
			quietPunctuation.dispose();
		}
	};
	context.subscriptions.push(
		vscode.window.onDidChangeVisibleTextEditors(updateVisibleEditors),
		vscode.window.onDidChangeActiveTextEditor(updateEditor),
		vscode.workspace.onDidChangeTextDocument(event => schedule(event.document)),
		vscode.workspace.onDidCloseTextDocument(document => {
			const key = document.uri.toString();
			clearTimeout(timers.get(key));
			timers.delete(key);
			cache.delete(document);
		}),
		vscode.workspace.onDidChangeConfiguration(event => {
			if (disposed) return;
			if (event.affectsConfiguration('gloria')) {
				decoration.dispose();
				decoration = createWhiteGlowDecorationType();
			}
			if (event.affectsConfiguration('gloria') || event.affectsConfiguration('workbench.colorTheme')) updateVisibleEditors();
		}),
		lifetime
	);
	updateVisibleEditors();
	return lifetime;
}

function createWhiteGlowDecorationType() {
	return vscode.window.createTextEditorDecorationType({
		color: '#fdfdfd',
		textDecoration: `none; text-shadow: ${glowShadow('fdfdfd', readGlowSettings())}; backface-visibility: hidden`,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});
}

function registerSelectionContrast(context) {
	let disposed = false;
	const createDecoration = () => {
		const custom = vscode.workspace.getConfiguration('workbench').get('colorCustomizations')?.['[Gloria]']?.['editor.selectionForeground'];
		// The value lands inside raw CSS (see textDecoration note above): accept hex colors only.
		const fg = /^#[0-9a-f]{3,8}$/i.test(custom) ? custom : '#fdfdfd';
		return vscode.window.createTextEditorDecorationType({
			color: fg,
			// Native editor.selectionForeground is only rendered by high-contrast themes.
			textDecoration: `none; color: ${fg} !important; text-shadow: none !important`,
			rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
		});
	};
	let decoration = createDecoration();
	function update(editor) {
		if (disposed || !editor) return;
		editor.setDecorations(decoration, usingGloria() ? editor.selections.filter(selection => !selection.isEmpty) : []);
	}
	function updateVisible() {
		for (const editor of vscode.window.visibleTextEditors) update(editor);
	}
	const lifetime = { dispose() {
		if (disposed) return;
		disposed = true;
		decoration.dispose();
	} };
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(event => update(event.textEditor)),
		vscode.window.onDidChangeVisibleTextEditors(updateVisible),
		vscode.workspace.onDidChangeConfiguration(event => {
			if (disposed) return;
			if (event.affectsConfiguration('workbench.colorCustomizations')) {
				decoration.dispose();
				decoration = createDecoration();
				updateVisible();
			} else if (event.affectsConfiguration('workbench.colorTheme')) {
				updateVisible();
			}
		}),
		lifetime
	);
	updateVisible();
	return lifetime;
}

function deactivate() {
	shutdown?.();
	shutdown = undefined;
}

module.exports = { activate, deactivate };
