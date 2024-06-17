import { TRecordKey } from './IRecord';
import { TLevel } from './ISensor';

export interface IContinuousColorConfig<Value = number | Date> {
  type: 'continuous';
  /**
   * The minimal value of the color scale.
   * @default 0
   */
  min?: Value;
  /**
   * The maximal value of the color scale.
   * @default 100
   */
  max?: Value;
  /**
   * The colors to render. It can be an array with the extremum colors, or an interpolation function.
   */
  color: [string, string] | ((t: number) => string);
}

export interface IPiecewiseColorConfig<Value = number | Date> {
  type: 'piecewise';
  /**
   * The thresholds where color should change from one category to another.
   */
  thresholds: Value[];
  /**
   * The colors used for each band defined by `thresholds`.
   * Should contain N+1 colors, where N is the number of thresholds.
   */
  colors: string[];
}

export interface ISeriesDef {
  recordKey: TRecordKey;
  hint: string;
  valueFormatter: (value: number | null) => string;
  levelFormatter: (value: number) => TLevel;
  colorMap?: IContinuousColorConfig | IPiecewiseColorConfig;
  getChartMin: (min: number) => number | undefined;
  getChartMax: (max: number) => number | undefined;
  getGaugeMin: (min: number) => number | undefined;
  getGaugeMax: (max: number) => number | undefined;
}

export const COLOR_G = '#0ec600';
export const COLOR_Y = '#cadf00';
export const COLOR_R = '#e20e00';

export const toLevelColor = (recordKey: TRecordKey, value: number): string => {
  const seriesDef = SERIES_DEFS[recordKey];
  const level = seriesDef.levelFormatter(value);
  if (level == 'norm') {
    return COLOR_G;
  } else if (level == 'warn') {
    return COLOR_Y;
  } else if (level == 'risk') {
    return COLOR_R;
  } else {
    return '#888888';
  }
}

const SERIES_DEF_CO2: Omit<ISeriesDef, 'recordKey' | 'hint'> = {
  valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(0)}ppm` : 'NA'),
  levelFormatter: (value: number) => {
    if (Number.isFinite(value)) {
      if (value > 1000) {
        return 'risk';
      } else if (value > 800) {
        return 'warn';
      } else {
        return 'norm';
      }
    }
    return 'none';
  },
  getChartMin: () => 0,
  getChartMax: () => undefined,
  getGaugeMin: () => 0,
  getGaugeMax: () => 1000,
}

const SERIES_DEF_PM: Omit<ISeriesDef, 'recordKey' | 'hint'> = {
  // recordKey: 'pm025',
  // hint: 'PM 2.5 (μg/m³)',
  valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(0)}μg/m³` : 'NA'),
  levelFormatter: (value: number) => {
    if (Number.isFinite(value)) {
      if (value > 15) {
        return 'risk';
      } else if (value > 5) {
        return 'warn';
      } else {
        return 'norm';
      }
    }
    return 'none';
  },
  getChartMin: () => 0,
  getChartMax: () => undefined,
  getGaugeMin: () => 0,
  getGaugeMax: () => 50,
}

export const SERIES_DEFS: { [k in TRecordKey]: ISeriesDef } = {
  instant: {
    recordKey: 'instant',
    hint: 'instant',
    valueFormatter: (value: number | null) => (Number.isFinite(value) ? value!.toString() : 'NA'),
    levelFormatter: () => 'none',
    getChartMin: (min) => min,
    getChartMax: (max) => max,
    getGaugeMin: (min) => min,
    getGaugeMax: (max) => max,
  },
  co2_lpf: {
    ...SERIES_DEF_CO2,
    recordKey: 'co2_lpf',
    hint: 'CO₂ (ppm)',
  },
  co2_raw: {
    ...SERIES_DEF_CO2,
    recordKey: 'co2_raw',
    hint: 'CO₂ (ppm)'
  },
  pm010: {
    ...SERIES_DEF_PM,
    recordKey: 'pm010',
    hint: 'PM 1.0 (μg/m³)'
  },
  pm025: {
    ...SERIES_DEF_PM,
    recordKey: 'pm025',
    hint: 'PM 2.5 (μg/m³)'
  },
  pm100: {
    ...SERIES_DEF_PM,
    recordKey: 'pm100',
    hint: 'PM 10.0 (μg/m³)'
  },
  deg: {
    recordKey: 'deg',
    hint: 'Temperature (°C)',
    valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(1)}°C` : 'NA'),
    levelFormatter: (value: number) => {
      if (Number.isFinite(value)) {
        if (value < 14 || value > 30) {
          return 'risk';
        } else if (value < 19 || value > 25) {
          return 'warn';
        } else {
          return 'norm';
        }
      }
      return 'none';
    },
    // colorMap: {
    //   type: 'piecewise',
    //   thresholds: [14, 19, 25, 30],
    //   colors: [COLOR_R, COLOR_Y, COLOR_G, COLOR_Y, COLOR_R],
    // },
    getChartMin: (min) => Math.floor(min - 0.1),
    getChartMax: (max) => Math.ceil(max + 0.1),
    getGaugeMin: () => 14 - 5,
    getGaugeMax: () => 30 + 5,
  },
  hum: {
    recordKey: 'hum',
    hint: 'Humidity (%RH)',
    valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(1)}%` : 'NA'),
    levelFormatter: (value: number) => {
      if (Number.isFinite(value)) {
        if (value < 25 || value > 65) {
          return 'risk';
        } else if (value < 30 || value > 60) {
          return 'warn';
        } else {
          return 'norm';
        }
      }
      return 'none';
    },
    // colorMap: {
    //   type: 'piecewise',
    //   thresholds: [25, 30, 60, 65],
    //   colors: [COLOR_R, COLOR_Y, COLOR_G, COLOR_Y, COLOR_R],
    // },
    getChartMin: (min) => Math.floor(min - 0.1),
    getChartMax: (max) => Math.ceil(max + 0.1),
    getGaugeMin: () => 25 - 5,
    getGaugeMax: () => 65 + 5,

  },
  hpa: {
    recordKey: 'hpa',
    hint: 'Pressure (hpa)',
    valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(1)}hpa` : 'NA'),
    levelFormatter: () => 'none',
    getChartMin: (min) => Math.floor(min - 0.1),
    getChartMax: (max) => Math.ceil(max + 0.1),
    getGaugeMin: () => 900,
    getGaugeMax: () => 1100,
  },
  bat: {
    recordKey: 'bat',
    hint: 'Battery (%RH)',
    valueFormatter: (value: number | null) => (Number.isFinite(value) ? `${value!.toFixed(0)}%` : 'NA'),
    levelFormatter: (value: number) => {
      if (Number.isFinite(value)) {
        if (value < 10) {
          return 'risk';
        } else if (value < 20) {
          return 'warn';
        } else {
          return 'norm';
        }
      }
      return 'none';
    },
    // colorMap: {
    //   type: 'piecewise',
    //   thresholds: [10, 20],
    //   colors: [COLOR_R, COLOR_Y, COLOR_G],
    // },
    getChartMin: (min) => Math.floor(min - 0.1),
    getChartMax: (max) => Math.ceil(max + 0.1),
    getGaugeMin: () => 0,
    getGaugeMax: () => 100,
  },
};
