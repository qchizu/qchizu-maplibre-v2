import { useState } from "react";
import { LayerProps, SourceProps } from "react-map-gl/maplibre";

export type LayerGroupItem = LayerSet | LayerGroup;

interface LayerGroup {
    type: "LayerGroup";
    id: string;
    title: string;
    iconUrl?: string;
    items: LayerGroupItem[];
}

export interface LayerSet {
    type: "Layer";
    id: string;
    title: string;
    source: SourceProps;
    layer: LayerProps;
    opacity: number;
}

interface UseLayerProps {
    layerGroupItems: LayerGroupItem[];
}

export const useLayers = ({ layerGroupItems }: UseLayerProps) => {
    const [activeLayerSets, setActiveLayerSets] = useState<LayerSet[]>([]);

    /**
     * layerGroupItemsからidに一致するLayerSetを再帰的に検索する
     */
    const findLayerSetById = (items: LayerGroupItem[], targetId: string): LayerSet | null => {
        for (const item of items) {
            if (item.type === "Layer" && item.id === targetId) {
                return item;
            }
            if (item.type === "LayerGroup") {
                const found = findLayerSetById(item.items, targetId);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    /**
     * activeLayerSetsにLayerSetを追加または削除する
     */
    const toggleActiveLayerSet = (id: string) => {
        const layerSet = findLayerSetById(layerGroupItems, id);
        if (!layerSet) {
            return;
        }

        setActiveLayerSets((prev) => {
            const isAlreadyActive = prev.some((set) => set.id === id);
            if (isAlreadyActive) {
                return prev.filter((set) => set.id !== id);
            } else {
                return [...prev, layerSet];
            }
        });
    };

    return { activeLayerSets, toggleActiveLayerSet, setActiveLayerSets };
};
