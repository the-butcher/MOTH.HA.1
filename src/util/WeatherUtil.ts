import { IWeatherForecast } from "./IWeatherForecast";
import { JsonLoader } from "./JsonLoader";
import { TimeUtil } from "./TimeUtil";

export class WeatherUtil {

    static FORECASTS: IWeatherForecast[] = [];

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
            return {
                instant,
                precipitation: forecastA.precipitation + (forecastB.precipitation - forecastA.precipitation) * fraction,
                sunshine: forecastA.sunshine + (forecastB.sunshine - forecastA.sunshine) * fraction,
                temperature: forecastA.temperature + (forecastB.temperature - forecastA.temperature) * fraction
            }
        } else {
            return {
                instant,
                precipitation: -1,
                sunshine: -1,
                temperature: -1
            }
        }


    }

    static async loadForecast(): Promise<void> {

        // console.log('iso', new Date().toISOString());

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

        const instants = [
            1750208400000,
            1750212000000,
            1750215600000,
            1750219200000,
            1750222800000,
            1750226400000,
            1750230000000,
            1750233600000,
            1750237200000,
            1750240800000,
            1750244400000,
            1750248000000,
            1750251600000,
            1750255200000,
            1750258800000,
            1750262400000,
            1750266000000,
            1750269600000,
            1750273200000,
            1750276800000,
            1750280400000,
            1750284000000,
            1750287600000,
            1750291200000
        ];
        const precipitations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const sunshines = [0, 0, 0, 0, 0.7652777777777777, 0.8616111111111112, 0.9289444444444444, 0.92475, 0.8469722222222222, 0.8116388888888889, 0.7970555555555556, 0.852111111111111, 0.8657499999999999, 0.9193888888888889, 0.9444444444444444, 0.9791666666666666, 0.9987777777777778, 0.9996666666666667, 0.25, 0.0002777777777777778, 0, 0, 0, 0];
        const temperatures = [16.6, 16.4, 16.2, 16.2, 16.6, 17.9, 19.6, 20.6, 21.6, 22.9, 24, 24.8, 25.3, 25.8, 25.8, 25.4, 24.8, 24, 23, 21.8, 20.4, 19.5, 18.5, 17];

        // console.log('instants', instants);
        // console.log(instants.map(i => new Date(i).toLocaleTimeString()), sunshines)

        for (let i = 0; i < instants.length; i++) {
            WeatherUtil.FORECASTS.push({
                instant: instants[i],
                precipitation: precipitations[i],
                sunshine: sunshines[i],
                temperature: temperatures[i]
            });
        }

        // https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/ensemble-v1-1h-2500m?parameters=rain_p90,sundur_p90,t2m_p90&lat_lon=48.22,16.50&start=2025-06-16T00:01:00.000Z&end=2025-06-17T00:00:00.000Z


    }


}