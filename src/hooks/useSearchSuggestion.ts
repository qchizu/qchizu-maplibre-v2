import { useEffect, useState } from "react";
import { MUNI } from "../lib/muni";

const reverseGeocode = async (longitude: number, latitude: number): Promise<string> => {
    const response = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lon=${longitude}&lat=${latitude}`);
    const data = await response.json();
    if (data.results) {
        return data.results.muniCd;
    }
    return "";
};

const getAddressFromPoint = async (point: GeoJSON.Feature<GeoJSON.Point>): Promise<GeoJSON.Feature<GeoJSON.Point>> => {
    let addressCode = point.properties?.addressCode;
    if (!addressCode) {
        const address = await reverseGeocode(point.geometry.coordinates[0], point.geometry.coordinates[1]);
        addressCode = address;
    }
    const newAddressCode = parseInt(addressCode, 10) + "";
    const muni = MUNI[newAddressCode];
    if (!muni) {
        return point;
    }
    const addressData = muni.split(",");
    const muniName = (addressData[1] + addressData[3]).replace("　", "");
    point.properties!.muniName = muniName;
    return point;
};

export const useSearchSuggestion = () => {
    const [address, setAddress] = useState("");
    const [suggestions, setSuggestions] = useState<GeoJSON.Feature<GeoJSON.Point>[]>([]);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchSuggestions = async () => {
            if (address.trim() === "") {
                setSuggestions([]);
                return;
            }
            try {
                const response = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`, {
                    signal: abortController.signal,
                });
                const data = await response.json();
                const suggestions = await Promise.all(
                    data.map(async (item: GeoJSON.Feature<GeoJSON.Point>) => {
                        return await getAddressFromPoint(item);
                    }),
                );
                setSuggestions(suggestions.slice(0, 24));
            } catch (error) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error("Failed to fetch suggestions:", error);
                }
            }
        };

        fetchSuggestions();
        return () => {
            abortController.abort();
        };
    }, [address]);

    return { address, setAddress, suggestions };
};
