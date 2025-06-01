/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayerGroupItem } from "../hooks/useLayers";

export const getLayerSets = async (rootTextFileUrl: string): Promise<LayerGroupItem[]> => {
    const url = new URL(rootTextFileUrl);
    const rootResponse = await fetch(url);
    
    if (!rootResponse.ok) {
        console.error(`Failed to fetch layers from ${rootTextFileUrl}: ${rootResponse.status} ${rootResponse.statusText}`);
        throw new Error(`Failed to fetch layers: ${rootResponse.status} ${rootResponse.statusText}`);
    }
    
    const contentType = rootResponse.headers.get("content-type");
    if (contentType && !contentType.includes("application/json") && !contentType.includes("text/plain")) {
        console.error(`Expected JSON but received ${contentType} from ${rootTextFileUrl}`);
        const text = await rootResponse.text();
        console.error("Response body:", text.substring(0, 200));
        throw new Error(`Expected JSON but received ${contentType}`);
    }
    
    const dirList = await rootResponse.json();
    const baseUrl = url.origin + url.pathname.split("/").slice(0, -1).join("/");

    const createItem = async (data: any, currentBaseUrl?: string): Promise<LayerGroupItem | null> => {
        const itemBaseUrl = currentBaseUrl || baseUrl;
        
        if (data.type === "LayerGroup" && data.src) {
            const srcUrl = URL.canParse(data.src) ? data.src : itemBaseUrl + data.src.slice(1);
            const response = await fetch(srcUrl);
            
            if (!response.ok) {
                console.error(`Failed to fetch layer group from ${srcUrl}: ${response.status} ${response.statusText}`);
                return null;
            }
            
            const contentType = response.headers.get("content-type");
            if (contentType && !contentType.includes("application/json") && !contentType.includes("text/plain")) {
                console.error(`Expected JSON but received ${contentType} from ${srcUrl}`);
                return null;
            }
            
            const responseData = await response.json();
            const srcBaseUrl = srcUrl.substring(0, srcUrl.lastIndexOf('/'));
            const items = (await Promise.all(responseData.layers.map(async (item: any) => await createItem(item, srcBaseUrl)))).filter((i) => !!i);
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
            const items = (await Promise.all(data.entries.map(async (item: any) => await createItem(item, itemBaseUrl)))).filter((i) => !!i);
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

        if (data.url && data.url.endsWith(".kml")) {
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

        if (data.url && (data.url.endsWith("{z}/{x}/{y}.png") || data.url.endsWith("{z}/{x}/{y}.jpg") || data.url.startsWith("pmtiles://"))) {
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
        
        // Handle style.json files (MapLibre Style Specification)
        // Check both 'style' property and 'url' property that might reference style files
        const styleUrl = data.style || (data.url && data.url.includes('layers_json') ? data.url : null);
        
        if (styleUrl && styleUrl.endsWith('.json') && (data.style || data.url?.includes('layers_json'))) {
            // This is a MapLibre style specification file
            const id = crypto.randomUUID();
            let resolvedStyleUrl;
            
            if (URL.canParse(styleUrl)) {
                resolvedStyleUrl = styleUrl;
            } else {
                const baseUrl = new URL(itemBaseUrl);
                resolvedStyleUrl = new URL(styleUrl, baseUrl.href).href;
            }
            
            
            // Return a special layer type that contains the entire style specification URL
            // MapLibre will handle loading and processing the style.json
            return {
                type: "Layer",
                id,
                title: data.title,
                source: {
                    type: "style-specification",
                    url: resolvedStyleUrl
                },
                layer: {
                    id,
                    type: "style-specification"
                },
                opacity: data.opacity || 1.0
            };
        }
        
        // Handle JSON layer files (e.g., GeoJSON)
        if (data.url && data.url.endsWith(".json")) {
            const id = crypto.randomUUID();
            let jsonUrl;
            
            if (URL.canParse(data.url)) {
                // Absolute URL
                jsonUrl = data.url;
            } else {
                // Relative URL - resolve it properly
                const baseUrl = new URL(itemBaseUrl);
                jsonUrl = new URL(data.url, baseUrl.href).href;
            }
            
            
            // Check if this is actually a MapLibre style JSON by looking at the data properties
            if (data.style || data.layers || data.sources) {
                return null;
            }
            
            return {
                type: "Layer",
                id,
                title: data.title,
                source: {
                    type: "geojson",
                    data: jsonUrl,
                },
                layer: {
                    id,
                    type: "fill",
                    paint: {
                        "fill-color": "#088",
                        "fill-opacity": 0.8,
                    },
                },
                opacity: 1.0,
            };
        }
        
        // Handle vector tile layers
        if (data.url && data.url.endsWith("{z}/{x}/{y}.pbf")) {
            const id = crypto.randomUUID();
            const pbfUrl = URL.canParse(data.url) ? data.url : new URL(data.url, itemBaseUrl).href;
            
            // Check if style is provided in the data
            if (data.style) {
                return {
                    type: "Layer",
                    id,
                    title: data.title,
                    source: {
                        type: "vector",
                        tiles: [pbfUrl],
                        maxzoom: data.maxzoom || 18,
                        minzoom: data.minzoom || 0,
                    },
                    layer: data.style,
                    opacity: data.opacity || 1.0,
                };
            }
            
            // Default style for vector tiles (try multiple layer types)
            return {
                type: "Layer",
                id,
                title: data.title,
                source: {
                    type: "vector",
                    tiles: [pbfUrl],
                    maxzoom: data.maxzoom || 18,
                    minzoom: data.minzoom || 0,
                },
                layer: {
                    id,
                    type: "line",
                    "source-layer": data.sourceLayer || data["source-layer"] || "",
                    paint: {
                        "line-color": "#000",
                        "line-width": 1,
                    },
                },
                opacity: 1.0,
            };
        }
        
        // Check if this is a reference to a MapLibre style specification
        if (data.style && !data.url) {
            console.log("Layer with style reference (needs implementation):", {
                title: data.title,
                style: data.style,
                type: data.type
            });
            // TODO: Implement loading of MapLibre style specifications
            // This would require fetching the style JSON and extracting its sources and layers
            return null;
        }
        
        
        return null;
    };

    const layerGroupItems = (
        await Promise.all(
            dirList.map(async (dir: { url: string }) => {
                const url = URL.canParse(dir.url) ? dir.url : baseUrl + dir.url.slice(1);
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.error(`Failed to fetch layer from ${url}: ${response.status} ${response.statusText}`);
                    return null;
                }
                
                const contentType = response.headers.get("content-type");
                if (contentType && !contentType.includes("application/json") && !contentType.includes("text/plain")) {
                    console.error(`Expected JSON but received ${contentType} from ${url}`);
                    return null;
                }
                
                const data = await response.json();
                // Process all layers in the file, not just the first one
                // Use the directory of the current file as base URL for relative paths
                const fileBaseUrl = url.substring(0, url.lastIndexOf('/'));
                const items = await Promise.all(data.layers.map(async (layer: any) => await createItem(layer, fileBaseUrl)));
                const validItems = items.filter((i) => !!i);
                return validItems;
            }),
        )
    ).flat().filter((i) => !!i);

    return layerGroupItems;
};
