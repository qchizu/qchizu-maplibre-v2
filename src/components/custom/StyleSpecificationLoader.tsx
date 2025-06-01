import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

interface StyleSpecificationLoaderProps {
    styleUrl: string;
    opacity?: number;
}

export const StyleSpecificationLoader: React.FC<StyleSpecificationLoaderProps> = ({ styleUrl, opacity = 1.0 }) => {
    const { current: map } = useMap();
    const addedSourcesRef = useRef<string[]>([]);
    const addedLayersRef = useRef<string[]>([]);

    useEffect(() => {
        if (!map) return;
        
        // Get the actual MapLibre instance
        const mapInstance = map.getMap ? map.getMap() : map;
        
        if (!mapInstance || typeof mapInstance.addSource !== 'function') {
            return;
        }

        const loadStyleSpecification = async () => {
            try {
                // Wait for map to be fully loaded
                if (!mapInstance.isStyleLoaded()) {
                    await new Promise((resolve) => {
                        mapInstance.once('styledata', resolve);
                    });
                }
                
                // Fetch the style specification
                const response = await fetch(styleUrl);
                if (!response.ok) {
                    return;
                }

                const styleSpec = await response.json();
                const styleBaseUrl = styleUrl.substring(0, styleUrl.lastIndexOf('/'));

                // Helper function to resolve relative URLs
                const resolveUrl = (url: string) => {
                    if (!url || URL.canParse(url)) return url;
                    return new URL(url, styleBaseUrl + '/').href;
                };

                // Handle sprite and glyphs - merge with existing style rather than overwriting
                const currentStyle = mapInstance.getStyle();
                
                if (currentStyle) {
                    const updatedStyle = { ...currentStyle };
                    let needsUpdate = false;
                    
                    // Update sprite if specified and not already set
                    if (styleSpec.sprite && !updatedStyle.sprite) {
                        updatedStyle.sprite = resolveUrl(styleSpec.sprite);
                        needsUpdate = true;
                    }
                    
                    // Always use Geolonia glyphs for consistent Japanese font support
                    if (updatedStyle.glyphs !== "https://glyphs.geolonia.com/{fontstack}/{range}.pbf") {
                        updatedStyle.glyphs = "https://glyphs.geolonia.com/{fontstack}/{range}.pbf";
                        needsUpdate = true;
                    }
                    
                    // Only update if we actually changed something
                    if (needsUpdate) {
                        mapInstance.setStyle(updatedStyle);
                        // Wait for style to load before adding sources/layers
                        await new Promise((resolve) => {
                            if (mapInstance.isStyleLoaded()) {
                                resolve(undefined);
                            } else {
                                mapInstance.once('styledata', resolve);
                            }
                        });
                    }
                }

                // Generate unique prefix for this style to avoid ID conflicts
                const stylePrefix = `style-${Date.now()}-`;
                
                // Add all sources from the style with unique IDs
                const sourceMapping: Record<string, string> = {};
                for (const [originalSourceId, source] of Object.entries(styleSpec.sources || {})) {
                    const uniqueSourceId = stylePrefix + originalSourceId;
                    sourceMapping[originalSourceId] = uniqueSourceId;
                    
                    if (!mapInstance.getSource(uniqueSourceId)) {
                        const resolvedSource = { ...source };
                        
                        // Resolve relative URLs in tiles
                        if (resolvedSource.tiles) {
                            resolvedSource.tiles = resolvedSource.tiles.map(resolveUrl);
                        }
                        
                        // Resolve relative URL in data
                        if (resolvedSource.data && typeof resolvedSource.data === 'string') {
                            resolvedSource.data = resolveUrl(resolvedSource.data);
                        }
                        
                        // Resolve relative URL in url
                        if (resolvedSource.url) {
                            resolvedSource.url = resolveUrl(resolvedSource.url);
                        }

                        mapInstance.addSource(uniqueSourceId, resolvedSource);
                        addedSourcesRef.current.push(uniqueSourceId);
                    }
                }

                // Add all layers from the style with unique IDs and mapped source references
                for (const layer of styleSpec.layers || []) {
                    const uniqueLayerId = stylePrefix + layer.id;
                    
                    if (!mapInstance.getLayer(uniqueLayerId)) {
                        // Apply opacity to the layer
                        const layerWithOpacity = { 
                            ...layer,
                            id: uniqueLayerId,
                            source: sourceMapping[layer.source] || layer.source // Map to unique source ID
                        };
                        
                        if (opacity < 1.0 && layerWithOpacity.paint) {
                            layerWithOpacity.paint = { ...layerWithOpacity.paint };
                            
                            // Apply opacity based on layer type
                            const opacityProperties: Record<string, string> = {
                                'fill': 'fill-opacity',
                                'line': 'line-opacity',
                                'circle': 'circle-opacity',
                                'symbol': 'icon-opacity', // Also need text-opacity
                                'raster': 'raster-opacity',
                                'fill-extrusion': 'fill-extrusion-opacity',
                                'heatmap': 'heatmap-opacity',
                            };

                            const opacityProp = opacityProperties[layer.type];
                            if (opacityProp) {
                                layerWithOpacity.paint[opacityProp] = 
                                    (layerWithOpacity.paint[opacityProp] || 1) * opacity;
                                
                                // Special handling for symbol layers
                                if (layer.type === 'symbol') {
                                    layerWithOpacity.paint['text-opacity'] = 
                                        (layerWithOpacity.paint['text-opacity'] || 1) * opacity;
                                }
                            }
                        }
                        
                        mapInstance.addLayer(layerWithOpacity);
                        addedLayersRef.current.push(uniqueLayerId);
                    }
                }

            } catch (error) {
                // Silently fail
            }
        };

        loadStyleSpecification();

        // Cleanup function
        return () => {
            if (map) {
                const mapInstance = map.getMap ? map.getMap() : map;
                if (mapInstance && typeof mapInstance.removeLayer === 'function' && typeof mapInstance.removeSource === 'function') {
                    try {
                        // Remove added layers
                        for (const layerId of addedLayersRef.current) {
                            if (mapInstance.getLayer && mapInstance.getLayer(layerId)) {
                                mapInstance.removeLayer(layerId);
                            }
                        }
                        
                        // Remove added sources
                        for (const sourceId of addedSourcesRef.current) {
                            if (mapInstance.getSource && mapInstance.getSource(sourceId)) {
                                mapInstance.removeSource(sourceId);
                            }
                        }
                    } catch (error) {
                        // Silently fail
                    }
                    
                    // Clear the refs
                    addedLayersRef.current = [];
                    addedSourcesRef.current = [];
                }
            }
        };
    }, [map, styleUrl, opacity]);

    return null; // This component doesn't render anything
};