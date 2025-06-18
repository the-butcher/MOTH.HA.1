export interface IWeatherForecast {
    instant: number;
    /**
     * rain in mm/hour
     */
    precipitation: number;
    /**
     * sunhine in 1/hour
     */
    sunshine: number;
    /**
     * temperature in degrees celsius
     */
    temperature: number;
}