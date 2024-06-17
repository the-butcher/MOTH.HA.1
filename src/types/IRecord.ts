export type TRecordKey = 'instant' | 'co2_lpf' | 'co2_raw' | 'pm010' | 'pm025' | 'pm100' | 'deg' | 'hum' | 'hpa' | 'bat';

/**
 * definition for a record (i.e. parsed from the 'api/datout' endpoint)
 * may have some of the keys defined above
 */
export type IRecord = { [K in string]: number }; // extends DatasetElementType<number> {
