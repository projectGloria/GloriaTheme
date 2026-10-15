const { parseHtmlElements } = require('./htmlGrandparents');

function findCssPunctuationRanges(text, baseOffset = 0) {
	const curly = [];
	const round = [];
	let quote;
	let inComment = false;
	for (let index = 0; index < text.length; index++) {
		const character = text[index];
		const nextCharacter = text[index + 1];
		if (inComment) {
			if (character === '*' && nextCharacter === '/') {
				inComment = false;
				index++;
			}
			continue;
		}
		if (quote) {
			if (character === '\\') index++;
			else if (character === quote) quote = undefined;
			continue;
		}
		if (character === '/' && nextCharacter === '*') {
			inComment = true;
			index++;
		} else if (character === '"' || character === "'") {
			quote = character;
		} else if (character === '\\') {
			index++;
		} else if (character === '{' || character === '}') {
			curly.push({ start: baseOffset + index, length: 1 });
		} else if (character === '(' || character === ')') {
			round.push({ start: baseOffset + index, length: 1 });
		}
	}
	return { curly, round };
}

function findEmbeddedCssPunctuationRanges(html, elements = parseHtmlElements(html)) {
	const curly = [];
	const round = [];
	for (const element of elements) {
		if (element.tagName !== 'style') continue;
		const punctuation = findCssPunctuationRanges(
			html.slice(element.contentStart, element.contentEnd), element.contentStart
		);
		for (const range of punctuation.curly) curly.push(range);
		for (const range of punctuation.round) round.push(range);
	}
	return { curly, round };
}

function findCssCurlyBraceRanges(text, baseOffset = 0) {
	return findCssPunctuationRanges(text, baseOffset).curly;
}

function findEmbeddedCssCurlyBraceRanges(html, elements) {
	return findEmbeddedCssPunctuationRanges(html, elements).curly;
}

module.exports = { findCssCurlyBraceRanges, findEmbeddedCssCurlyBraceRanges, findCssPunctuationRanges, findEmbeddedCssPunctuationRanges };
