import { Button, DataList, Popover } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { LngLat } from "react-map-gl/mapbox";
import { useMap } from "react-map-gl/maplibre";
import { getAddressFromGeojsonTile } from "../../lib/getAddressFromGeojsonTile";
import { getDemInfoFromDemTile } from "../../lib/getDemInfoFromDemTile";
import { getUTMPointNameFromPoint } from "../../lib/getUTMPointNameFromPoint";

export const CenterInfoPopover = () => {
    const { current: map } = useMap();
    const [center, setCenter] = useState<LngLat | null>(null);
    const [zoom, setZoom] = useState<number | null>(null);
    const [pitch, setPitch] = useState<number | null>(null);
    const [bearing, setBearing] = useState<number | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [utmpoint, setUTMPoint] = useState<string | null>(null);
    const [demInfo, setDemInfo] = useState<string | null>(null);

    const handleMoveEnd = useCallback(() => {
        if (!map) {
            return;
        }
        const center = map.getCenter();
        setCenter(center);
        setZoom(map.getZoom());
        setPitch(map.getPitch());
        setBearing(map.getBearing());
        getAddressFromGeojsonTile(center.lng, center.lat).then((address) => {
            if (address) {
                setAddress(address);
            } else {
                setAddress("");
            }
        });
        setUTMPoint(getUTMPointNameFromPoint(center.lng, center.lat));
        getDemInfoFromDemTile(center.lng, center.lat).then((demInfo) => {
            setDemInfo(demInfo);
        });
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        map.on("moveend", handleMoveEnd);
        handleMoveEnd();
        return () => {
            map.off("moveend", handleMoveEnd);
        };
    }, [map, handleMoveEnd]);

    return (
        <Popover.Root size="sm">
            <Popover.Trigger asChild>
                <Button h="44px" boxShadow="md" bg="bg.panel" color="fg">
                    情報
                </Button>
            </Popover.Trigger>
            <Popover.Positioner>
                <Popover.Content>
                    <Popover.Arrow>
                        <Popover.ArrowTip />
                    </Popover.Arrow>
                    <Popover.Body>
                        <Popover.Title fontWeight="bold" mb={4}>
                            中心の情報
                        </Popover.Title>
                        <DataList.Root gap={2}>
                            <DataList.Item>
                                <DataList.ItemLabel>緯度</DataList.ItemLabel>
                                <DataList.ItemValue>{center?.lat.toFixed(6)}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>経度</DataList.ItemLabel>
                                <DataList.ItemValue>{center?.lng.toFixed(6)}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>ズーム</DataList.ItemLabel>
                                <DataList.ItemValue>{zoom?.toFixed(2)}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>ピッチ</DataList.ItemLabel>
                                <DataList.ItemValue>{pitch?.toFixed(2)}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>ベアリング</DataList.ItemLabel>
                                <DataList.ItemValue>{bearing?.toFixed(2)}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>付近の住所（正確な所属を示すとは限らない）</DataList.ItemLabel>
                                <DataList.ItemValue>{address}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>UTMポイント</DataList.ItemLabel>
                                <DataList.ItemValue>{utmpoint}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item>
                                <DataList.ItemLabel>標高</DataList.ItemLabel>
                                <DataList.ItemValue>{demInfo}</DataList.ItemValue>
                            </DataList.Item>
                        </DataList.Root>
                    </Popover.Body>
                </Popover.Content>
            </Popover.Positioner>
        </Popover.Root>
    );
};
