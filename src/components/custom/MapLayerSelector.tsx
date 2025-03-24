import { Accordion, Checkbox, Icon, Image, Spacer, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuFolder } from "react-icons/lu";
import { LayerGroupItem, LayerSet } from "../../hooks/useLayers";

interface MapLayerSelectorProps {
    layerGroupItems: LayerGroupItem[];
    activeLayerSets: LayerSet[];
    toggleActiveLayerSet: (_id: string) => void;
}

export const MapLayerSelector = ({ layerGroupItems, activeLayerSets, toggleActiveLayerSet }: MapLayerSelectorProps) => {
    return (
        <Stack gap={0}>
            {layerGroupItems.map((item) => (
                <MapLayerSelectorItem
                    key={item.id}
                    item={item}
                    activeLayerSets={activeLayerSets}
                    toggleActiveLayerSet={toggleActiveLayerSet}
                />
            ))}
        </Stack>
    );
};

interface MapLayerSelectorItemProps {
    item: LayerGroupItem;
    activeLayerSets: LayerSet[];
    toggleActiveLayerSet: (_id: string) => void;
}

const MapLayerSelectorItem = ({ item, activeLayerSets, toggleActiveLayerSet }: MapLayerSelectorItemProps) => {
    const [openValue, setOpenValue] = useState<string[]>([]);
    return (
        <>
            {item.type === "LayerGroup" ? (
                <Accordion.Root size="sm" variant="plain" collapsible value={openValue} onValueChange={(e) => setOpenValue(e.value)}>
                    <Accordion.Item value={item.id}>
                        <Accordion.ItemTrigger py={1}>
                            {item.iconUrl ? (
                                <Image src={item.iconUrl} alt={item.title} h={4} w={4} />
                            ) : (
                                <Icon w={4} h={4}>
                                    <LuFolder />
                                </Icon>
                            )}
                            <Text>{item.title}</Text>
                            <Spacer />
                            <Accordion.ItemIndicator />
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent pl={4}>
                            <Accordion.ItemBody py={1}>
                                {openValue.includes(item.id) && (
                                    <Stack gap={0}>
                                        {item.items.map((item) => (
                                            <MapLayerSelectorItem
                                                key={item.id}
                                                item={item}
                                                activeLayerSets={activeLayerSets}
                                                toggleActiveLayerSet={toggleActiveLayerSet}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Accordion.ItemBody>
                        </Accordion.ItemContent>
                    </Accordion.Item>
                </Accordion.Root>
            ) : (
                <Checkbox.Root
                    size="sm"
                    checked={activeLayerSets.some((set) => set.id === item.id)}
                    onCheckedChange={() => toggleActiveLayerSet(item.id)}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{item.title}</Checkbox.Label>
                </Checkbox.Root>
            )}
        </>
    );
};
