"use client";
// src/app/device/[deviceName]/page.js

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TableComponent from '@/app/_components/TableComponent';
import Navbar from '@/app/_components/Navbar';
import Graphs from '@/app/_components/Graphs';
import CostComponent from '@/app/_components/CostComponent';
import { queryData } from '@/app/_services/influxdb';

const formatDeviceName = (deviceName) => {
  return deviceName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const costPower = {
  'lightbulb': 0.07,
  'table_fan': 0.7,
  'hair_dryer': 8.04,
  'induction_stove': 8.9,
  'iron_box': 4.07,
  'kettle': 6.3
};

// Device name mapping for InfluxDB
const deviceNameMapping = {
  'lightbulb': 'light_bulb',
  'kettle': 'KETTLE',
  'induction_stove': 'INDUCTION_STOVE',
  'table_fan': 'Table_Fan',
  'hair_dryer': 'hair_dryer',
  'iron_box': 'ironbox_final'
};

// Calculate time difference in hours
const timeDifference = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const difference = Math.abs(endTime - startTime);
  return difference / (1000 * 60 * 60); // Convert milliseconds to hours
};

const DevicePage = () => {
  const { deviceName } = useParams();
  const router = useRouter();
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleInsightsClick = () => {
    router.push(`/device/${deviceName}/insights`);
  };

  // Polling for live data if the device requires it
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get the InfluxDB device name using the mapper
        const influxDeviceName = deviceNameMapping[deviceName.toLowerCase()];

        // Fetch live data from InfluxDB
        const fetchLiveData = async () => {
          try {
            const rawData = await queryData(influxDeviceName, '-7d'); // Query last 7 days for consistency

            // Transform InfluxDB data to group by timestamp
            const transformedData = [];
            rawData.forEach(entry => {
              const existing = transformedData.find(item => item.Time === entry._time);
              if (existing) {
                existing[entry._field] = entry._value;
              } else {
                transformedData.push({
                  Time: entry._time, // Directly use `_time` as a string
                  [entry._field]: entry._value,
                });
              }
            });

            setCsvData(transformedData);
          } catch (err) {
            console.error("Error fetching InfluxDB data:", err);
            setError(err.message);
          }
        };

        // Initial fetch and setup polling interval
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval); // Clear interval on unmount
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (deviceName) fetchData();
  }, [deviceName]);

  // Calculate duration for CostComponent
  const duration = csvData.length > 1
    ? timeDifference(csvData[0].Time, csvData[csvData.length - 1].Time)
    : 0;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {formatDeviceName(deviceName)}
          </h1>
          <p className="text-gray-600">Real-time monitoring and analytics for your device</p>
        </div>

        <div className="flex justify-center mb-4">
          <button
            onClick={handleInsightsClick}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            View Insights
          </button>
        </div>

        {error ? (
          <div className="p-8 bg-red-50 rounded-2xl text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-100/20">
              <Graphs graphData={csvData} />
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-100/20">
              <CostComponent 
                power={costPower[deviceName]} 
                duration={duration}
              />
              <TableComponent data={csvData} />
            </div>
            
          </>
        )}
      </div>
    </div>
  );
};

export default DevicePage;
