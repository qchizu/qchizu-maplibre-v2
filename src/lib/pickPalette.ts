const colorPalette = ["blue", "green", "yellow", "purple", "orange"];

export const pickPalette = (name: string) => {
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
};
