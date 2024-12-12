// src/app/_services/influxdb.js

import { InfluxDB } from '@influxdata/influxdb-client';

const url = process.env.NEXT_PUBLIC_INFLUXDB_URL;
const token = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN;
const org = process.env.NEXT_PUBLIC_INFLUXDB_ORG;
const bucket = process.env.NEXT_PUBLIC_INFLUXDB_BUCKET;
const influxDB = new InfluxDB({ url, token });

export const queryData = async (device, start = '-1h') => {
  const queryApi = influxDB.getQueryApi(org);
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${start})
      |> filter(fn: (r) => r._measurement == "Measurements")
      |> filter(fn: (r) => r.device == "${device}")
      |> filter(fn: (r) => r._field == "Current" or r._field == "Power" or r._field == "Voltage")
      |> filter(fn: (r) => exists r._value)
      |> yield(name: "filtered_data")
  `;

  const data = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const rowObject = tableMeta.toObject(row);
        data.push(rowObject);
      },
      error(error) {
        console.error('Query error', error);
        reject(error);
      },
      complete() {
        resolve(data);
      },
    });
  });
};
