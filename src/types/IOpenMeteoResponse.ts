export interface IOpenMeteoResponse {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units: {
        time: string;
        temperature_2m: string;
        weathercode: string;
        precipitation_probability: string;
        cloud_cover: string;
    },
    hourly: {
        time: string[];
        temperature_2m: number[];
        weathercode: number[];
        precipitation_probability: number[];
        cloud_cover: number[];
    }
}