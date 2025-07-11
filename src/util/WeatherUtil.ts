import { invalidate } from "@react-three/fiber";
import { COLOR_DESCRIPTIONS } from "../types/IColorDescription";
import { STATUS_HANDLERS } from "../types/IStatusHandler";
import { IWeatherForecast } from "../types/IWeatherForecast";
import { ObjectUtil } from "./ObjectUtil";
import { PolygonUtil } from "./PolygonUtil";
import { JsonLoader } from "./JsonLoader";
import { IOpenMeteoResponse } from "../types/IOpenMeteoResponse";
import { LocalStorageUtil } from "./LocalStorageUtil";
import { TimeUtil } from "./TimeUtil";

/**
 * alternative: https://api.open-meteo.com/v1/forecast?timezone=Europe/Berlin&latitude=48.21&longitude=16.45&hourly=temperature_2m,weathercode,precipitation_probability,cloud_cover&daily=sunrise,sunset&forecast_days=1
 * weather font: https://github.com/erikflowers/weather-icons
 *
 * https://open-meteo.com/en/docs?hourly=temperature_2m,weather_code,cloud_cover&forecast_days=1
 *
 * F00D,  0 Clear sky
 * F00C   1 Mainly clear
 * F002,  2 partly cloudy
 * F013,  3 overcast
 * F021, 45 Fog
 * F063, 48 depositing rime fog
 * F017, 51, Drizzle: Light,
 * F01A, 53, 55	Drizzle: moderate, and dense intensity
 * F019, 56, 57	Freezing Drizzle: Light and dense intensity
 * F015, 61, Rain: Slight,
 * F019, 63, 65	Rain: moderate and heavy intensity
 * ?, 66, 67	Freezing Rain: Light and heavy intensity
 * F01B, 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
 * ? 77	Snow grains
 * F015, 80, 81, 82	Rain showers: Slight, moderate, and violent
 * 85, 86	Snow showers slight and heavy
 * F016, 95   Thunderstorm: Slight or moderate
 * F01D, 96, 99 *	Thunderstorm with slight and heavy hail
 *
 */

export class WeatherUtil {

    static FORECASTS: IWeatherForecast[] = [];
    static SYMBOLS_LAST: string[] = [];

    static getSymbols(forecast: IWeatherForecast): string[] {

        if (forecast.weathercode === 0) {
            return [
                './w_sun_00.svg' // clear sky
            ];
        } else if (forecast.weathercode === 1) {
            return [
                './w_cloudy_01.svg' // mainly clear, TODO :: with moon
            ];
        }

        const symbols = [];
        if (forecast.cloudcover < 0.75) {
            if (forecast.weathercode > 3) { // some kind of precipitation symbol needed
                symbols.push('./w_cloud_sun_open.svg');
            } else {
                symbols.push('./w_cloud_sun_closed.svg');
            }
        } else {
            if (forecast.weathercode > 3) { // some kind of precipitation symbol needed
                symbols.push('./w_cloud_open.svg');
            } else {
                symbols.push('./w_cloud_closed.svg');
            }
        }

        if (forecast.weathercode === 61 || forecast.weathercode === 80) {
            symbols.push('./w_rain_light.svg')
        } else if (forecast.weathercode === 95) {
            symbols.push('./w_thunderstorm.svg')
        } else if (forecast.weathercode === 96) {
            symbols.push('./w_thunderstorm_hail.svg')
        }



        return symbols;

    }

    static async renderForecast(forecast: IWeatherForecast): Promise<void> {

        const symbols = WeatherUtil.getSymbols(forecast);
        if (!ObjectUtil.arrayEquals(this.SYMBOLS_LAST, symbols)) {
            this.SYMBOLS_LAST = symbols;
            PolygonUtil.clearChildren(STATUS_HANDLERS['weather___'].texts[1]);
            for (let i = 0; i < symbols.length; i++) {
                await PolygonUtil.createSymbolMesh(symbols[i], STATUS_HANDLERS['weather___'].texts[1], COLOR_DESCRIPTIONS['face_gray___clip_none']);
            }
            // console.log('done creating weather symbols');
            invalidate();
            // requestAnimationFrame(() => {
            //     invalidate();
            // });
        }


    }

