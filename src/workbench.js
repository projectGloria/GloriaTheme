const fs = require('fs');
const path = require('path');

const SCRIPT = 'gloria-neondreams.js';
const STATE = 'gloria-state.json';
const MARKER = `<!-- GLORIA --><script src="${SCRIPT}"></script><!-- NEON DREAMS -->`;
const markerPattern = /[\t ]*<!-- GLORIA -->\s*<script\s+src=["']gloria-neondreams\.js["']><\/script>\s*<!-- NEON DREAMS -->\r?\n?/g;

function resolveWorkbench(appRoot) {
	const base = path.join(appRoot, 'out', 'vs', 'code');
	for (const directory of ['electron-sandbox', 'electron-browser']) {
		for (const name of ['workbench.esm.html', 'workbench.html']) {
			const htmlFile = path.join(base, directory, 'workbench', name);
			if (fs.existsSync(htmlFile)) return {
				htmlFile,
				scriptFile: path.join(path.dirname(htmlFile), SCRIPT),
				stateFile: path.join(path.dirname(htmlFile), STATE)
			};
		}
	}
	return null;
}

function writeState(files, state) {
	const temporary = `${files.stateFile}.${process.pid}.tmp`;
	try {
		fs.writeFileSync(temporary, JSON.stringify(state), 'utf8');
		fs.renameSync(temporary, files.stateFile);
	} finally {
		if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
	}
}

function ownerFile(files, pid) {
	return `${files.stateFile}.${pid}.owner`;
}

function liveOwners(files) {
	const directory = path.dirname(files.stateFile);
	const prefix = path.basename(files.stateFile) + '.';
	const owners = [];
	for (const name of fs.readdirSync(directory)) {
		if (!name.startsWith(prefix) || !name.endsWith('.owner')) continue;
		const pid = Number(name.slice(prefix.length, -6));
		if (!Number.isInteger(pid) || pid <= 0) continue;
		try {
			process.kill(pid, 0);
			owners.push(JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')));
		} catch (error) {
			if (error.code === 'ESRCH') fs.unlinkSync(path.join(directory, name));
		}
	}
	return owners;
}

function claimState(files, settings, pid = process.pid) {
	const state = { enabled: true, ...settings };
	fs.writeFileSync(ownerFile(files, pid), JSON.stringify(state), 'utf8');
	writeState(files, state);
}

function releaseState(files, pid = process.pid) {
	const owner = ownerFile(files, pid);
	if (fs.existsSync(owner)) fs.unlinkSync(owner);
	if (liveOwners(files).length) return;
	writeState(files, { enabled: false });
	// A second window can activate between the first check and the write.
	const owners = liveOwners(files);
	if (owners.length) writeState(files, owners[0]);
}

function installWorkbench(files, sourceDirectory) {
	const html = fs.readFileSync(files.htmlFile, 'utf8');
	const template = fs.readFileSync(path.join(sourceDirectory, 'js', 'theme_template.js'), 'utf8');
	const helpers = fs.readFileSync(path.join(sourceDirectory, 'glow.js'), 'utf8');
	const chrome = fs.readFileSync(path.join(sourceDirectory, 'css', 'editor_chrome.css'), 'utf8');
	const script = template.replace('[GLOW_SOURCE]', () => helpers)
		.replace('[CHROME_STYLES_JSON]', () => JSON.stringify(chrome));
	const clean = html.replace(markerPattern, '');
	if (!/<\/html\s*>/i.test(clean)) throw new Error('Workbench HTML has no closing html tag.');
	const changed = !fs.existsSync(files.scriptFile) || fs.readFileSync(files.scriptFile, 'utf8') !== script;
	fs.writeFileSync(files.scriptFile, script, 'utf8');
	const output = clean.replace(/<\/html\s*>/i, `${MARKER}\n</html>`);
	if (output !== html) fs.writeFileSync(files.htmlFile, output, 'utf8');
	return changed || !html.includes(MARKER);
}

function restoreWorkbench(files) {
	writeState(files, { enabled: false });
	const html = fs.readFileSync(files.htmlFile, 'utf8');
	const clean = html.replace(markerPattern, '');
	if (clean !== html) fs.writeFileSync(files.htmlFile, clean, 'utf8');
	for (const file of [files.scriptFile, files.stateFile]) {
		if (fs.existsSync(file)) fs.unlinkSync(file);
	}
	const prefix = path.basename(files.stateFile) + '.';
	for (const name of fs.readdirSync(path.dirname(files.stateFile))) {
		if (name.startsWith(prefix) && /^\d+\.owner$/.test(name.slice(prefix.length))) {
			fs.unlinkSync(path.join(path.dirname(files.stateFile), name));
		}
	}
}

module.exports = { resolveWorkbench, installWorkbench, writeState, claimState, releaseState, restoreWorkbench };
