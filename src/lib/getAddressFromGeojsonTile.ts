import * as turf from "@turf/turf";
const baseURL = "https://cyberjapandata.gsi.go.jp/xyz/lv01_plg/";
const tileExtension = ".geojson";
const tileZoom = 14;

type GeoJsonProperties = Record<string, string | number | boolean | null>;

const tileXFromLongitude = (longitude: number, zoom: number): number => {
    return Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom));
};

const tileYFromLatitude = (latitude: number, zoom: number): number => {
    return Math.floor(
        ((1 - Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom),
    );
};

export const getAddressFromGeojsonTile = async (longitude: number, latitude: number): Promise<string | null> => {
    const tileX = tileXFromLongitude(longitude, tileZoom);
    const tileY = tileYFromLatitude(latitude, tileZoom);
    const url = `${baseURL}${tileZoom}/${tileX}/${tileY}${tileExtension}`;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }
    const json = await response.json();
    for (const feature of json.features) {
        if (turf.booleanPointInPolygon([longitude, latitude], feature.geometry)) {
            return getAddressFromFeature(feature.properties);
        }
    }
    return null;
};

const getAddressFromFeature = (properties: GeoJsonProperties): string | null => {
    let address = "";
    if (Object.prototype.hasOwnProperty.call(properties, "pref")) {
        address += properties["pref"];
    } else {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(properties, "muni")) {
        address += properties["muni"];
    } else {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(properties, "LV01")) {
        address += properties["LV01"];
    } else {
        return null;
    }
    return address;
};