    static getForecast(instant: number): IWeatherForecast {

        let forecastA: IWeatherForecast | undefined;
        let forecastB: IWeatherForecast | undefined;

        for (let i = 1; i < this.FORECASTS.length; i++) {
            if (this.FORECASTS[i].instant > instant) {
                forecastA = this.FORECASTS[i - 1];
                forecastB = this.FORECASTS[i];
                break;
            }
        }

        if (forecastA && forecastB) {
            const fraction = (instant - forecastA.instant) / (forecastB.instant - forecastA.instant);
            const weathercode = fraction < 0.5 ? forecastA.weathercode : forecastB.weathercode;
            return {
                instant,
                weathercode,
                precipitation: forecastA.precipitation + (forecastB.precipitation - forecastA.precipitation) * fraction,
                cloudcover: forecastA.cloudcover + (forecastB.cloudcover - forecastA.cloudcover) * fraction,
                temperature: forecastA.temperature + (forecastB.temperature - forecastA.temperature) * fraction
            }
        } else {
            return {
                instant,
                weathercode: -1,
                precipitation: -1,
                cloudcover: -1,
                temperature: -1
            }
        }


    }

    static async loadForecast(): Promise<void> {

        // console.log('iso', new Date().toISOString());

        // let loader = new JsonLoader('https://api.open-meteo.com/v1/forecast', 'GET');
        // loader = loader.withParameter('timezone', 'Europe/Berlin');
        // loader = loader.withParameter('latitude', '48.21');
        // loader = loader.withParameter('longitude', '16.45');
        // loader = loader.withParameter('hourly', 'temperature_2m,weathercode,precipitation_probability,cloud_cover');
        // loader = loader.withParameter('forecast_days', '1');

        // const openMeteoResponse: never = await loader.load() as never;
        // console.log('openMeteoResponse', openMeteoResponse);
        let openMeteoResponse: IOpenMeteoResponse | undefined = LocalStorageUtil.load('SK_FORECAST', TimeUtil.MILLISECONDS_PER_HOUR);
        if (!openMeteoResponse) {

            let loader = new JsonLoader('https://api.open-meteo.com/v1/forecast', 'GET');
            loader = loader.withParameter('timezone', 'Europe/Berlin');
            loader = loader.withParameter('latitude', '48.21');
            loader = loader.withParameter('longitude', '16.45');
            loader = loader.withParameter('hourly', 'temperature_2m,weathercode,precipitation_probability,cloud_cover');
            loader = loader.withParameter('forecast_days', '1');
            openMeteoResponse = await loader.load();

            LocalStorageUtil.store('SK_FORECAST', openMeteoResponse);

        }

        const instants: number[] = (openMeteoResponse!.hourly.time).map(d => Date.parse(d));
        const temperatures: number[] = openMeteoResponse!.hourly.temperature_2m;
        const precipitations: number[] = openMeteoResponse!.hourly.precipitation_probability;
        const weathercodes: number[] = openMeteoResponse!.hourly.weathercode;
        const cloudcovers: number[] = openMeteoResponse!.hourly.cloud_cover;

        for (let i = 0; i < instants.length; i++) {
            WeatherUtil.FORECASTS.push({
                instant: instants[i],
                precipitation: precipitations[i],
                weathercode: weathercodes[i],
                temperature: temperatures[i],
                cloudcover: cloudcovers[i] / 100 // to range 0-1
            });
        }

        // console.log(instants, instants.map(i => new Date(i)));

        // let loader = new JsonLoader('https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/ensemble-v1-1h-2500m', 'GET');
        // loader = loader.withParameter("parameters", "rain_p90,sundur_p90,t2m_p90");
        // loader = loader.withParameter("lat_lon", "48.22,16.50"); //closest grid point, close to "opel-werk");
        // loader = loader.withParameter("start", `${new Date().toISOString().substring(0, 10)}T00:01:00.000`);
        // loader = loader.withParameter("end", `${new Date(Date.now() + TimeUtil.MILLISECONDS_PER__DAY).toISOString().substring(0, 10)}T00:00:00.000Z`);

        // const geosphereResponse: never = await loader.load() as never;
        // const instants: number[] = (geosphereResponse['timestamps'] as string[]).map(d => Date.parse(d));
        // const precipitations: number[] = geosphereResponse['features'][0]['properties']['parameters']['rain_p90']['data'] as number[];
        // const sunshines: number[] = (geosphereResponse['features'][0]['properties']['parameters']['sundur_p90']['data'] as number[]).map(s => s / 3600);
        // const temperatures: number[] = geosphereResponse['features'][0]['properties']['parameters']['t2m_p90']['data'] as number[];

        // const instants = [
        //     1750208400000,
        //     1750212000000,
        //     1750215600000,
        //     1750219200000,
        //     1750222800000,
        //     1750226400000,
        //     1750230000000,
        //     1750233600000,
        //     1750237200000,
        //     1750240800000,
        //     1750244400000,
        //     1750248000000,
        //     1750251600000,
        //     1750255200000,
        //     1750258800000,
        //     1750262400000,
        //     1750266000000,
        //     1750269600000,
        //     1750273200000,
        //     1750276800000,
        //     1750280400000,
        //     1750284000000,
        //     1750287600000,
        //     1750291200000
        // ];
        // const precipitations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // const sunshines = [0, 0, 0, 0, 0.7652777777777777, 0.8616111111111112, 0.9289444444444444, 0.92475, 0.8469722222222222, 0.8116388888888889, 0.7970555555555556, 0.852111111111111, 0.8657499999999999, 0.9193888888888889, 0.9444444444444444, 0.9791666666666666, 0.9987777777777778, 0.9996666666666667, 0.25, 0.0002777777777777778, 0, 0, 0, 0];
        // const temperatures = [16.6, 16.4, 16.2, 16.2, 16.6, 17.9, 19.6, 20.6, 21.6, 22.9, 24, 24.8, 25.3, 25.8, 25.8, 25.4, 24.8, 24, 23, 21.8, 20.4, 19.5, 18.5, 17];

        // [1750248000000, 1750251600000, 1750255200000, 1750258800000, 1750262400000, 1750266000000, 1750269600000, 1750273200000, 1750276800000, 1750280400000, 1750284000000, 1750287600000, 1750291200000]
        // [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        // [0, 0.9821666666666667, 0.9636666666666667, 0.9549166666666666, 0.9749166666666667, 0.9640000000000001, 0.9619444444444445, 0.24483333333333332, 0, 0, 0, 0, 0]
        // [27.9, 28.6, 29.1, 29.3, 29, 28.7, 28, 26.6, 25.1, 23.9, 22.5, 21.1, 19.6]

        // console.log('instants', instants);
        // console.log('precipitations', precipitations);
        // console.log('instsunshinesants', sunshines);
        // console.log('temperatures', temperatures);
        // // console.log(instants.map(i => new Date(i).toLocaleTimeString()), sunshines)

        // for (let i = 0; i < instants.length; i++) {
        //     WeatherUtil.FORECASTS.push({
        //         instant: instants[i],
        //         precipitation: precipitations[i],
        //         sunshine: sunshines[i],
        //         temperature: temperatures[i]
        //     });
        // }

        // https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/ensemble-v1-1h-2500m?parameters=rain_p90,sundur_p90,t2m_p90&lat_lon=48.22,16.50&start=2025-06-16T00:01:00.000Z&end=2025-06-17T00:00:00.000Z


    }


}