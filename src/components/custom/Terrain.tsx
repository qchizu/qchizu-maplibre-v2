import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface TerrainProps {
    sourceId: string;
}

export const Terrain = ({ sourceId }: TerrainProps) => {
    const { current: map } = useMap();
    const maplibreMap = map?.getMap();

    useEffect(() => {
        if (!maplibreMap) {
            return;
        }

        const setupTerrain = () => {
            const source = maplibreMap.getSource(sourceId);
            if (source) {
                maplibreMap.setTerrain({
                    source: sourceId,
                    exaggeration: 1,
                });
                if (intervalId) {
                    clearInterval(intervalId);
                }
            }
        };
        const intervalId: NodeJS.Timeout = setInterval(setupTerrain, 100);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            maplibreMap.setTerrain(null);
        };
    }, [maplibreMap, sourceId]);

    return null;
};
