import { useState } from "react";

export const usePointCloud = () => {
    const [enablePointCloud, setEnablePointCloud] = useState(false);
    return { enablePointCloud, setEnablePointCloud };
};
