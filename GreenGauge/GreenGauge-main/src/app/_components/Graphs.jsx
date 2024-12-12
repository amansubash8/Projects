import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-moment';
import { Zap, Battery, Activity } from "lucide-react";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graphs = ({ graphData, deviceType }) => {
  const [timePeriod, setTimePeriod] = useState('hour');
  const [displayMetrics, setDisplayMetrics] = useState({
    Current: true,
    Voltage: true,
    Power: true
  });

  // Ensure all dates are properly parsed
  const processData = (data) => {
    return data.map(row => ({
      ...row,
      Time: new Date(row.Time), // Ensure Time is a Date object
      Current: Number(row.Current) || 0,
      Voltage: Number(row.Voltage) || 0,
      Power: Number(row.Power) || 0
    })).filter(row => !isNaN(row.Time.getTime())); // Filter out invalid dates
  };

  const filterDataByTimePeriod = (data, period) => {
    const now = new Date();
    const processedData = processData(data);
    
    return processedData.filter(row => {
      const timeDiff = now - row.Time;
      switch (period) {
        case 'hour':
          return timeDiff <= 3600000;
        case 'day':
          return timeDiff <= 86400000;
        case 'week':
          return timeDiff <= 604800000;
        default:
          return true;
      }
    });
  };

  const filteredData = filterDataByTimePeriod(graphData, timePeriod);
  const latestData = filteredData[filteredData.length - 1] || {};

  const chartData = {
    labels: filteredData.map(row => row.Time),
    datasets: [
      ...(displayMetrics.Current ? [{
        label: 'Current (A)',
        data: filteredData.map(row => row.Current),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius:  0, // Show points only for lightbulb
      }] : []),
      ...(displayMetrics.Voltage ? [{
        label: 'Voltage (V)',
        data: filteredData.map(row => row.Voltage),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius:  0,
      }] : []),
      ...(displayMetrics.Power ? [{
        label: 'Power (W)',
        data: filteredData.map(row => row.Power),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius:  0,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          }
        },
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timePeriod === 'hour' ? 'minute' : timePeriod === 'day' ? 'hour' : 'day',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'MMM D, HH:mm',
            day: 'MMM D'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const MetricCard = ({ title, value, unit, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold">
            {typeof value === 'number' ? value.toFixed(2) : '0.00'} {unit}
          </p>
        </div>
      </div>
    </div>
  );

  const timeButtons = [
    { value: 'hour', label: 'Last Hour' },
    { value: 'day', label: 'Last Day' },
    { value: 'week', label: 'Last Week' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Energy Consumption</h2>
          {filteredData.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No data available for selected time period</p>
          )}
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard 
              title="Current" 
              value={latestData.Current} 
              unit="A" 
              icon={<Zap className="w-5 h-5 text-green-500" />}
              color="#22c55e"
            />
            <MetricCard 
              title="Voltage" 
              value={latestData.Voltage} 
              unit="V" 
              icon={<Battery className="w-5 h-5 text-red-500" />}
              color="#ef4444"
            />
            <MetricCard 
              title="Power" 
              value={latestData.Power} 
              unit="W" 
              icon={<Activity className="w-5 h-5 text-blue-500" />}
              color="#3b82f6"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                {timeButtons.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTimePeriod(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${timePeriod === value 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                {Object.entries(displayMetrics).map(([metric, isDisplayed]) => (
                  <button
                    key={metric}
                    onClick={() => setDisplayMetrics(prev => ({...prev, [metric]: !prev[metric]}))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isDisplayed 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              {filteredData.length > 0 ? (
                <Line data={chartData} options={options} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected time period
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graphs;