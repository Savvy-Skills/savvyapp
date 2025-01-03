const includes = <T>(arr: readonly T[], x: T): boolean => arr.includes(x)

function hexToRgbA(hex: string): string {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(parseInt(c)>>16)&255, (parseInt(c)>>8)&255, parseInt(c)&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}

export {
	includes,
	hexToRgbA
}