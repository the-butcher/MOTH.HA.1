export interface IClientCoordinate {
    clientX: number;
    clientY: number;
}

export interface IConfirmProps {
    getTitle: () => string;
    getContent: () => string;
    handleCancel: (e: IClientCoordinate) => void;
    handleConfirm: (e: IClientCoordinate) => void;
}