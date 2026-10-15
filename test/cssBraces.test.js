const assert = require('assert');
const test = require('node:test');
const { findCssCurlyBraceRanges, findEmbeddedCssCurlyBraceRanges } = require('../src/cssBraces');

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
	for (const tag of ['textarea', 'title', 'script']) {
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
