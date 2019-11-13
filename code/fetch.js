import { readFileSync } from "fs";
import pluralize from "pluralize";
import n2w from "number-names";

const randomArrKey = items => items[Math.floor(Math.random() * items.length)];
const wordList = readFileSync(__dirname + "/../assets/words/nouns.txt", "utf-8")
	.split("\n")
	.filter(Boolean);

const buildUpFanta = $guys => {
	const number = n2w(Math.round(999 * Math.random()));
	const inverted = Math.random() > 0.5;
	let words = [];

	[...$guys.querySelectorAll("x-guys-number")].forEach($el => {
		$el.innerText = number;
	});
	$guys.querySelectorAll("x-guys-word").forEach($el => {
		const w = pluralize(randomArrKey(wordList));
		words.push(w);
		$el.innerText = w;
	});

	if (inverted) {
		document.body.dataset.inverted = "true";
	}

	return { number, words };
};

const go = () => {
	const $guys = document.querySelector("x-guys");
	const data = buildUpFanta($guys, data);

	console.log(JSON.stringify(data));
};
go();
