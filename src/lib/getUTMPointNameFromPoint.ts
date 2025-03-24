import proj4 from "proj4";

// Set the projections
proj4.defs("EPSG:3097", "+proj=utm +zone=51 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:3098", "+proj=utm +zone=52 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:3099", "+proj=utm +zone=53 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:3100", "+proj=utm +zone=54 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:3101", "+proj=utm +zone=55 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("SR-ORG:1235", "+proj=utm +zone=56 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

const projection_world = "EPSG:4326";

export const getUTMPointNameFromPoint = (longitude: number, latitude: number): string | null => {
    const zoneNumber = longitudeToZoneNumber(longitude);
    const defineName = getDefineName(zoneNumber);
    if (defineName === null) {
        return null;
    }
    const point: [number, number] = [longitude, latitude];
    const utmPoint = proj4(projection_world, defineName, point);
    const utmMark = getUTMMark(latitude);
    return getUTMPointName(zoneNumber, utmMark, utmPoint[0], utmPoint[1], 4);
};

const longitudeToZoneNumber = (longitude: number): number => {
    return Math.floor(longitude / 6) + 31;
};

const getDefineName = (zoneNumber: number): string | null => {
    switch (zoneNumber) {
        case 51:
            return "EPSG:3097";
        case 52:
            return "EPSG:3098";
        case 53:
            return "EPSG:3099";
        case 54:
            return "EPSG:3100";
        case 55:
            return "EPSG:3101";
        case 56:
            return "SR-ORG:1235";
        default:
            return null;
    }
};

const getUTMMark = (latitude: number): string => {
    let mark = "";
    if (latitude >= 16 && latitude < 24) {
        mark = "Q";
    } else if (latitude >= 24 && latitude < 32) {
        mark = "R";
    } else if (latitude >= 32 && latitude < 40) {
        mark = "S";
    } else if (latitude >= 40 && latitude < 48) {
        mark = "T";
    } else if (latitude >= 48 && latitude < 56) {
        mark = "U";
    }
    return mark;
};

const getUTMPointName = (zoneNumber: number, utmMark: string, x: number, y: number, num: number, hideNumber?: number): string => {
    let x10mNumber = "";
    let y10mNumber = "";
    if (!hideNumber) {
        const zero = "0".repeat(num);
        x10mNumber = zero + Math.floor(x / 10);
        x10mNumber = x10mNumber.slice(-num);
        y10mNumber = zero + Math.floor(y / 10);
        y10mNumber = y10mNumber.slice(-num);
    }
    const letters = findGridLetters(zoneNumber, Math.floor(y / 10) * 10, Math.floor(x / 10) * 10);
    return `${zoneNumber}${utmMark}${letters}${x10mNumber}${y10mNumber}`;
};

const BLOCK_SIZE = 100000;
const GRIDSQUARE_SET_ROW_SIZE = 20;
const GRIDSQUARE_SET_COL_SIZE = 8;

const findGridLetters = (zoneNumber: number, northing: number, easting: number): string | null => {
    let row = 1;

    // northing coordinate to single-meter precision
    let north_1m = Math.round(northing);

    // Get the row position for the square identifier that contains the point
    while (north_1m >= BLOCK_SIZE) {
        north_1m = north_1m - BLOCK_SIZE;
        row++;
    }

    // cycle repeats (wraps) after 20 rows
    row = row % GRIDSQUARE_SET_ROW_SIZE;
    let col = 0;

    // easting coordinate to single-meter precision
    let east_1m = Math.round(easting);

    // Get the column position for the square identifier that contains the point
    while (east_1m >= BLOCK_SIZE) {
        east_1m = east_1m - BLOCK_SIZE;
        col++;
    }

    // cycle repeats (wraps) after 8 columns
    col = col % GRIDSQUARE_SET_COL_SIZE;

    const set = findSet(zoneNumber);
    if (set === null) {
        return null;
    }

    return lettersHelper(set, row, col);
};

const findSet = (zoneNumber: number): number | null => {
    zoneNumber = zoneNumber % 6;
    switch (zoneNumber) {
        case 0:
            return 6;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        case 5:
            return 5;
        default:
            return null;
    }
};

const lettersHelper = (set: number, _row: number, _col: number): string | null => {
    // handle case of last row
    let row = _row;
    let col = _col;
    if (row === 0) {
        row = GRIDSQUARE_SET_ROW_SIZE - 1;
    } else {
        row--;
    }
    if (col === 0) {
        col = GRIDSQUARE_SET_COL_SIZE - 1;
    } else {
        col--;
    }

    let l1 = "";
    let l2 = "";
    switch (set) {
        case 1:
            l1 = "ABCDEFGH";
            l2 = "ABCDEFGHJKLMNPQRSTUV";
            return l1.charAt(col) + l2.charAt(row);
        case 2:
            l1 = "JKLMNPQR";
            l2 = "FGHJKLMNPQRSTUVABCDE";
            return l1.charAt(col) + l2.charAt(row);
        case 3:
            l1 = "STUVWXYZ";
            l2 = "ABCDEFGHJKLMNPQRSTUV";
            return l1.charAt(col) + l2.charAt(row);
        case 4:
            l1 = "ABCDEFGH";
            l2 = "FGHJKLMNPQRSTUVABCDE";
            return l1.charAt(col) + l2.charAt(row);
        case 5:
            l1 = "JKLMNPQR";
            l2 = "ABCDEFGHJKLMNPQRSTUV";
            return l1.charAt(col) + l2.charAt(row);
        case 6:
            l1 = "STUVWXYZ";
            l2 = "FGHJKLMNPQRSTUVABCDE";
            return l1.charAt(col) + l2.charAt(row);
        default:
            return null;
    }
};
