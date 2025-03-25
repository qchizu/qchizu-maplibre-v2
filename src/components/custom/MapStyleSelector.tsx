"use client";

import { FileUpload, For, IconButton, SimpleGrid } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { MapStyle } from "../../hooks/useMapStyles";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { toaster } from "../ui/toaster";
import { Tooltip } from "../ui/tooltip";
import { MapStyleSelectorItem } from "./MapStyleSelectorItem";

interface MapStyleSelectorProps {
    styles: MapStyle[];
    selectedStyle: MapStyle | undefined;
    onStyleSelected: (_style: MapStyle) => void;
    onStyleUploaded: (_style: MapStyle) => void;
    onStyleDeleted: (_style: MapStyle) => void;
}

export const MapStyleSelector = ({ styles, selectedStyle, onStyleSelected, onStyleUploaded, onStyleDeleted }: MapStyleSelectorProps) => {
    const handleFileAccepted = async (details: { files: File[] }) => {
        try {
            const file = details.files[0];
            if (!file) {
                throw new Error("アップロードに失敗しました");
            }
            const fileContent = await file.text();
            const mapStyle = {
                id: crypto.randomUUID(),
                name: file.name,
                style: JSON.parse(fileContent),
                deletable: true,
            };
            onStyleUploaded(mapStyle);
        } catch (error) {
            console.error("Invalid JSON file:", error);
            toaster.create({
                type: "error",
                title: getErrorMessage(error),
            });
        }
    };

    return (
        <SimpleGrid px={1} w="100%" gap={2} columns={6}>
            <For each={styles}>
                {(style) => (
                    <MapStyleSelectorItem
                        key={style.id}
                        style={style}
                        isSelected={selectedStyle?.id === style.id}
                        onClicked={() => onStyleSelected(style)}
                        deletable={style.deletable}
                        onDeleted={() => onStyleDeleted(style)}
                    />
                )}
            </For>
            <FileUpload.Root accept=".json" maxFileSize={5_000_000} onFileAccept={handleFileAccepted}>
                <FileUpload.HiddenInput />
                <Tooltip content="スタイルJSONをアップロード">
                    <FileUpload.Trigger asChild>
                        <IconButton aria-label="スタイルJSONをアップロード" variant="subtle" size="lg">
                            <LuPlus />
                        </IconButton>
                    </FileUpload.Trigger>
                </Tooltip>
            </FileUpload.Root>
        </SimpleGrid>
    );
};
