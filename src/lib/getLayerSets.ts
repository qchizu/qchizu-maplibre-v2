/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayerGroupItem } from "../hooks/useLayers";

export const getLayerSets = async (rootTextFileUrl: string): Promise<LayerGroupItem[]> => {
    const url = new URL(rootTextFileUrl);
    const rootResponse = await fetch(url);
    const dirList = await rootResponse.json();
    const baseUrl = url.origin + url.pathname.split("/").slice(0, -1).join("/");

    const createItem = async (data: any): Promise<LayerGroupItem | null> => {
        if (data.type === "LayerGroup" && data.src) {
            const srcUrl = URL.canParse(data.src) ? data.src : baseUrl + data.src.slice(1);
            const response = await fetch(srcUrl);
            const responseData = await response.json();
            const items = (await Promise.all(responseData.layers.map(async (item: any) => await createItem(item)))).filter((i) => !!i);
            if (items.length === 0) {
                return null;
            }
            return {
                type: "LayerGroup",
                id: crypto.randomUUID(),
                title: data.title,
                iconUrl: data.iconUrl ? url.origin + data.iconUrl?.slice(1) : undefined,
                items,
            };
        }
        if (data.type === "LayerGroup") {
            const items = (await Promise.all(data.entries.map(async (item: any) => await createItem(item)))).filter((i) => !!i);
            if (items.length === 0) {
                return null;
            }
            return {
                type: "LayerGroup",
                id: crypto.randomUUID(),
                title: data.title,
                iconUrl: data.iconUrl,
                items,
            };
        }

        if (data.url.endsWith(".kml")) {
            const id = crypto.randomUUID();
            return {
                type: "Layer",
                id,
                title: data.title,
                source: {
                    type: "geojson",
                    data: `kml://${data.url}`,
                },
                layer: {
                    id,
                    type: "fill",
                    paint: {
                        "fill-color": "#088",
                    },
                },
                opacity: 0.8,
            };
        }

        if (data.url.endsWith("{z}/{x}/{y}.png") || data.url.endsWith("{z}/{x}/{y}.jpg") || data.url.startsWith("pmtiles://")) {
            const id = crypto.randomUUID();
            return {
                type: "Layer",
                id,
                title: data.title,
                source: {
                    type: "raster",
                    tiles: [data.url],
                    maxzoom: data.maxzoom,
                    minzoom: data.minzoom,
                },
                layer: {
                    id,
                    type: "raster",
                    paint: {},
                },
                opacity: 0.8,
            };
        }
        return null;
    };

    const layerGroupItems = (
        await Promise.all(
            dirList.map(async (dir: { url: string }) => {
                const url = URL.canParse(dir.url) ? dir.url : baseUrl + dir.url.slice(1);
                const response = await fetch(url);
                const data = await response.json();
                return await createItem(data.layers[0]);
            }),
        )
    ).filter((i) => !!i);

    return layerGroupItems;
};
