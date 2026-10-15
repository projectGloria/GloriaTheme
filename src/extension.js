const vscode = require('vscode');
const { findGrandparentTagRanges, parseHtmlElements } = require('./htmlGrandparents');
const { findCssPunctuationRanges, findEmbeddedCssPunctuationRanges } = require('./cssBraces');
const { normalizeGlowSettings, glowShadow } = require('./glow');
const { resolveWorkbench, installWorkbench, claimState, releaseState, restoreWorkbench } = require('./workbench');

let shutdown;

function readSettings() {
	const config = vscode.workspace.getConfiguration('gloria');
	return normalizeGlowSettings({
		brightness: config.get('brightness', 0.45),
		disableGlow: config.get('disableGlow', false),
		whiteGlowRadius: config.get('whiteGlowRadius', 25)
	});
}

function activate(context) {
	const files = resolveWorkbench(vscode.env.appRoot);
	let restored = !vscode.workspace.getConfiguration('gloria').get('enableWorkbench', true);
	const syncState = () => {
		if (!files || restored) return;
		claimState(files, readSettings());
	};
	const reportError = error => vscode.window.showErrorMessage(`Gloria: ${error.message}`);
	const synchronize = () => {
		try {
			const enabled = vscode.workspace.getConfiguration('gloria').get('enableWorkbench', true);
			if (!enabled) {
				restored = true;
				if (files) restoreWorkbench(files);
			} else {
				if (restored && files) {
					restored = false;
					installWorkbench(files, __dirname);
					vscode.window.showInformationMessage('Gloria workbench styling enabled. Reload the window to load it.');
				}
				syncState();
			}
		} catch (error) { reportError(error); }
	};

	context.subscriptions.push(vscode.commands.registerCommand('gloria.restoreWorkbench', async () => {
		if (!files) return;
		try {
			await vscode.workspace.getConfiguration('gloria').update('enableWorkbench', false, vscode.ConfigurationTarget.Global);
			restored = true;
			restoreWorkbench(files);
			await vscode.window.showInformationMessage('Gloria workbench files restored. You can now disable or uninstall Gloria. Re-enable gloria.enableWorkbench to restore the custom styling.');
		} catch (error) { reportError(error); }
	}));

	const decorations = registerDynamicGlowDecorations(context);
	const selectionContrast = registerSelectionContrast(context);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('gloria')) synchronize();
	}));

	if (files && !restored) {
		try {
			syncState();
			if (installWorkbench(files, __dirname)) {
				vscode.window.showInformationMessage(
					'Gloria styling updated. Reload the window to load it. VS Code may report its modified installation.',
					'Reload window'
				).then(action => {
					if (action) vscode.commands.executeCommand('workbench.action.reloadWindow');
				});
			}
		} catch (error) { reportError(error); }
	}
	shutdown = () => {
		decorations.dispose();
		selectionContrast.dispose();
		if (files && !restored) {
			try { releaseState(files); } catch (error) { console.error(error); }
		}
	};
}

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
	const usingGloria = () => vscode.workspace.getConfiguration('workbench').get('colorTheme') === 'Gloria';

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
		textDecoration: `none; text-shadow: ${glowShadow('fdfdfd', readSettings())}; backface-visibility: hidden`,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});
}

function registerSelectionContrast(context) {
	let disposed = false;
	const decoration = vscode.window.createTextEditorDecorationType({
		color: '#fdfdfd',
		// Native editor.selectionForeground is only rendered by high-contrast themes.
		textDecoration: 'none; color: #fdfdfd !important; text-shadow: none !important',
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});
	function update(editor) {
		if (disposed || !editor) return;
		const active = vscode.workspace.getConfiguration('workbench').get('colorTheme') === 'Gloria';
		editor.setDecorations(decoration, active ? editor.selections.filter(selection => !selection.isEmpty) : []);
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
			if (event.affectsConfiguration('workbench.colorTheme')) updateVisible();
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
