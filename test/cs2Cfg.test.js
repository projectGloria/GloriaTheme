const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const textmate = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');
const theme = require('../themes/gloria-color-theme.json');
const manifest = require('../package.json');

let registry;
let grammar;
test.before(async () => {
	const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
	await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
	registry = new textmate.Registry({
		onigLib: Promise.resolve({
			createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
			createOnigString: text => new oniguruma.OnigString(text)
		}),
		theme: { settings: [{ settings: { foreground: theme.colors['editor.foreground'] } }, ...theme.tokenColors] },
		loadGrammar: async scope => scope === 'source.cs2cfg'
			? textmate.parseRawGrammar(fs.readFileSync(path.join(__dirname, '../syntaxes/cs2-cfg.tmLanguage.json'), 'utf8'), 'cs2-cfg.json')
			: null
	});
	grammar = await registry.loadGrammar('source.cs2cfg');
});
test.after(() => registry?.dispose());

function tokenize(line, state = textmate.INITIAL) {
	const decoded = grammar.tokenizeLine(line, state);
	const encoded = grammar.tokenizeLine2(line, state);
	const colors = registry.getColorMap();
	return {
		state: decoded.ruleStack,
		tokens: decoded.tokens.map(token => {
			let metadata = 0;
			for (let index = 0; index < encoded.tokens.length; index += 2) {
				if (encoded.tokens[index] > token.startIndex) break;
				metadata = encoded.tokens[index + 1];
			}
			return { ...token, text: line.slice(token.startIndex, token.endIndex), color: colors[(metadata >>> 15) & 511], fontStyle: (metadata >>> 11) & 15 };
		})
	};
}

function expectToken(line, text, scope, color, occurrence = 0) {
	let offset = -1;
	for (let index = 0; index <= occurrence; index++) offset = line.indexOf(text, offset + 1);
	assert.ok(offset >= 0, `Missing sample text: ${text}`);
	const token = tokenize(line).tokens.find(token => token.startIndex <= offset && token.endIndex > offset);
	assert.ok(token.scopes.some(value => value.startsWith(scope)), `${text}: ${JSON.stringify(token)}`);
	assert.equal(token.color, color, text);
	return token;
}

test('CS2 config folders register the CS2 grammar without claiming every .cfg file', () => {
	const language = manifest.contributes.languages.find(language => language.id === 'cs2-cfg');
	assert.equal(language.extensions, undefined, 'a blanket .cfg claim hijacks setup.cfg and other INI configs');
	assert.ok(language.filenames.includes('autoexec.cfg'));
	const claimed = file => language.filenamePatterns.some(pattern => path.posix.matchesGlob(file, pattern));
	assert.ok(claimed('C:/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/practice.cfg'));
	assert.ok(claimed('C:/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/sub/nested.cfg'));
	assert.ok(claimed('C:/Steam/userdata/123/730/local/cfg/config.cfg'));
	assert.equal(claimed('/home/dev/project/setup.cfg'), false);
	const contribution = manifest.contributes.grammars.find(grammar => grammar.language === language.id);
	assert.equal(contribution.scopeName, 'source.cs2cfg');
	assert.ok(fs.existsSync(path.join(__dirname, '..', contribution.path)));
	const configuration = require('../language-configuration/cs2-cfg.json');
	assert.equal(configuration.comments.lineComment, '//');
});

test('commands and setting names follow Gloria function and property colors', () => {
	expectToken('unbindall // Clear binds', 'unbindall', 'support.function', '#FDFDFD');
	expectToken('sensitivity "1" // Mouse sensitivity', 'sensitivity', 'variable.other.property', '#FF0000');
	expectToken('  cl_crosshair_recoil false', 'cl_crosshair_recoil', 'variable.other.property', '#FF0000');
	expectToken('  +jump', '+jump', 'support.function', '#FDFDFD');
	expectToken('pracLocal // Call a custom alias', 'pracLocal', 'entity.name.function', '#FDFDFD');
});

