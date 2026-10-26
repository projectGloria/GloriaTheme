const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const test = require('node:test');
const { resolveWorkbench } = require('../src/workbench');

function setup(t, text = '<div><section><span>x</span></section></div>', initialGloria = {}, options = {}) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gloria-extension-'));
	const html = path.join(directory, 'out/vs/code/electron-sandbox/workbench/workbench.html');
	fs.mkdirSync(path.dirname(html), { recursive: true });
	fs.writeFileSync(html, '<html><head></head><body></body>\n</html>');
	if (options.beforeActivate) options.beforeActivate(resolveWorkbench(directory));
	const handlers = new Map();
	const commands = new Map();
	const config = { gloria: { ...initialGloria }, workbench: { colorTheme: options.colorTheme ?? 'Gloria' }, editor: { ...options.editor } };
	const subscriptions = [];
	const errors = [];
	const warnings = [];
	const statusBarItems = [];
	const webviewPanels = [];
	let reads = 0;
	const document = {
		languageId: 'html', version: 1, uri: { toString: () => 'file:///sample.html' },
		getText() { reads++; return text; }, positionAt(offset) { return { offset }; }
	};
	const editors = [0, 1].map(() => ({
		document, selections: [], decorations: new Map(),
		setDecorations(type, ranges) { this.decorations.set(type, ranges); }
	}));
	const event = name => callback => {
		if (!handlers.has(name)) handlers.set(name, new Set());
		handlers.get(name).add(callback);
		return { dispose: () => handlers.get(name).delete(callback) };
	};
	const emit = (name, data) => handlers.get(name)?.forEach(callback => callback(data));
	const change = key => emit('configuration', { affectsConfiguration: name => key === name || key.startsWith(name + '.') });
	const vscode = {
		env: { appRoot: directory },
		extensions: { getExtension: id => (options.installed || []).includes(id) ? { id } : undefined },
		ConfigurationTarget: { Global: 1 }, DecorationRangeBehavior: { ClosedClosed: 1 },
		StatusBarAlignment: { Right: 2 },
		Range: class { constructor(start, end) { this.start = start; this.end = end; } },
		commands: { registerCommand(name, callback) { commands.set(name, callback); return { dispose() {} }; }, executeCommand() {} },
		window: {
			visibleTextEditors: editors,
			createTextEditorDecorationType(options) {
				const type = { options, dispose() { for (const editor of editors) editor.decorations.delete(type); } };
				return type;
			},
			createStatusBarItem(alignment, priority) {
				const item = { alignment, priority, shown: false, show() { this.shown = true; }, dispose() {} };
				statusBarItems.push(item);
				return item;
			},
			createWebviewPanel(viewType, title) {
				let messageHandler;
				const panel = {
					viewType, title,
					webview: {
						options: {}, html: '',
						postMessage() {},
						onDidReceiveMessage(cb) { messageHandler = cb; return { dispose() {} }; },
						send(msg) { return messageHandler?.(msg); }
					},
					reveal() {}, onDidDispose() {}, dispose() {}
				};
				webviewPanels.push(panel);
				return panel;
			},
			onDidChangeVisibleTextEditors: event('visible'), onDidChangeActiveTextEditor: event('active'),
			onDidChangeTextEditorSelection: event('selection'),
			showInformationMessage: async () => undefined,
			showErrorMessage: message => errors.push(message),
			showWarningMessage: message => warnings.push(message)
		},
		workspace: {
			getConfiguration(scope) { return {
				get: (name, fallback) => config[scope]?.[name] ?? fallback,
				async update(name, value) { config[scope][name] = value; change(`${scope}.${name}`); }
			}; },
			onDidChangeConfiguration: event('configuration'), onDidChangeTextDocument: event('text'),
			onDidCloseTextDocument: event('close')
		}
	};
	const source = path.join(__dirname, '../src/extension.js');
	const localRequire = createRequire(source);
	const module = { exports: {} };
	vm.runInNewContext(fs.readFileSync(source, 'utf8'), {
		module, require: name => name === 'vscode' ? vscode : localRequire(name),
		__dirname: path.dirname(source), console: { ...console, error: error => errors.push(error.message) }, setTimeout, clearTimeout, setInterval, clearInterval
	}, { filename: source });
	module.exports.activate({ subscriptions, extension: { id: 'Nihilnia.gloria-theme' } });
	t.after(() => {
		module.exports.deactivate();
		for (const subscription of subscriptions) subscription.dispose();
		assert.equal(path.dirname(directory), os.tmpdir());
		fs.rmSync(directory, { recursive: true, force: true });
		assert.deepEqual(errors, []);
	});
	const structural = editor => Array.from(editor.decorations.entries()).find(([type]) => !type.options.textDecoration.includes('!important'));
	return { config, commands, emit, change, editors, document, statusBarItems, webviewPanels, warnings,
		files: resolveWorkbench(directory), structural, reads: () => reads, extension: module.exports };
}

