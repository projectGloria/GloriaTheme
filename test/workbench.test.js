const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawn } = require('node:child_process');
const { JSDOM } = require('jsdom');
const { installWorkbench, writeState, claimState, releaseState, restoreWorkbench, resolveWorkbench } = require('../src/workbench');
const { glowShadow } = require('../src/glow');

function fixture(t) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gloria-test-'));
	t.after(() => {
		assert.equal(path.dirname(directory), os.tmpdir());
		fs.rmSync(directory, { recursive: true, force: true });
	});
	const workbench = path.join(directory, 'out', 'vs', 'code', 'electron-sandbox', 'workbench');
	fs.mkdirSync(workbench, { recursive: true });
	fs.writeFileSync(path.join(workbench, 'workbench.html'), '<html><head></head><body></body>\n</html>');
	return resolveWorkbench(directory);
}

test('installation is idempotent and restore preserves unrelated workbench content', t => {
	const files = fixture(t);
	const original = fs.readFileSync(files.htmlFile, 'utf8');
	assert.equal(installWorkbench(files, path.join(__dirname, '..', 'src')), true);
	assert.equal(installWorkbench(files, path.join(__dirname, '..', 'src')), false);
	assert.equal((fs.readFileSync(files.htmlFile, 'utf8').match(/<!-- GLORIA -->/g) || []).length, 1);
	writeState(files, { enabled: true, brightness: 0.7 });
	writeState(files, { enabled: false });
	assert.deepEqual(JSON.parse(fs.readFileSync(files.stateFile)), { enabled: false });
	restoreWorkbench(files);
	assert.equal(fs.readFileSync(files.htmlFile, 'utf8'), original);
	assert.equal(fs.existsSync(files.scriptFile), false);
	assert.equal(fs.existsSync(files.stateFile), false);
	restoreWorkbench(files);
	assert.equal(fs.readFileSync(files.htmlFile, 'utf8'), original);
});

test('closing one window does not disable styling in another running window', t => {
	const files = fixture(t);
	const otherWindow = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore', windowsHide: true });
	t.after(() => otherWindow.kill());
	claimState(files, { brightness: 0.45 });
	claimState(files, { brightness: 0.45 }, otherWindow.pid);
	releaseState(files);
	assert.equal(JSON.parse(fs.readFileSync(files.stateFile)).enabled, true);
	releaseState(files, otherWindow.pid);
	assert.equal(JSON.parse(fs.readFileSync(files.stateFile)).enabled, false);
});

async function renderer(t) {
	const files = fixture(t);
	installWorkbench(files, path.join(__dirname, '..', 'src'));
	const dom = new JSDOM('<html><head><style class="vscode-tokens-styles">.mtk1 { color: #fdfdfd; }.mtk2{color:#fefefe}.mtk3{color:#ff0000}.mtk4{color:#40ff00}</style></head><body><div class="monaco-workbench vs-dark nihil-gloria-theme-themes-gloria-color-theme-json"></div></body></html>', {
		url: 'https://gloria.local/workbench.html', runScripts: 'outside-only'
	});
	const { window } = dom;
	t.after(() => window.close());
	let state = { enabled: true, brightness: 0.45, disableGlow: false, whiteGlowRadius: 25 };
	let missing = false;
	let poll;
	const frames = new Map();
	let identifier = 0;
	window.requestAnimationFrame = callback => { frames.set(++identifier, callback); return identifier; };
	window.cancelAnimationFrame = id => frames.delete(id);
	window.setInterval = callback => { poll = callback; return 1; };
	window.clearInterval = () => { poll = undefined; };
	Object.defineProperty(window.document, 'hidden', { value: false });
	window.fetch = async url => {
		assert.equal(new URL(url).origin, 'https://gloria.local');
		return { ok: !missing, json: async () => state };
	};
	const script = window.document.createElement('script');
	script.src = 'https://gloria.local/gloria-neondreams.js';
	Object.defineProperty(window.document, 'currentScript', { value: script });
	window.eval(fs.readFileSync(files.scriptFile, 'utf8'));
	async function flush() {
		for (let count = 0; count < 8; count++) {
			await Promise.resolve();
			const pending = Array.from(frames.values());
			frames.clear();
			pending.forEach(callback => callback());
		}
		assert.equal(frames.size, 0, 'renderer must settle without a mutation loop');
	}
	await flush();
	return {
		window, flush,
		style: () => window.document.getElementById('gloria-theme-styles'),
		async update(update) { state = { ...state, ...update }; await poll(); await flush(); },
		async removeState() { missing = true; await poll(); await flush(); }
	};
}

test('renderer removes Gloria styles on theme exit and rebuilds from current tokens on return', async t => {
	const r = await renderer(t);
	assert.match(r.style().textContent, /\.mtk1\{text-shadow:/);
	assert.doesNotMatch(r.style().textContent, /\.mtk[1-4]\{color:/);
	assert.doesNotMatch(r.style().textContent, /\.mtk2\{text-shadow:/);
	const workbench = r.window.document.querySelector('.monaco-workbench');
	workbench.className = 'monaco-workbench vs-dark another-theme-json';
	await r.flush();
	assert.equal(r.style(), null);
	r.window.document.querySelector('.vscode-tokens-styles').textContent = '.mtk99{color:#ff0000}';
	workbench.className = 'monaco-workbench vs-dark nihil-gloria-theme-themes-gloria-color-theme-json';
	await r.flush();
	assert.match(r.style().textContent, /\.mtk99\{text-shadow:/);
	assert.doesNotMatch(r.style().textContent, /\.mtk1\{text-shadow:/);
});

test('renderer updates brightness, disableGlow and white radius without a reload', async t => {
	const r = await renderer(t);
	assert.ok(r.style().textContent.includes(glowShadow('fdfdfd', { brightness: 0.45 })));
	await r.update({ brightness: 0.8, whiteGlowRadius: 12 });
	assert.ok(r.style().textContent.includes(glowShadow('fdfdfd', { brightness: 0.8, whiteGlowRadius: 12 })));
	await r.update({ disableGlow: true });
	assert.doesNotMatch(r.style().textContent, /text-shadow:/);
	assert.match(r.style().textContent, /background-color: #000c18/);
	await r.update({ disableGlow: false, brightness: 0 });
	assert.doesNotMatch(r.style().textContent, /text-shadow:/);
	await r.update({ brightness: 0.45 });
	assert.match(r.style().textContent, /text-shadow:/);
	await r.removeState();
	assert.equal(r.style(), null);
});

test('deactivation state clears styles; unloading disconnects the renderer', async t => {
	const r = await renderer(t);
	await r.update({ enabled: false });
	assert.equal(r.style(), null);
	await r.update({ enabled: true });
	assert.ok(r.style());
	r.window.dispatchEvent(new r.window.Event('beforeunload'));
	assert.equal(r.style(), null);
	r.window.document.querySelector('.vscode-tokens-styles').textContent = '.mtk9{color:#ff0000}';
	await r.flush();
	assert.equal(r.style(), null);
});
