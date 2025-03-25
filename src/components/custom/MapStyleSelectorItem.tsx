import { Avatar, Box, defineStyle, IconButton } from "@chakra-ui/react";
import { useId, useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { MapStyle } from "../../hooks/useMapStyles";
import { pickPalette } from "../../lib/pickPalette";
import { Tooltip } from "../ui/tooltip";

interface MapStyleSelectorItemProps {
    style: MapStyle;
    isSelected: boolean;
    onClicked: () => void;
    deletable?: boolean;
    onDeleted?: () => void;
}

const ringCss = defineStyle({
    outlineWidth: "2px",
    outlineColor: "border.info !important",
    outlineOffset: "2px",
    outlineStyle: "solid",
});

export const MapStyleSelectorItem = ({ style, isSelected, onClicked, deletable = false, onDeleted }: MapStyleSelectorItemProps) => {
    const id = useId();
    const [visibleDeleteButton, setVisibleDeleteButton] = useState(false);

    return (
        <Box position="relative" onMouseEnter={() => setVisibleDeleteButton(true)} onMouseLeave={() => setVisibleDeleteButton(false)}>
            <Tooltip content={style.name} ids={{ trigger: id }}>
                <Avatar.Root
                    as="button"
                    focusRing="outside"
                    focusRingColor="border.inverted"
                    ids={{ root: id }}
                    css={isSelected ? ringCss : undefined}
                    colorPalette={pickPalette(style.name)}
                    shape="rounded"
                    size="lg"
                    onClick={onClicked}
                    cursor="pointer"
                >
                    <Avatar.Fallback name={style.name} />
                    <Avatar.Image src={style.icon} />
                </Avatar.Root>
            </Tooltip>
            {deletable && (
                <IconButton
                    aria-label="削除"
                    size="2xs"
                    variant="subtle"
                    colorPalette="red"
                    position="absolute"
                    bottom={-1}
                    right={-1}
                    onClick={onDeleted}
                    visibility={visibleDeleteButton ? "visible" : "hidden"}
                >
                    <LuTrash2 />
                </IconButton>
            )}
        </Box>
    );
};
