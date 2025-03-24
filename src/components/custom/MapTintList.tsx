import {
    Button,
    ColorPicker,
    ColorPickerChannelSlider,
    Dialog,
    Field,
    For,
    HStack,
    Input,
    parseColor,
    Portal,
    Separator,
    Stack,
} from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { MapDemTint } from "../../hooks/useMapDems";
import { MapTintItem } from "./MapTintItem";

interface MapTintListProps {
    tints: MapDemTint[];
    colorOpacity: number;
    onChange: (_tints: MapDemTint[]) => void;
}

export const MapTintList = ({ tints, colorOpacity, onChange }: MapTintListProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState("0");
    const [tempColor, setTempColor] = useState(parseColor(`rgba(235, 94, 65, ${colorOpacity})`));

    const handleChangeItem = (index: number, tint: MapDemTint) => {
        const newTints = [...tints];
        newTints[index] = tint;
        onChange(newTints.sort((a, b) => a.from - b.from));
    };
    const handleDeleteItem = (index: number) => {
        const newTints = tints.filter((_, i) => i !== index);
        onChange(newTints.sort((a, b) => a.from - b.from));
    };

    const handleAddItem = () => {
        const newTints = [
            ...tints,
            {
                from: parseInt(tempFrom),
                color: [tempColor.getChannelValue("red"), tempColor.getChannelValue("green"), tempColor.getChannelValue("blue")] as [
                    number,
                    number,
                    number,
                ],
            },
        ];
        onChange(newTints.sort((a, b) => a.from - b.from));
        setDialogOpen(false);
    };

    return (
        <Stack gap={1}>
            <For each={tints}>
                {(tint, index) => (
                    <Fragment key={JSON.stringify(tint)}>
                        <MapTintItem
                            tint={tint}
                            colorOpacity={colorOpacity}
                            onChange={(tint) => handleChangeItem(index, tint)}
                            onDelete={() => handleDeleteItem(index)}
                        />
                        <Separator />
                    </Fragment>
                )}
            </For>
            <HStack justifyContent="flex-end" pr={1}>
                <Dialog.Root
                    placement="center"
                    open={dialogOpen}
                    onOpenChange={(e) => setDialogOpen(e.open)}
                    closeOnInteractOutside={false}
                >
                    <Dialog.Trigger asChild>
                        <Button size="2xs">
                            追加 <LuPlus />
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content m={2}>
                            <Dialog.Header>
                                <Dialog.Title>色彩の追加</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack>
                                    <Field.Root>
                                        <Field.Label>標高（m）</Field.Label>
                                        <Input
                                            type="number"
                                            min={-9999}
                                            max={9999}
                                            value={tempFrom}
                                            onChange={(e) => setTempFrom(e.target.value)}
                                        />
                                    </Field.Root>
                                    <ColorPicker.Root maxW={200} value={tempColor} onValueChange={(e) => setTempColor(e.value)}>
                                        <ColorPicker.HiddenInput />
                                        <ColorPicker.Label>色彩</ColorPicker.Label>
                                        <ColorPicker.Control>
                                            <ColorPicker.Input />
                                            <ColorPicker.Trigger />
                                        </ColorPicker.Control>
                                        <Portal>
                                            <ColorPicker.Positioner>
                                                <ColorPicker.Content>
                                                    <ColorPicker.Area />
                                                    <HStack>
                                                        <ColorPicker.EyeDropper size="xs" variant="outline" />
                                                        <ColorPickerChannelSlider channel="hue" />
                                                    </HStack>
                                                </ColorPicker.Content>
                                            </ColorPicker.Positioner>
                                        </Portal>
                                    </ColorPicker.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">キャンセル</Button>
                                </Dialog.ActionTrigger>
                                <Button disabled={!tempFrom || !tempColor} onClick={handleAddItem}>
                                    追加
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Dialog.Root>
            </HStack>
        </Stack>
    );
};
