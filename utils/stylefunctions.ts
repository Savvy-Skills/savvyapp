function hexToRgbA(hex: string): string {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return 'rgba(' + [(parseInt(c) >> 16) & 255, (parseInt(c) >> 8) & 255, parseInt(c) & 255].join(',') + ',1)';
	}
	throw new Error('Bad Hex');
}

export const generateColors = (color: string, opacity: number) => {
	let rgba = color.startsWith("#") ? hexToRgbA(color) : color;
	const color1 = rgba.replace(/[^,]+(?=\))/, "1");
	const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());
	return { normal: color1, muted: color2 };
}
