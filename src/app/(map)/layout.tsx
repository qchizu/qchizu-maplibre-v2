import setting from "../../../public/setting.json";
import { LayerGroupItemProvider } from "../../components/custom/LayerGroupItemProvider";
import { getLayerSets } from "../../lib/getLayerSets";

export default async function MapLayout({ children }: { children: React.ReactNode }) {
    const layerGroupItems = await getLayerSets(setting.layersFileUrl);
    return <LayerGroupItemProvider layerGroupItems={layerGroupItems}>{children}</LayerGroupItemProvider>;
}
