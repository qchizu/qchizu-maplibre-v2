import { removeProtocol } from "maplibre-gl";
import { useEffect } from "react";
import demSources from "../../public/sources/dems.json";
import { dem2ReliefProtocol } from "../lib/dem2ReliefProtocol";
import { MapDemTint } from "./useMapDems";

interface Dem2ReliefProtocolParams {
    demSourceKey: string;
    colorMaps: MapDemTint[];
}

export const useDem2ReliefProtocol = ({ demSourceKey, colorMaps }: Dem2ReliefProtocolParams) => {
    const demSource = demSources[demSourceKey as keyof typeof demSources];
    if (!demSource) {
        throw new Error(`demSourceKey: ${demSourceKey} is not found`);
    }

    useEffect(() => {
        const protocol = `relief${demSourceKey.charAt(0).toUpperCase() + demSourceKey.slice(1)}`;
        dem2ReliefProtocol({
            protocol,
            encoding: demSource.encoding,
            gradation: true,
            colorMaps,
        });
        return () => {
            removeProtocol(protocol);
        };
    }, [demSourceKey, colorMaps, demSource]);
};
