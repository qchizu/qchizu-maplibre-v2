import { Tile3DLayer } from "@deck.gl/geo-layers";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useState } from "react";
import { useControl, useMap } from "react-map-gl/maplibre";
import threeDData from "../../../public/sources/3d.json";
import { threeDTileFilenameToMesh } from "../../lib/mesh";

const generateBaseLayers = () => {
    return threeDData.layers.map((layer) => {
        return new Tile3DLayer({
            id: layer.id,
            data: threeDData.layerHost + layer.path,
        });
    });
};

const features: GeoJSON.Feature<GeoJSON.Polygon>[] = threeDData.fileNames.map((fileName) => threeDTileFilenameToMesh(fileName));

const OverlayProvider = (props: MapboxOverlayProps) => {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
};

export const PointCloudOverlay = () => {
    const { current: map } = useMap();
    const [layers, setLayers] = useState<Tile3DLayer[]>([]);

    const updateLayers = useCallback(() => {
        if (!map) {
            setLayers([]);
            return;
        }

        const bounds = map.getBounds();
        const bboxPolygon = turf.bboxPolygon([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
        const clippedFeatureCollection = turf.featureCollection(features.filter((feature) => turf.booleanIntersects(bboxPolygon, feature)));

        setLayers([
            ...generateBaseLayers(),
            ...clippedFeatureCollection.features.map((feature) => {
                const filename = feature.properties?.filename;
                return new Tile3DLayer({
                    id: `3d-tiles-layer-${filename}`,
                    data: `${threeDData.layerHost}/${filename}/tileset.json`,
                });
            }),
        ]);
    }, [map]);

    useEffect(() => {
        updateLayers();
        map?.on("moveend", updateLayers);
        return () => {
            map?.off("moveend", updateLayers);
        };
    }, [map, updateLayers]);

    return <OverlayProvider layers={layers} />;
};
