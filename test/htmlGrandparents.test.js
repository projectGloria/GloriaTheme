const assert = require('assert');
const test = require('node:test');
const { findGrandparentTagRanges, parseHtmlElements } = require('../src/htmlGrandparents');

function highlightedTags(source) {
	return findGrandparentTagRanges(source).map(range => source.slice(range.start, range.start + range.length));
}

assert.deepStrictEqual(
	highlightedTags('<html><body><main><p>Text</p></main></body></html>'),
	['html', 'body', 'body', 'html']
);

assert.deepStrictEqual(
	highlightedTags('<div><span>One</span><span>Two</span></div>'),
	[]
);

assert.deepStrictEqual(
	highlightedTags('<div><section><span>Text</span></section></div>'),
	['div', 'div']
);

assert.deepStrictEqual(
	highlightedTags('<div><img src="x"><span>Text</span></div>'),
	[]
);

assert.deepStrictEqual(
	highlightedTags('<div><!-- <fake><child></child></fake> --><span>Text</span></div>'),
	[]
);

assert.deepStrictEqual(
	highlightedTags('<div><script>const value = "<fake><child></child></fake>";</script><span>Text</span></div>'),
	[]
);

assert.deepStrictEqual(
	highlightedTags('<ul><li><span>One</span><li><span>Two</span></ul>'),
	['ul', 'ul']
);

assert.deepStrictEqual(
	highlightedTags([
		'<div class="sidebar-footer">',
		'	<div class="user-card">',
		'		<div class="avatar">U</div>',
		'		<div class="user-info">',
		'			<strong>User</strong>',
		'			<span>Local session</span>',
		'		</div>',
		'</div>',
		'</div>'
	].join('\n')),
	['div', 'div']
);

assert.deepStrictEqual(
	highlightedTags('<div><section><span></span></section></div><main><article><p></p></article></main>'),
	['div', 'div', 'main', 'main']
);

assert.deepStrictEqual(
	highlightedTags([
		'<html><body><aside>',
		'<div class="sidebar-footer">',
		'	<div class="user-card">',
		'		<div class="avatar">U</div>',
		'		<div class="user-info"><strong>User</strong><span>Local</span></div>',
		'	</div>',
		'</div>',
		'</aside></body></html>'
	].join('\n')),
	['html', 'body', 'aside', 'div', 'div', 'aside', 'body', 'html']
);

console.log('HTML grandparent parser tests passed.');

test('optional list end tags close through paragraph descendants', () => {
	assert.deepStrictEqual(highlightedTags('<ul><li><p>One<li><p>Two</ul>'), ['ul', 'ul']);
	assert.deepStrictEqual(highlightedTags('<dl><dt><span>One<dd><span>Two</dl>'), ['dl', 'dl']);
});

test('nested lists retain their own implicit-closing scope', () => {
	const implicit = '<ul><li><div><ul><li><span>A<li><span>B</ul></div><li><span>C</ul>';
	const explicit = '<ul><li><div><ul><li><span>A</span></li><li><span>B</span></li></ul></div></li><li><span>C</span></li></ul>';
	const openings = source => findGrandparentTagRanges(source)
		.filter(range => source[range.start - 1] !== '/')
		.map(range => source.slice(range.start, range.start + range.length));
	assert.deepStrictEqual(openings(implicit), openings(explicit));
});

test('optional table end tags close open cells and rows', () => {
	const implicit = '<table><tbody><tr><td><span>A<td><span>B<tr><td><span>C</table>';
	const explicit = '<table><tbody><tr><td><span>A</span></td><td><span>B</span></td></tr><tr><td><span>C</span></td></tr></tbody></table>';
	// Omitted closing tag names cannot be decorated, but opening hierarchy must agree.
	const openingNames = source => findGrandparentTagRanges(source)
		.filter(range => source[range.start - 1] !== '/')
		.map(range => source.slice(range.start, range.start + range.length));
	assert.deepStrictEqual(openingNames(implicit), openingNames(explicit));
});

test('deeply nested documents do not require recursive tree traversal', () => {
	const source = '<div>'.repeat(15000) + '<span>text</span>' + '</div>'.repeat(15000);
	assert.deepStrictEqual(highlightedTags(source), ['div', 'div']);
});

test('raw HTML containers do not create ancestors from their text contents', () => {
	for (const tag of ['iframe', 'xmp', 'noembed', 'noframes']) {
		const source = `<div><${tag}><section><span>x</span></section></${tag}></div>`;
		assert.deepStrictEqual(highlightedTags(source), [], tag);
		assert.deepStrictEqual(parseHtmlElements(source).map(element => element.tagName), ['div', tag]);
	}
});

test('self-closing slashes do not close ordinary HTML elements', () => {
	assert.deepStrictEqual(highlightedTags('<div/><section><span>x</span></section>'), ['div']);
	assert.deepStrictEqual(highlightedTags('<div/><section><span>x</span></section></div>'), ['div', 'div']);
	assert.deepStrictEqual(highlightedTags('<div><img/><span>x</span></div>'), []);
});

test('foreign elements retain self-closing behavior and HTML integration points', () => {
	for (const source of [
		'<svg><path/><g><circle/></g></svg>',
		'<math><mspace/><mrow><mi>x</mi></mrow></math>'
	]) {
		const elements = parseHtmlElements(source);
		assert.strictEqual(elements[2].parent, elements[0]);
		assert.strictEqual(elements[3].parent, elements[2]);
	}
	const elements = parseHtmlElements('<svg><foreignObject><div/><section><span>x</span></section></div></foreignObject></svg>');
	assert.strictEqual(elements.find(element => element.tagName === 'section').parent.tagName, 'div');
});
