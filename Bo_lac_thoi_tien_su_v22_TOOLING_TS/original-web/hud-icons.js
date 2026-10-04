// Crisp functional HUD symbols drawn at the destination resolution.
// Keys refer to exact source rectangles in the original 128 × 136 UI atlas.
export const HUD_ICON_RECTS = {
    '114,93,14,9': 'bell', '0,17,11,5': 'work',
    '10,0,13,7': 'food', '24,14,12,6': 'wood', '10,7,12,7': 'stone',
    '22,6,13,7': 'berries', '12,14,12,7': 'fish', '47,82,14,10': 'eyes',
    '26,90,11,11': 'sleep', '26,80,9,10': 'cup', '26,85,9,5': 'cup',
    '29,111,10,10': 'food', '10,112,12,9': 'wood', '35,81,12,10': 'stone',
    '0,112,10,9': 'bone', '61,104,9,9': 'cancel', '114,10,14,14': 'woodclub',
    '114,76,7,6': 'wood', '114,19,6,5': 'wood', '113,0,14,10': 'stone',
    '114,24,13,13': 'spear', '114,37,14,14': 'axe', '114,51,13,13': 'club',
    '114,64,14,12': 'boneclub',
    '9,35,9,4': 'rail', '13,35,5,4': 'rail', '48,42,2,10': 'post',
    '19,35,11,4': 'rail', '45,65,11,2': 'rail',
    '39,113,9,8': 'heart', '61,25,8,8': 'food',
    '79,113,7,7': 'sleep', '10,61,7,10': 'sleep',
    '19,21,14,14': 'male', '59,11,10,14': 'female',
    '0,121,15,15': 'mood4', '14,121,15,15': 'mood3',
    '28,121,15,15': 'mood2', '42,121,15,15': 'mood1', '56,121,15,15': 'mood0',
    '71,121,16,15': 'sack', '88,0,18,13': 'fist',
    '102,124,12,12': 'work', '101,98,13,13': 'hammer',
    '31,42,17,11': 'speed', '47,68,14,14': 'scout',
    '86,111,17,9': 'spear', '69,11,15,16': 'builder',
    '99,57,15,12': 'music', '85,13,16,14': 'club',
    '23,0,14,6': 'bone', '101,84,13,14': 'cook',
    '88,95,12,15': 'shield', '99,43,14,14': 'axe',
    '114,102,7,5': 'up', '81,65,7,5': 'down'
};
export function drawHudIcon(c, kind, x, y, w, h) {
    c.save();
    c.translate(x, y);
    c.scale(w / 24, h / 24);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    const ink = '#102b27', gold = '#f9d374', bone = '#fff0cd', stone = '#bed6dd';
    const gradient = (a, b) => { const g = c.createLinearGradient(3, 1, 20, 24); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
    const shape = (points, fill, stroke = ink, width = 1.6) => { c.beginPath(); for (const [i, p] of points.entries())
        i ? c.lineTo(...p) : c.moveTo(...p); c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = width;
        c.stroke();
    } };
    const line = (points, color = bone, width = 2) => { c.beginPath(); for (const [i, p] of points.entries())
        i ? c.lineTo(...p) : c.moveTo(...p); c.strokeStyle = color; c.lineWidth = width; c.stroke(); };
    const ellipse = (x, y, rx, ry, fill, stroke = ink, width = 1.5) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = width;
        c.stroke();
    } };
    const rounded = (x, y, w, h, r, fill, stroke = ink) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 1.4;
        c.stroke();
    } };
    const handle = () => line([[5, 21], [18, 5]], '#845330', 4);
    if (kind === 'rail') {
        rounded(1, 5, 22, 14, 3, gradient('#e1c189', '#957245'), null);
    }
    else if (kind === 'post') {
        rounded(5, 1, 14, 22, 3, '#c8e8df', null);
    }
    else if (kind === 'heart') {
        c.beginPath();
        c.moveTo(12, 22);
        c.bezierCurveTo(8, 18, 1, 13, 1, 7);
        c.bezierCurveTo(1, -1, 10, -1, 12, 5);
        c.bezierCurveTo(16, -1, 23, 0, 23, 7);
        c.bezierCurveTo(23, 13, 16, 19, 12, 22);
        c.fillStyle = gradient('#ff7d83', '#d71944');
        c.fill();
        c.strokeStyle = ink;
        c.lineWidth = 1.5;
        c.stroke();
        line([[5, 7], [7, 4], [9, 5]], '#ffd4d4', 1.7);
    }
    else if (kind === 'male' || kind === 'female') {
        const male = kind === 'male', col = male ? '#64c8ff' : '#ff91c5';
        ellipse(male ? 9 : 12, male ? 15 : 8, 6, 6, '#19382e', col, 2.8);
        if (male) {
            line([[13, 11], [22, 2]], col, 2.8);
            line([[15, 2], [22, 2], [22, 9]], col, 2.8);
        }
        else {
            line([[12, 14], [12, 23]], col, 2.8);
            line([[7, 19], [17, 19]], col, 2.8);
        }
    }
    else if (kind.startsWith('mood')) {
        const mood = Number(kind.at(-1));
        ellipse(12, 12, 10.5, 10.5, gradient(mood > 1 ? '#fff4a1' : '#ffd298', mood > 1 ? '#edbd3b' : '#e36b43'));
        ellipse(8, 9, 1.1, 1.7, ink, null);
        ellipse(16, 9, 1.1, 1.7, ink, null);
        c.beginPath();
        c.moveTo(6.5, mood > 2 ? 14 : 17);
        c.quadraticCurveTo(12, mood > 2 ? 21 : mood === 2 ? 16 : 10, 17.5, mood > 2 ? 14 : 17);
        c.strokeStyle = ink;
        c.lineWidth = 1.7;
        c.stroke();
        if (mood === 4) {
            line([[8, 16], [16, 16]], '#fffbe5', 1.6);
        }
    }
    else if (kind === 'sleep') {
        line([[4, 4], [20, 4], [4, 21], [20, 21]], '#a5f7ed', 3.7);
        line([[5, 3], [19, 3]], '#effffc', .8);
    }
    else if (kind === 'food') {
        line([[14, 12], [21, 4]], ink, 5);
        line([[14, 12], [21, 4]], bone, 3);
        ellipse(21, 3, 2, 2, bone);
        ellipse(22, 6, 1.5, 1.5, bone);
        ellipse(9, 15, 7, 8, gradient('#ffb25d', '#b74a2c'));
        line([[5, 12], [7, 9], [10, 8]], '#ffd799', 1.5);
    }
    else if (kind === 'rest') {
        rounded(1, 14, 21, 7, 2, '#c4945b');
        rounded(3, 11, 6, 4, 1, bone);
        line([[2, 12], [2, 23]], gold, 2);
        line([[21, 17], [21, 23]], gold, 2);
        line([[12, 2], [20, 2], [12, 10], [20, 10]], '#a5f7ed', 2.2);
    }
    else if (kind === 'work') {
        shape([[1, 21], [5, 14], [8, 14], [10, 8], [14, 8], [16, 14], [19, 14], [23, 21]], gradient('#f8db87', '#b28a42'));
        line([[5, 20], [19, 20]], bone, 1.2);
    }
    else if (kind === 'wood' || kind === 'woodclub') {
        shape([[2, 21], [5, 22], [21, 6], [22, 2], [17, 2], [12, 7]], gradient('#d8a366', '#85532b'));
        line([[6, 18], [17, 6]], '#efca8a', 1.2);
    }
    else if (kind === 'boneclub') {
        handle();
        shape([[8, 5], [13, 2], [22, 4], [23, 10], [19, 14], [12, 12]], gradient('#fff8dc', '#c7bc8f'));
    }
    else if (kind === 'stone') {
        shape([[1, 18], [5, 9], [12, 3], [19, 6], [23, 17], [18, 22], [6, 22]], gradient('#e4eaec', '#91a6ad'));
        line([[5, 12], [12, 6], [18, 8]], '#faffef', 1.5);
    }
    else if (kind === 'berries') {
        for (const p of [[7, 15], [16, 16], [12, 7]])
            ellipse(p[0], p[1], 6, 6, gradient('#ff9d82', '#d34343'));
        line([[12, 3], [16, 1]], '#98ce68', 2);
    }
    else if (kind === 'fish') {
        shape([[1, 4], [8, 10], [1, 20]], '#72cde0');
        ellipse(14, 12, 9, 8, gradient('#beeff0', '#4ba9ce'));
        ellipse(18, 10, 1.2, 1.2, ink, null);
        line([[11, 8], [9, 12], [11, 16]], '#2d809a', 1);
    }
    else if (kind === 'eyes') {
        ellipse(6, 12, 5, 8, '#f5f4db');
        ellipse(18, 12, 5, 8, '#f5f4db');
        ellipse(8, 12, 2, 3, '#61bbd7');
        ellipse(16, 12, 2, 3, '#61bbd7');
    }
    else if (kind === 'cup') {
        rounded(4, 5, 13, 17, 2, gradient('#edc56d', '#b17b2d'));
        c.beginPath();
        c.arc(17, 12, 5, -Math.PI / 2, Math.PI / 2);
        c.strokeStyle = gold;
        c.lineWidth = 2.5;
        c.stroke();
        ellipse(10, 5, 6, 2, '#ffecb3');
    }
    else if (kind === 'bell') {
        shape([[2, 19], [5, 14], [6, 6], [12, 2], [18, 6], [19, 14], [22, 19]], gradient('#fff0a3', '#c09038'));
        ellipse(12, 21, 3, 2, gold);
    }
    else if (kind === 'cancel') {
        line([[4, 4], [20, 20]], '#ff7e70', 4);
        line([[20, 4], [4, 20]], '#ff7e70', 4);
    }
    else if (kind === 'sack') {
        shape([[8, 2], [16, 2], [14, 7], [20, 16], [20, 20], [16, 23], [6, 23], [3, 19], [5, 12], [10, 7]], gradient('#e1c189', '#a47a3a'));
        line([[8, 8], [15, 8]], bone, 1.5);
        line([[8, 12], [6, 18]], '#f8dfa6', 1.3);
    }
    else if (kind === 'fist') {
        rounded(3, 9, 18, 11, 3, gradient('#f9d374', '#ba8840'));
        for (let i = 0; i < 4; i++)
            rounded(4 + i * 4, 3 + i % 2, 4, 12, 2, gold);
        rounded(2, 12, 8, 6, 2, '#e7b65b');
        line([[8, 20], [18, 20]], '#ffe3a0', 1);
    }
    else if (kind === 'hammer' || kind === 'axe') {
        handle();
        shape(kind === 'axe' ? [[8, 3], [14, 1], [22, 5], [22, 13], [17, 16], [10, 10]] : [[5, 4], [13, 1], [22, 7], [18, 15], [11, 12], [7, 15], [3, 11]], gradient('#ecf6ed', '#88a5aa'));
        line([[10, 6], [18, 9]], '#fff6d8', 1.3);
        line([[9, 14], [12, 16]], gold, 1.2);
    }
    else if (kind === 'club') {
        handle();
        shape([[10, 12], [8, 7], [12, 4], [13, 1], [17, 4], [22, 4], [20, 9], [21, 13], [16, 13], [13, 16]], gradient('#dec2e7', '#9175a4'));
        ellipse(15, 8, 4, 4, '#a17a45');
        line([[11, 6], [17, 10]], gold, 1.5);
    }
    else if (kind === 'spear') {
        line([[2, 20], [18, 5]], ink, 4);
        line([[2, 20], [18, 5]], '#d5a05d', 2.5);
        shape([[14, 5], [23, 1], [20, 11]], gradient('#effaf7', '#8db8c1'));
        line([[17, 6], [21, 3]], bone, 1);
    }
    else if (kind === 'speed') {
        line([[1, 7], [8, 7]], '#fce2a2', 1.5);
        line([[0, 12], [5, 12]], '#fce2a2', 1.5);
        shape([[8, 3], [16, 3], [15, 12], [22, 17], [23, 21], [8, 21], [5, 17]], gradient('#e4b878', '#a46b35'));
        line([[7, 21], [23, 21]], bone, 2);
        line([[11, 5], [14, 5]], bone, 1.5);
    }
    else if (kind === 'scout') {
        shape([[2, 20], [3, 11], [7, 3], [12, 1], [18, 4], [22, 12], [22, 21]], gradient('#69b85c', '#276c42'));
        ellipse(12, 16, 8, 5, ink);
        ellipse(8, 15, 3, 3, '#fff7db');
        ellipse(16, 15, 3, 3, '#fff7db');
        ellipse(9, 16, 1.2, 1.6, ink, null);
        ellipse(15, 16, 1.2, 1.6, ink, null);
    }
    else if (kind === 'builder') {
        shape([[5, 12], [20, 12], [18, 22], [11, 24], [6, 19]], gradient('#e6eef0', '#8babad'));
        c.beginPath();
        c.arc(12, 12, 9, Math.PI, 0);
        c.fillStyle = gradient('#fff0a0', '#e4ae27');
        c.fill();
        c.strokeStyle = ink;
        c.lineWidth = 1.4;
        c.stroke();
        rounded(1, 11, 22, 4, 1.5, gold);
        line([[12, 3], [12, 10]], '#fff6c0', 2);
    }
    else if (kind === 'music') {
        c.beginPath();
        c.arc(12, 12, 9, Math.PI, 0);
        c.strokeStyle = ink;
        c.lineWidth = 5;
        c.stroke();
        c.strokeStyle = gold;
        c.lineWidth = 2.8;
        c.stroke();
        rounded(1, 11, 5, 11, 2, '#d3a75b');
        rounded(18, 11, 5, 11, 2, '#d3a75b');
    }
    else if (kind === 'bone') {
        line([[5, 17], [19, 7]], ink, 7);
        line([[5, 17], [19, 7]], bone, 4);
        for (const p of [[3, 16], [6, 20], [18, 4], [21, 8]])
            ellipse(p[0], p[1], 2.7, 2.7, bone);
    }
    else if (kind === 'cook') {
        rounded(6, 10, 13, 12, 2, '#ecf1de');
        ellipse(6, 8, 5, 5, '#fffbea');
        ellipse(18, 8, 5, 5, '#fffbea');
        ellipse(12, 5, 6, 5, '#fffbea');
        rounded(5, 16, 15, 5, 1, '#dce7d1');
        line([[9, 11], [9, 14]], '#bccdc1', 1);
        line([[15, 11], [15, 14]], '#bccdc1', 1);
    }
    else if (kind === 'shield') {
        shape([[3, 2], [21, 2], [20, 15], [12, 23], [4, 15]], gradient('#e1c28b', '#946c36'));
        shape([[7, 6], [17, 6], [16, 14], [12, 18], [8, 14]], '#d9e0b9');
        line([[12, 5], [12, 18]], '#79552e', 1.6);
        line([[7, 10], [17, 10]], '#79552e', 1.6);
    }
    else if (kind === 'up' || kind === 'down') {
        shape(kind === 'up' ? [[2, 21], [12, 3], [22, 21]] : [[2, 3], [12, 21], [22, 3]], gold);
    }
    c.restore();
}
export function renderHudIcon(native, g, img, sx, sy, w, h, dx, dy, t) {
    if (img.width !== 128 || img.height !== 136 || !t?.frames?.some((f) => f.owner === 'f' && f.method.name === 'a' && f.method.desc === '(BII)V' && [4, 12].includes(f.locals[1])))
        return false;
    // Original composite 560 is the resting task: replace all four pixel pieces once.
    if (t.frames.some((f) => f.owner === 'f' && f.method.name === 'a' && f.method.desc === '(III)V' && f.locals[1] === 560)) {
        if (sx === 9 && sy === 35 && w === 9 && h === 4)
            native.draw(g, (c) => drawHudIcon(c, 'rest', dx - 1, dy - 12, 15, 16));
        return true;
    }
    // The Java renderer crops this source strip to represent each live stat value.
    if (sx >= 31 && sx + w <= 52 && sy === 35 && h === 6) {
        native.draw(g, (c) => { const fill = c.createLinearGradient(dx - (sx - 31), dy, dx - (sx - 31) + 21, dy); fill.addColorStop(0, '#da4548'); fill.addColorStop(.28, '#e2b956'); fill.addColorStop(.6, '#81d856'); fill.addColorStop(1, '#37b65c'); c.fillStyle = '#0b211e'; c.fillRect(dx, dy, w, h); c.fillStyle = fill; c.fillRect(dx, dy + .8, w, h - 1.6); c.fillStyle = '#ffffff44'; c.fillRect(dx, dy + .8, w, .65); });
        return true;
    }
    const kind = HUD_ICON_RECTS[[sx, sy, w, h].join(',')];
    if (!kind)
        return false;
    native.draw(g, (c) => drawHudIcon(c, kind, dx, dy, w, h));
    (native.art.hudIconKinds ??= new Set()).add(kind);
    native.art.hudIconDraws = (native.art.hudIconDraws || 0) + 1;
    return true;
}
//# sourceMappingURL=hud-icons.js.map