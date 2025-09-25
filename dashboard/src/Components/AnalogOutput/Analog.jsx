import React, { useState, useEffect } from "react";
import { AgGauge } from "ag-charts-react";
import "ag-charts-enterprise";

const Analog = () => {
  const [gauge1Value, setGauge1Value] = useState(3.5);
  const [gauge2Value, setGauge2Value] = useState(7.2);

  // Simulate changing values
  useEffect(() => {
    const interval = setInterval(() => {
      setGauge1Value(prev => {
        const newVal = prev + (Math.random() * 0.4 - 0.2);
        return Math.max(0, Math.min(10, newVal));
      });
      
      setGauge2Value(prev => {
        const newVal = prev + (Math.random() * 0.4 - 0.2);
        return Math.max(0, Math.min(10, newVal));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Configuration for the first gauge
  const gauge1Options = {
    type: "radial-gauge",
    value: gauge1Value,
    title: {
      text: "Channel 1",
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    subtitle: {
      text: "Volts",
      color: "#9ca3af",
      fontSize: 14,
    },
    scale: {
      min: 0,
      max: 10,
      tickCount: 11,
      tickLabelFontSize: 12,
      tickLabelColor: "#ffffff",
    },
    bar: {
      fills: [
        { color: "#06b6d4", stop: 2 }, // cyan
        { color: "#22c55e", stop: 4 }, // green
        { color: "#eab308", stop: 6 }, // yellow
        { color: "#f97316", stop: 8 }, // orange
        { color: "#ef4444" }, // red
      ],
      fillMode: "discrete",
      backgroundColor: "#1f2937",
    },
    needle: {
      color: "#f43f5e",
      length: 0.85,
    },
    valueLabel: {
      fontSize: 24,
      color: "white",
      fontWeight: "bold",
    },
    background: {
      fill: "#1f2937",
    },
  };

  // Configuration for the second gauge
  const gauge2Options = {
    type: "radial-gauge",
    value: gauge2Value,
    title: {
      text: "Channel 2",
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    subtitle: {
      text: "Volts",
      color: "#9ca3af",
      fontSize: 14,
    },
    scale: {
      min: 0,
      max: 10,
      tickCount: 11,
      tickLabelFontSize: 12,
      tickLabelColor: "white",
    },
    bar: {
      fills: [
        { color: "#8b5cf6", stop: 2 }, // purple
        { color: "#3b82f6", stop: 4 }, // blue
        { color: "#06b6d4", stop: 6 }, // cyan
        { color: "#ec4899", stop: 8 }, // pink
        { color: "#f43f5e" }, // rose
      ],
      fillMode: "discrete",
      backgroundColor: "#1f2937",
    },
    needle: {
      color: "#f43f5e",
      length: 0.85,
    },
    valueLabel: {
      fontSize: 24,
      color: "white",
      fontWeight: "bold",
    },
    background: {
      fill: "#1f2937",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <h1 className="text-4xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Voltage Monitoring System</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-full md:w-96 flex flex-col items-center">
          <AgGauge options={gauge1Options} className="w-full h-64" />
          <div className="mt-4 text-white text-center">
            <p className="text-gray-400 text-sm">Current Reading</p>
            <p className="text-2xl font-bold">{gauge1Value.toFixed(2)} V</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-full md:w-96 flex flex-col items-center">
          <AgGauge options={gauge2Options} className="w-full h-64" />
          <div className="mt-4 text-white text-center">
            <p className="text-gray-400 text-sm">Current Reading</p>
            <p className="text-2xl font-bold">{gauge2Value.toFixed(2)} V</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">System Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Channel 1</p>
            <p className="text-xl font-bold">{gauge1Value.toFixed(2)} V</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Channel 2</p>
            <p className="text-xl font-bold">{gauge2Value.toFixed(2)} V</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Average</p>
            <p className="text-xl font-bold">{((gauge1Value + gauge2Value) / 2).toFixed(2)} V</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Differential</p>
            <p className="text-xl font-bold">{Math.abs(gauge1Value - gauge2Value).toFixed(2)} V</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">System Status</span>
            <span className="px-2 py-1 bg-green-500 text-green-900 rounded-md text-sm font-medium">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analog;