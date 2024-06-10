export interface IInfluxDbResponses {
  results: IInfluxDbResponse[];
}

export interface IInfluxDbResponse {
  statement_id: number;
  series: IInfluxDbSeries[];
}

export interface IInfluxDbSeries {
  name: string;
  columns: string[];
  values: unknown[][];
}
