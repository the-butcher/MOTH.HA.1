export interface IClientCoordinate {
    clientX: number;
    clientY: number;
}

export interface ISwitchProps {
    // title: string;
    // content: string;
    /**
     * create visual selection in 3d display
     * @returns
     */
    select: () => void;
    /**
     * clear visual selection in 3d display
     * @returns
     */
    deselect: () => void;
    toggle: () => void;
}