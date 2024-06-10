export type TRecordKey = 'instant' | 'co2_lpf' | 'co2_raw' | 'deg' | 'hum' | 'hpa' | 'bat';

/**
 * definition for a record (i.e. parsed from the 'api/datout' endpoint)
 */
export type IRecord = { [K in string]: number }; // extends DatasetElementType<number> {
