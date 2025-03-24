import { createListCollection, Portal, Select } from "@chakra-ui/react";
import { MapDem } from "../../hooks/useMapDems";

interface MapDemSelectorProps {
    demSources: MapDem[];
    selectedDemSource: MapDem | undefined;
    onDemSelected: (_dem: MapDem) => void;
}

export const MapDemSelector = ({ demSources, selectedDemSource, onDemSelected }: MapDemSelectorProps) => {
    const demSourceList = createListCollection({
        items: demSources.map((dem) => ({
            value: dem.id,
            label: dem.name,
        })),
    });

    const handleDemSelected = (demId: string) => {
        const dem = demSources.find((dem) => dem.id === demId);
        if (dem) {
            onDemSelected(dem);
        }
    };

    return (
        <Select.Root
            size="xs"
            w={180}
            px={1}
            collection={demSourceList}
            value={[selectedDemSource?.id || ""]}
            positioning={{ placement: "bottom-end" }}
            onValueChange={(e) => handleDemSelected(e.value[0])}
        >
            <Select.HiddenSelect />
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="標高データソースを選択" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
                <Select.Positioner>
                    <Select.Content>
                        {demSourceList.items.map((demSource) => (
                            <Select.Item item={demSource} key={demSource.value}>
                                {demSource.label}
                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Positioner>
            </Portal>
        </Select.Root>
    );
};
