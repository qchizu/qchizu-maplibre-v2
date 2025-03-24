/*
 * Copyright 2024 全国Ｑ地図管理者
 * Released under the MIT license
 * https://github.com/qchizu/qchizu_maplibre/blob/main/LISENCE.md
 */
import { addProtocol, RequestParameters } from "maplibre-gl";
import { MapDemTint } from "../hooks/useMapDems";
import { getCalculateHeightFunction } from "./protocolUtils";

interface Dem2ReliefProtocolParams {
    protocol: string;
    encoding: string; //  'gsi', 'mapbox', 'terrarium'
    gradation: boolean; //  true, false
    colorMaps: MapDemTint[];
}

function dem2ReliefProtocol(params: Dem2ReliefProtocolParams) {
    const { protocol, encoding, gradation, colorMaps } = params;
    // エンコーディングに応じて適切な標高計算関数を取得
    const calculateHeight = getCalculateHeightFunction(encoding);

    // colorMaps を事前にソート
    colorMaps.sort((a, b) => a.from - b.from);

    const loadFn = async (params: RequestParameters, abortController: AbortController) => {
        const imageUrl = params.url.replace(`${protocol}://`, "");

        const response = await fetch(imageUrl, { signal: abortController.signal });

        if (response.status === 200) {
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return { data: null };
            }
            ctx.drawImage(imageBitmap, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const h = calculateHeight(r, g, b, 1);

                let [R, G, B] = [255, 255, 255]; // デフォルトの色
                if (gradation === true) {
                    // グラデーションを有効にする場合
                    let color1, color2;
                    let limit1, limit2;
                    for (let j = 0; j < colorMaps.length - 1; j++) {
                        if (h < colorMaps[j + 1].from) {
                            color1 = colorMaps[j].color;
                            color2 = colorMaps[j + 1].color;
                            limit1 = colorMaps[j].from;
                            limit2 = colorMaps[j + 1].from;
                            break;
                        }
                    }
                    if (color1 && color2 && limit1 !== undefined && limit2 !== undefined) {
                        const ratio = (h - limit1) / (limit2 - limit1);
                        R = color1[0] + ratio * (color2[0] - color1[0]);
                        G = color1[1] + ratio * (color2[1] - color1[1]);
                        B = color1[2] + ratio * (color2[2] - color1[2]);
                    } else {
                        [R, G, B] = colorMaps[colorMaps.length - 1].color;
                    }
                } else {
                    // グラデーションを無効にする場合
                    for (let j = 0; j < colorMaps.length; j++) {
                        if (h < colorMaps[j].from) {
                            [R, G, B] = colorMaps[j].color;
                            break;
                        }
                    }
                }

                data[i] = R;
                data[i + 1] = G;
                data[i + 2] = B;
                if (h === -99999) {
                    data[i + 3] = 0; // 透明
                }
            }

            ctx.putImageData(imageData, 0, 0);

            return canvas.convertToBlob().then(async (blob) => {
                return { data: await blob.arrayBuffer() };
            });
        } else {
            return { data: null }; // return null or other appropriate value
        }
    };

    // プロトコルを追加
    addProtocol(protocol, loadFn);
}

export { dem2ReliefProtocol };
