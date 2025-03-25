"use client";

import { createContext, useContext } from "react";
import { LayerGroupItem } from "../../hooks/useLayers";

const LayerGroupItemContext = createContext<LayerGroupItem[]>([]);

export const LayerGroupItemProvider = ({ children, layerGroupItems }: { children: React.ReactNode; layerGroupItems: LayerGroupItem[] }) => {
    return <LayerGroupItemContext.Provider value={layerGroupItems}>{children}</LayerGroupItemContext.Provider>;
};

export const useLayerGroupItems = () => {
    const context = useContext(LayerGroupItemContext);
    if (!context) {
        throw new Error("useLayerGroupItems must be used within a LayerGroupItemProvider");
    }
    return context;
};
