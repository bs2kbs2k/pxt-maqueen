/**
* Well known colors for a NeoPixel strip
*/
enum MaqueenColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

namespace maqueen {
    let brightness: number = 128;

    //% weight=2 blockGap=8
    //% blockId="maqueen_colors" block="%color"
    //% blockHidden=true
    export function colors(color: MaqueenColors): number {
        return color;
    }

    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b). 
     * @param rgb RGB color of the LED
     */
    //% weight=13
    //% blockId=showColor block="ambient light color|%ledcolor"
    //% ledcolor.shadow="maqueen_colors"
    export function showColor(rgb: number) {
        let buf = pins.createBuffer(12);
        let red = (rgb >> 16) & 0xFF;
        let green = (rgb >> 8) & 0xFF;
        let blue = rgb & 0xFF;

        const br = brightness;
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        for (let i = 0; i < 4; ++i) {
            buf[i * 3 + 0] = green;
            buf[i * 3 + 1] = red;
            buf[i * 3 + 2] = blue;
        }
        ws2812b.sendBuffer(buf, DigitalPin.P15);
    }

    /**
     * Turn off all LEDs.
     */
    //% weight=11
    //% blockId=clearNEO block="turn off ambient light"
    export function clear(): void {
        let buf = pins.createBuffer(12);
        buf.fill(0, 0, 12);
        ws2812b.sendBuffer(buf, DigitalPin.P15);
    }

    //% weight=12
    //% block="set brightness |%brightness_p"
    export function setBrightness(brightness_p: number): void {
        brightness = brightness_p & 0xff;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel [0-255] eg: 255
     * @param green value of the green channel [0-255] eg: 255
     * @param blue value of the blue channel [0-255] eg: 255
     */
    //% weight=22
    //% blockId="maqueen_fromRGB" block="red %red|green %green|blue %blue"
    //% advanced=true
    export function fromRGB(red: number, green: number, blue: number): number {
        return ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
    }


    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue [0-360]
     * @param s saturation [0-99]
     * @param l luminosity [0-99]
     */
    //% weight=10
    //% blockId="maqueen_fromHSL" block="hue %h|saturation %s|luminosity %l"
    export function fromHSL(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }
}
