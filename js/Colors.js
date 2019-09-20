module.exports = class Colors {

    constructor() {

        const colors = generateColors();

        this.light = colors.light;
        this.mid = colors.mid;
        this.dark = colors.dark;
    }

    lerp(a, b, ratio) {

        return {
            r: Math.round((b.r - a.r) * ratio + a.r),
            g: Math.round((b.g - a.g) * ratio + a.g),
            b: Math.round((b.b - a.b) * ratio + a.b)
        };
    }

    str(color) {

        return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
    }
}

function generateColors() {

    const lightHue = Math.floor(Math.random() * 360);
    const darkHue = Math.floor(Math.random() * 360);

    const distance = lightHue - darkHue;
    let midHue = lightHue + darkHue;

    if (distance < -180 || distance > 180) {
        midHue += 360;
    }
    midHue = (midHue / 2) % 360;

    return {
        'light': hslToRgb(lightHue, 95, 88),
        'mid': hslToRgb(midHue, 30, 60),
        'dark': hslToRgb(darkHue, 80, 25)
    }
}

function hslToRgb(h, s, l) {

    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}