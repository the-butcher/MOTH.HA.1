export interface IClientCoordinate {
    clientX: number;
    clientY: number;
}

export interface ISwitchAction {
    /**
     * create visual selection in 3d display
     * @returns
     */
    focus: () => void;
    /**
     * clear visual selection in 3d display
     * @returns
     */
    blur: () => void;
    action: () => void;
}