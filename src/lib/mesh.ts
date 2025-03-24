import * as GeoJSON from "geojson";

export const threeDTileFilenameToMesh = (filename: string): GeoJSON.Feature<GeoJSON.Polygon> => {
    // file name sample: "3DPC-AL-55402630-20201029-a"
    const splits = filename.split("-");
    const meshcode = splits[2];
    return meshcodeToMesh(filename, meshcode);
};

export const filenameToMesh = (filename: string): GeoJSON.Feature<GeoJSON.Polygon> => {
    // file name sample: "3DPC-AL-5540-26-30-20201029-a.copc.laz"
    const splits = filename.split("-");
    const first = splits[2];
    const second = splits[3];
    const third = splits[4];
    const meshcode = `${first}${second}${third}`;
    return meshcodeToMesh(filename, meshcode);
};

const meshcodeToMesh = (filename: string, meshcode: string): GeoJSON.Feature<GeoJSON.Polygon> => {
    let left_x = 0;
    let right_x = 0;
    let left_y = 0;
    let right_y = 0;

    // 1次メッシュ
    const mesh_y_1st = parseInt(meshcode.slice(0, 2), 10);
    const mesh_x_1st = parseInt(meshcode.slice(2, 4), 10);
    left_x = mesh_x_1st + 100;
    left_y = (mesh_y_1st * 40) / 60;

    // 2次メッシュ
    const mesh_y_2nd = parseInt(meshcode.slice(4, 5), 10);
    const mesh_x_2nd = parseInt(meshcode.slice(5, 6), 10);
    left_x += (mesh_x_2nd * 7.5) / 60;
    left_y += (mesh_y_2nd * 5) / 60;

    // 3次メッシュ
    const mesh_y_3rd = parseInt(meshcode.slice(6, 7), 10);
    const mesh_x_3rd = parseInt(meshcode.slice(7, 8), 10);
    left_x += (mesh_x_3rd * 45) / 60 / 60;
    left_y += (mesh_y_3rd * 30) / 60 / 60;

    right_x = left_x + (1 * 45) / 60 / 60;
    right_y = left_y + (1 * 30) / 60 / 60;
    return _create_polygon(left_x, right_x, left_y, right_y, filename);
};

const _create_polygon = (
    left_x: number,
    right_x: number,
    left_y: number,
    right_y: number,
    filename: string,
): GeoJSON.Feature<GeoJSON.Polygon> => {
    const polygon = {
        type: "Feature",
        properties: {
            filename,
        },
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [left_x, left_y],
                    [right_x, left_y],
                    [right_x, right_y],
                    [left_x, right_y],
                    [left_x, left_y],
                ],
            ],
        },
    } as GeoJSON.Feature<GeoJSON.Polygon>;
    return polygon;
};
