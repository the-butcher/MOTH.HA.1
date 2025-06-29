export type TStorageKey = 'SK_FORECAST';

export interface ILocalStorageValue<T> {
    instant: number;
    value: T;
}

export class LocalStorageUtil {

    static store<T>(key: TStorageKey, value: T): void {
        const localStorageValue: ILocalStorageValue<T> = {
            instant: Date.now(),
            value
        }
        localStorage.setItem(key, JSON.stringify(localStorageValue));
    }

    static load<T>(key: TStorageKey, maxAge: number = -1): T | undefined {
        const localStorageValueRaw = localStorage.getItem(key);
        if (localStorageValueRaw) {
            const localStorageValue: ILocalStorageValue<T> = JSON.parse(localStorageValueRaw);
            if (maxAge < 0 || localStorageValue.instant + maxAge > Date.now()) {
                return localStorageValue.value;
            }
        }
    }

}