test('split editors reuse parsed ranges and configuration reaches both glow mechanisms', t => {
	const r = setup(t);
	assert.equal(r.reads(), 1);
	assert.strictEqual(r.structural(r.editors[0])[1], r.structural(r.editors[1])[1]);
	r.config.gloria.brightness = 0.8;
	r.config.gloria.whiteGlowRadius = 12;
	r.change('gloria.brightness');
	const state = JSON.parse(fs.readFileSync(r.files.stateFile));
	assert.equal(state.brightness, 0.8);
	assert.equal(state.whiteGlowRadius, 12);
	assert.match(r.structural(r.editors[0])[0].options.textDecoration, /12px #ffffffcc/);
	assert.equal(r.reads(), 1, 'brightness must not reparse the document');
	r.config.workbench.colorTheme = 'Other';
	r.change('workbench.colorTheme');
	assert.equal(r.structural(r.editors[0])[1].length, 0);
});

test('text changes invalidate cached ranges once for both splits', async t => {
	const r = setup(t);
	r.document.version++;
	r.emit('text', { document: r.document });
	await new Promise(resolve => setTimeout(resolve, 100));
	assert.equal(r.reads(), 2);
});

test('large documents skip structural decorations and can be explicitly budgeted', t => {
	const r = setup(t, '<div>'.repeat(210000));
	assert.equal(r.structural(r.editors[0])[1].length, 0);
	assert.equal(r.reads(), 1);
});

test('selected text gets readable contrast in ordinary dark mode and clears with the theme', t => {
	const r = setup(t);
	const selection = { isEmpty: false, start: { offset: 0 }, end: { offset: 8 } };
	r.editors[0].selections = [selection, { isEmpty: true }];
	r.emit('selection', { textEditor: r.editors[0] });
	const entry = Array.from(r.editors[0].decorations.entries()).find(([type]) => type.options.color === '#fdfdfd' && type.options.textDecoration.includes('!important'));
	assert.equal(entry[0].options.color, '#fdfdfd');
	assert.deepEqual(Array.from(entry[1]), [selection]);
	r.config.workbench.colorTheme = 'Other';
	r.change('workbench.colorTheme');
	assert.equal(r.editors[0].decorations.get(entry[0]).length, 0);
});

test('restore command persists opt-out, restores HTML, removes generated files and decorations', async t => {
	const r = setup(t);
	await r.commands.get('gloria.restoreWorkbench')();
	assert.equal(r.config.gloria.enableWorkbench, false);
	assert.equal(fs.existsSync(r.files.scriptFile), false);
	assert.equal(fs.existsSync(r.files.stateFile), false);
	assert.doesNotMatch(fs.readFileSync(r.files.htmlFile, 'utf8'), /GLORIA/);
	r.config.gloria.brightness = 0.2;
	r.change('gloria.brightness');
	assert.equal(fs.existsSync(r.files.scriptFile), false, 'ordinary settings must not undo restoration');
});

test('deactivation disables the renderer state', t => {
	const r = setup(t);
	r.extension.deactivate();
	assert.deepEqual(JSON.parse(fs.readFileSync(r.files.stateFile)), { enabled: false });
});

test('restored setup stays disabled on startup and can be enabled again', t => {
	const r = setup(t, '<div><section><span>x</span></section></div>', { enableWorkbench: false });
	assert.equal(fs.existsSync(r.files.scriptFile), false);
	assert.equal(r.structural(r.editors[0])[1].length, 0);
	r.config.gloria.enableWorkbench = true;
	r.change('gloria.enableWorkbench');
	assert.equal(fs.existsSync(r.files.scriptFile), true);
	assert.ok(r.structural(r.editors[0])[1].length > 0);
});

test('CSS parentheses keep their flat styling in embedded CSS with bracket coloring enabled', t => {
	const r = setup(t, '<style>.card { width: calc(100% - 2rem); content: "(text)"; }</style>');
	const punctuation = Array.from(r.editors[0].decorations.entries()).find(([type]) => type.options.color === '#569cd6');
	assert.equal(punctuation[1].length, 2);
	assert.match(punctuation[0].options.textDecoration, /text-shadow: none !important/);
});

test('status bar rabbit icon opens control panel webview and live updates apply and reset', async t => {
	const r = setup(t);
	assert.equal(r.statusBarItems.length, 1);
	assert.equal(r.statusBarItems[0].text, '$(gloria-rabbit) Gloria');
	assert.equal(r.statusBarItems[0].command, 'gloria.openControlPanel');
	assert.equal(r.statusBarItems[0].shown, true);

	r.commands.get('gloria.openControlPanel')();
	assert.equal(r.webviewPanels.length, 1);
	assert.match(r.webviewPanels[0].webview.html, /LIVE PREVIEW/);

	await r.webviewPanels[0].webview.send({
		type: 'update',
		state: {
			colors: { 'editor.inactiveSelectionBackground': '#00FF41', 'editor.selectionBackground': '#990000' },
			tokens: { variables: '#00FF41' },
			glow: { brightness: 0.7, whiteGlowRadius: 30, disableGlow: false },
			enableWorkbench: true
		}
	});
	assert.equal(r.config.workbench.colorCustomizations['[Gloria]']['editor.selectionBackground'], '#990000');
	assert.equal(r.config.editor.tokenColorCustomizations['[Gloria]'].textMateRules[0].settings.foreground, '#00FF41');
	assert.equal(r.config.gloria.brightness, 0.7);

	await r.commands.get('gloria.resetColors')();
	assert.equal(r.config.workbench.colorCustomizations, undefined);
	assert.equal(r.config.editor.tokenColorCustomizations, undefined);
	assert.equal(r.config.gloria.brightness, 0.45);
});

test('installing Gloria does not patch VS Code until it is the active theme, and switching away unpatches', t => {
	const r = setup(t, undefined, {}, { colorTheme: 'Other' });
	assert.equal(fs.existsSync(r.files.scriptFile), false);
	assert.doesNotMatch(fs.readFileSync(r.files.htmlFile, 'utf8'), /GLORIA/);
	r.config.workbench.colorTheme = 'Gloria';
	r.change('workbench.colorTheme');
	assert.equal(fs.existsSync(r.files.scriptFile), true);
	assert.match(fs.readFileSync(r.files.htmlFile, 'utf8'), /GLORIA/);
	r.config.workbench.colorTheme = 'Other';
	r.change('workbench.colorTheme');
	assert.equal(fs.existsSync(r.files.scriptFile), false);
	assert.doesNotMatch(fs.readFileSync(r.files.htmlFile, 'utf8'), /GLORIA/);
});

test('starting on another theme removes a patch left behind by an earlier session', t => {
	const { installWorkbench } = require('../src/workbench');
	const r = setup(t, undefined, {}, {
		colorTheme: 'Other',
		beforeActivate: files => installWorkbench(files, path.join(__dirname, '..', 'src'))
	});
	assert.equal(fs.existsSync(r.files.scriptFile), false);
	assert.doesNotMatch(fs.readFileSync(r.files.htmlFile, 'utf8'), /GLORIA/);
});

test('the state file carries a role glow map that follows token customizations', async t => {
	const r = setup(t);
	const state = () => JSON.parse(fs.readFileSync(r.files.stateFile));
	assert.deepEqual(state().glowColors, { ff0000: 'ember', d580ff: 'halo', fdfdfd: 'halo', '1e90ff': 'bracket' });
	r.commands.get('gloria.openControlPanel')();
	await r.webviewPanels[0].webview.send({ type: 'update', state: { tokens: { keywords: '#00ffff' } } });
	assert.equal(state().glowColors['00ffff'], 'halo', 'recolored keywords keep their glow');
	assert.equal(state().glowColors.d580ff, undefined);
});

test('a copy installed under the pre-rename publisher triggers a warning', t => {
	const r = setup(t, undefined, {}, { installed: ['Nihil.gloria-theme'] });
	assert.equal(r.warnings.length, 1);
	assert.match(r.warnings[0], /Nihil\.gloria-theme/);
});

test('control panel enforces a CSP, rejects invalid input and preserves hand-written customizations', async t => {
	const own = { scope: 'comment', settings: { foreground: '#123456' } };
	const r = setup(t, undefined, {}, {
		editor: { tokenColorCustomizations: { '[Gloria]': { textMateRules: [own] } } }
	});
	r.commands.get('gloria.openControlPanel')();
	const { webview } = r.webviewPanels[0];
	const nonce = /script-src 'nonce-([^']+)'/.exec(webview.html)?.[1];
	assert.ok(nonce);
	assert.ok(webview.html.includes(`<script nonce="${nonce}">`));
	assert.deepEqual(webview.options.localResourceRoots, []);

	await webview.send({ type: 'update', state: { colors: { 'editor.background': 'red; x: y' }, tokens: { strings: 'javascript:' } } });
	assert.equal(r.config.workbench.colorCustomizations, undefined);
	assert.deepEqual(r.config.editor.tokenColorCustomizations['[Gloria]'].textMateRules, [own]);

	await webview.send({ type: 'update', state: { tokens: { strings: '#00ff00' } } });
	const rules = r.config.editor.tokenColorCustomizations['[Gloria]'].textMateRules;
	assert.equal(rules.length, 2);
	assert.ok(rules[1].scope.includes('support.constant.property-value.css'), 'scopes come from every rule the control owns');

	await r.commands.get('gloria.resetColors')();
	assert.deepEqual(r.config.editor.tokenColorCustomizations['[Gloria]'].textMateRules, [own]);
});
