import { useState } from "react";
import demSources from "../../public/sources/dems.json";

type DemEncodingType = "mapbox" | "terrarium" | "custom" | undefined;
export interface MapDem {
    id: string;
    name: string;
    url: string;
    tiles: string[];
    encoding: DemEncodingType;
    tileSize: number;
    maxZoom: number;
    attribution?: string;
}

export interface MapDemTint {
    from: number;
    color: [number, number, number];
}

const mapDemSources: MapDem[] = Object.entries(demSources).map(([key, value]) => ({
    id: key,
    name: value.name,
    url: value.encoding === "gsi" ? `gsidem://${value.url}` : value.url,
    tiles: value.tiles,
    encoding: value.encoding === "gsi" ? "terrarium" : (value.encoding as DemEncodingType),
    maxZoom: value.maxZoom,
    attribution: value.attribution,
    tileSize: value.encoding === "gsi" ? 256 : 512,
}));

const defaultDemTints: MapDemTint[] = [
    { from: -10, color: [83, 135, 148] },
    { from: 0, color: [83, 135, 148] },
    { from: 1, color: [0, 204, 204] },
    { from: 10, color: [128, 215, 255] },
    { from: 30, color: [191, 255, 191] },
    { from: 60, color: [117, 255, 117] },
    { from: 140, color: [73, 179, 2] },
    { from: 300, color: [255, 255, 0] },
    { from: 600, color: [253, 164, 32] },
    { from: 900, color: [217, 109, 0] },
    { from: 1100, color: [163, 87, 10] },
    { from: 1500, color: [148, 107, 64] },
    { from: 2000, color: [143, 132, 122] },
    { from: 2500, color: [187, 181, 175] },
    { from: 3000, color: [230, 229, 227] },
    { from: 4000, color: [255, 255, 255] },
];

export const useMapDems = () => {
    const [selectedDemSource, setSelectedDemSource] = useState<MapDem>(mapDemSources[0]);
    const [enableShadow, setEnableShadow] = useState(false);
    const [shadowOpacity, setShadowOpacity] = useState(0.4);
    const [enableColor, setEnableColor] = useState(false);
    const [colorOpacity, setColorOpacity] = useState(0.4);
    const [enableTerrain, setEnableTerrain] = useState(false);
    const [demTints, setDemTints] = useState<MapDemTint[]>(defaultDemTints);

    return {
        mapDemSources,
        selectedDemSource,
        setSelectedDemSource,
        shadowOpacity,
        setShadowOpacity,
        enableTerrain,
        setEnableTerrain,
        demTints,
        setDemTints,
        colorOpacity,
        setColorOpacity,
        enableShadow,
        setEnableShadow,
        enableColor,
        setEnableColor,
    };
};
