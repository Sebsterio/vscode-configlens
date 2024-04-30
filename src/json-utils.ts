type Property = {
	key: string;
	keyOffset: number;
};

const removeComments = (jsonc: string) =>
	jsonc.replace(/"([^"\\]|\\.)*"|\/\/.*|\/\*[\s\S]*?\*\//g, (match: string) => {
		return match.startsWith('"') ? match : '';
	});

const removeTrailingCommas = (jsonc: string) => jsonc.replace(/,(?=\s*[\]}])/g, '');

export function getRootProperties(jsonc: string) {
	const json = removeTrailingCommas(removeComments(jsonc));
	const obj = JSON.parse(json);
	const rootKeys = Object.keys(obj);
	const properties: Property[] = [];
	let lastMatchIndex = 0;

	rootKeys.forEach((key) => {
		const keyOffset = jsonc.indexOf(key + '":', lastMatchIndex);
		lastMatchIndex = keyOffset;
		properties.push({ key, keyOffset });
	});

	return properties;
}
