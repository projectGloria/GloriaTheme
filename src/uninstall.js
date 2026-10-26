// Runs from package.json "vscode:uninstall" once VS Code restarts after Gloria is removed.
// There is no vscode API here, so the app root is located from the Electron executable instead.
const fs = require('fs');
const path = require('path');
const { resolveWorkbench, restoreWorkbench } = require('./workbench');

function candidateAppRoots(execPath) {
	const directory = path.dirname(execPath);
	const roots = [
		path.join(directory, 'resources', 'app'), // Windows, Linux
		path.join(directory, '..', 'Resources', 'app') // macOS: Contents/MacOS/<exe>
	];
	// Newer Windows builds nest resources under a per-commit folder next to the executable.
	try {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			if (entry.isDirectory()) roots.push(path.join(directory, entry.name, 'resources', 'app'));
		}
	} catch { /* unreadable install directory: fall back to the fixed layouts */ }
	return roots;
}

function run(execPath = process.execPath) {
	let restored = 0;
	for (const root of candidateAppRoots(execPath)) {
		const files = resolveWorkbench(root);
		if (!files) continue;
		try {
			restoreWorkbench(files);
			restored++;
		} catch (error) {
			console.error(`Gloria: could not restore ${files.htmlFile}: ${error.message}`);
		}
	}
	return restored;
}

if (require.main === module) run();

module.exports = { candidateAppRoots, run };
