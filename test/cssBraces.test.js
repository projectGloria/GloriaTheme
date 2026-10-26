const assert = require('assert');
const test = require('node:test');
const { findCssCurlyBraceRanges, findEmbeddedCssCurlyBraceRanges, findCssPunctuationRanges } = require('../src/cssBraces');

function highlightedCharacters(source) {
	return findCssCurlyBraceRanges(source).map(range => source.slice(range.start, range.start + range.length));
}

assert.deepStrictEqual(
	highlightedCharacters('.atmosphere::before { content: ""; }'),
	['{', '}']
);

assert.deepStrictEqual(
	highlightedCharacters('@media (width > 40rem) { .card { display: block; } }'),
	['{', '{', '}', '}']
);

assert.deepStrictEqual(
	highlightedCharacters('.card { content: "{not-a-block}"; /* } neither is this { */ }'),
	['{', '}']
);

assert.deepStrictEqual(
	highlightedCharacters('.card { content: \'escaped \\\' } text\'; }'),
	['{', '}']
);

const embeddedSource = [
	'<!-- <style>.ignored { color: red; }</style> -->',
	'<style media="screen and (min-width: 1px)">',
	'	.card { color: green; }',
	'</style>',
	'<script>const ignored = { value: true };</script>'
].join('\n');

assert.deepStrictEqual(
	findEmbeddedCssCurlyBraceRanges(embeddedSource).map(
		range => embeddedSource.slice(range.start, range.start + range.length)
	),
	['{', '}']
);

console.log('CSS curly-brace scanner tests passed.');

test('embedded CSS ignores markup-looking text in raw text elements', () => {
	for (const tag of ['textarea', 'title', 'script', 'iframe', 'xmp', 'noembed', 'noframes']) {
		assert.deepStrictEqual(findEmbeddedCssCurlyBraceRanges(`<${tag}><style>.ignored { text }</style></${tag}>`), []);
	}
});

test('raw closing tags require an exact tag name boundary', () => {
	const source = '<textarea></textarea-extra><style>.ignored { text }</style></textarea><style>.real { color: red }</style>';
	const ranges = findEmbeddedCssCurlyBraceRanges(source);
	assert.deepStrictEqual(ranges.map(range => source.slice(range.start, range.start + 1)), ['{', '}']);
	assert.ok(ranges[0].start > source.indexOf('.real'));
});

test('incomplete style blocks still decorate actual braces while typing', () => {
	assert.deepStrictEqual(findEmbeddedCssCurlyBraceRanges('<style>.card {'), [{ start: 13, length: 1 }]);
});

test('escaped CSS braces outside strings are not block delimiters', () => {
	assert.deepStrictEqual(highlightedCharacters('.escaped\\{name { color: red }'), ['{', '}']);
});

test('unquoted URL contents are not structural punctuation', () => {
	for (const url of [
		'url(https://example.test/{icon}.svg)',
		'URL( data:image/svg+xml,{icon})',
		'url(https://example.test/escaped\\)\\({icon}.svg)',
		'url("https://example.test/{icon}.svg")'
	]) {
		const source = `.icon { background-image: ${url}; width: calc(1px + 2px); }`;
		assert.deepStrictEqual(highlightedCharacters(source), ['{', '}'], url);
		const punctuation = findCssPunctuationRanges(source);
		assert.equal(punctuation.round.length, 4, 'URL and calc delimiters remain decorated');
		const html = `<style>${source}</style>`;
		assert.deepStrictEqual(findEmbeddedCssCurlyBraceRanges(html).map(range => range.start),
			punctuation.curly.map(range => range.start + '<style>'.length));
	}
});

test('an unfinished unquoted URL does not expose its contents as braces', () => {
	assert.deepStrictEqual(highlightedCharacters('.icon { background: url(https://example.test/{icon}'), ['{']);
});

test('functions whose names end in url still expose nested punctuation', () => {
	const source = '.icon { value: custom-url({value}); }';
	assert.deepStrictEqual(highlightedCharacters(source), ['{', '{', '}', '}']);
});