test('bind keys stay green including number keys while quoted setting numbers are yellow', () => {
	const line = 'bind "1" "slot1" // Primary weapon';
	expectToken(line, 'bind', 'support.function', '#FDFDFD');
	expectToken(line, '1', 'string.quoted.key', '#40FF00');
	expectToken(line, 'slot1', 'string.quoted.double', '#40FF00');
	expectToken('bind MOUSE1 +attack', 'MOUSE1', 'string.unquoted.key', '#40FF00');
	expectToken('sensitivity "1"', '1', 'constant.numeric', '#FFFF00');
	expectToken('m_yaw "0.022"', '0.022', 'constant.numeric', '#FFFF00');
	expectToken('viewmodel_offset_z "-1"', '-1', 'constant.numeric', '#FFFF00');
});

test('unquoted numbers and boolean values retain their literal styling', () => {
	expectToken('cl_crosshair_gap -2.5', '-2.5', 'constant.numeric', '#FFFF00');
	expectToken('volume .5', '.5', 'constant.numeric', '#FFFF00');
	expectToken('some_value 1e-3', '1e-3', 'constant.numeric', '#FFFF00');
	expectToken('cl_crosshair_recoil false', 'false', 'constant.language.boolean', '#FFFF00');
	expectToken('cl_crosshair_recoil "true"', 'true', 'constant.language.boolean', '#FFFF00');
});

test('alias declarations support quoted and unquoted names and preserve command strings', () => {
	const line = 'alias "crosshair_primary" "cl_crosshair_thickness 1; alias crosshair_toggle secondary"';
	expectToken(line, 'alias', 'keyword.control', '#D580FF');
	expectToken(line, 'crosshair_primary', 'entity.name.function.alias', '#FDFDFD');
	expectToken(line, 'cl_crosshair_thickness', 'string.quoted.double', '#40FF00');
	expectToken(line, ';', 'string.quoted.double', '#40FF00');
	expectToken('alias pracLocal "sv_cheats 1; bot_kick"', 'pracLocal', 'entity.name.function.alias', '#FDFDFD');
});

test('semicolon-separated commands are distinct statements outside strings', () => {
	const line = 'sensitivity 1; bind w +forward; echo "ready; set" // Done';
	expectToken(line, 'sensitivity', 'variable.other.property', '#FF0000');
	expectToken(line, ';', 'punctuation.terminator.statement', '#FEFEFE');
	expectToken(line, 'bind', 'support.function', '#FDFDFD');
	expectToken(line, 'echo', 'support.function', '#FDFDFD');
	expectToken(line, 'ready; set', 'string.quoted.double', '#40FF00');
});

test('comments are italic gray, including comments immediately following values', () => {
	for (const line of ['// CORE MOVEMENT', 'volume 1// Volume', 'fps_max "100"// Limit']) {
		const token = expectToken(line, '//', 'comment', '#808080');
		assert.ok(token.fontStyle & 1);
	}
});

test('quoted comment markers, URLs and artwork remain strings', () => {
	expectToken('echo "https://example.test/path; // text" // Comment', 'https://', 'string.quoted.double', '#40FF00');
	expectToken('echo "// a literal string"', '//', 'string.quoted.double', '#40FF00');
	expectToken('echo "@@%%%%%##*+===-----:::::::++++++"', '@@%%%%%', 'string.quoted.double', '#40FF00');
});

test('escaped quotes stay inside strings and unfinished quotes recover on the next line', () => {
	const escaped = 'echo "A \\"quoted\\" value // still text" // Comment';
	expectToken(escaped, '\\"', 'constant.character.escape', '#D16969');
	expectToken(escaped, 'still text', 'string.quoted.double', '#40FF00');
	const broken = tokenize('alias "unfinished');
	const next = tokenize('volume 0.5 // Next command', broken.state);
	assert.equal(next.tokens.find(token => token.text === 'volume').color, '#FF0000');
	assert.ok(next.tokens.some(token => token.text === '0.5' && token.color === '#FFFF00'));
});
