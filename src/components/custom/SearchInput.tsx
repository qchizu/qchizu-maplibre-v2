import { Box, For, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import { useSearchSuggestion } from "../../hooks/useSearchSuggestion";

export const SearchInput = () => {
    const { address, setAddress, suggestions } = useSearchSuggestion();
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isComposing, setIsComposing] = useState(false);
    const { current: map } = useMap();

    const handleSelectSuggestion = (suggestion: GeoJSON.Feature<GeoJSON.Point>) => {
        setIsFocused(false);
        map?.flyTo({
            center: [suggestion.geometry.coordinates[0], suggestion.geometry.coordinates[1]],
            zoom: 15,
            speed: 2,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (e.key === "Enter" && !isComposing) {
            handleSelectSuggestion(suggestions[0]);
            setIsFocused(false);
        }
    };

    // 検索エリア外のクリックでフォーカスを解除
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Box position="relative" ref={containerRef} boxShadow="md" borderRadius="md">
            <InputGroup startElement={<LuSearch />} zIndex={20}>
                <Input
                    size="lg"
                    w={280}
                    placeholder="地名検索"
                    bg="bg"
                    borderRadius="md"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={handleKeyDown}
                />
            </InputGroup>
            <Box
                position="absolute"
                zIndex={10}
                maxH={380}
                overflowY="auto"
                shadow="md"
                top="38px"
                pt="2px"
                left="1px"
                w="calc(100% - 2px)"
                bg="bg"
                borderBottomRadius="md"
                style={{
                    scrollbarColor: "rgba(82, 82, 91, 0.5) transparent",
                    scrollbarWidth: "thin",
                }}
                hidden={!isFocused || suggestions.length === 0}
            >
                <For each={suggestions}>
                    {(suggestion, index) => (
                        <Stack
                            w="100%"
                            p={2}
                            gap={1}
                            key={`${address}-${index}`}
                            as="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                        >
                            <Text fontSize="sm" textAlign="left">
                                {suggestion.properties?.title}
                            </Text>
                            <Text fontSize="xs" textAlign="left" color="fg.muted">
                                {suggestion.properties?.muniName}
                            </Text>
                        </Stack>
                    )}
                </For>
            </Box>
        </Box>
    );
};
