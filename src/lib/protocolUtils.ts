/*
 * Copyright 2024 全国Ｑ地図管理者
 * Released under the MIT license
 * https://github.com/qchizu/qchizu_maplibre/blob/main/LISENCE.md
 */

const TWO_TO_23 = 8388608; // 2 ** 23
const TWO_TO_24 = 16777216; // 2 ** 24
const U = 0.01; // 標高分解能

export function getCalculateHeightFunction(encoding: string): (_r: number, _g: number, _b: number, _a: number) => number {
    switch (encoding) {
        case "gsi":
        case "gsj":
            return (r: number, g: number, b: number, a: number) => {
                const x = (r << 16) + (g << 8) + b;
                if (x < TWO_TO_23 && a !== 0) {
                    return x * U;
                } else if (x === TWO_TO_23 || a === 0) {
                    return -99999;
                } else {
                    return (x - TWO_TO_24) * U;
                }
            };
        case "mapbox":
            return (r: number, g: number, b: number) => ((r << 16) + (g << 8) + b) / 10 - 10000;
        case "terrarium":
            return (r: number, g: number, b: number) => (r << 8) + g + b / 256 - 32768;
        default:
            throw new Error("Unsupported encoding type");
    }
}
