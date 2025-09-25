import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Temperature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Mock data points array for demonstration
  const mockDataPoints = Array.from({ length: 30 }, (_, i) => ({
    timestamp: Date.now() - (29 - i) * 60000,
    temp1: 22 + Math.random() * 5,
    temp2: 48 + Math.random() * 10,
    temp3: 73 + Math.random() * 8,
    temp4: 35 + Math.random() * 7
  }));

  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        setError(null);
        // Using mock data for demonstration
        const result = {
          success: true,
          data: mockDataPoints
        };

        if (!result.success) {
          throw new Error("Failed to fetch temperature data");
        }

        setData(result.data);
        setRetryCount(0);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
        setError(error.message || 'Failed to fetch data');
        setRetryCount(prev => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
    const interval = setInterval(fetchTemperatureData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Enhanced color scheme for robotics theme
  const colors = {
    temp1: "#00E5FF", // Cyan
    temp2: "#FFD600", // Amber
    temp3: "#FF1744", // Red
    temp4: "#76FF03", // Light Green
    glow1: "rgba(0, 229, 255, 0.3)",
    glow2: "rgba(255, 214, 0, 0.3)",
    glow3: "rgba(255, 23, 68, 0.3)",
    glow4: "rgba(118, 255, 3, 0.3)",
    bgCard: "#0A192F", // Dark blue background
    highlight: "#64FFDA", // Teal highlight
    darkMetal: "#1E1E2F", // Dark metal
    lightMetal: "#373751", // Light metal
    text: "#FFFFFF" // White text
  };

  // Temperature range information for each sensor
  const tempRanges = [
    { name: "Sensor 1", min: 20, max: 30, unit: "°C", color: colors.temp1, glow: colors.glow1, description: "Ambient", icon: "M" },
    { name: "Sensor 2", min: 40, max: 60, unit: "°C", color: colors.temp2, glow: colors.glow2, description: "Motor", icon: "P" },
    { name: "Sensor 3", min: 70, max: 85, unit: "°C", color: colors.temp3, glow: colors.glow3, description: "Process", icon: "T" },
    { name: "Sensor 4", min: 30, max: 45, unit: "°C", color: colors.temp4, glow: colors.glow4, description: "Control", icon: "C" }
  ];

  // Current data for gauges
  const currentData = data.length > 0 ? data[data.length - 0] : null;

  // Generate data for robotic gauge charts
  const createGaugeData = (value, min, max) => {
    // Normalize value between min and max
    const normalized = Math.max(Math.min(value, max), min);
    const percentage = ((normalized - min) / (max - min)) * 100;
    
    // Create segments for a more detailed gauge
    const segments = 20;
    const result = [];
    
    for (let i = 0; i < segments; i++) {
      const segmentSize = 100 / segments;
      result.push({
        name: `segment-${i}`,
        value: segmentSize,
        active: i * segmentSize <= percentage
      });
    }
    
    return result;
  };
  
  // Calculate temperature status
  const getTempStatus = (value, min, max) => {
    if (!value) return "normal";
    const range = max - min;
    if (value < min + range * 0.33) return "normal";
    if (value < min + range * 0.66) return "warning";
    return "critical";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-200">
                Error Loading Data
              </h3>
              <div className="mt-2 text-sm text-red-200">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const noDataMessage = (!data || data.length === 0) && !loading && (
    <div className="text-center p-4 bg-yellow-900 border border-yellow-600 rounded">
      <p className="text-yellow-200">No temperature data available</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center bg-black bg-opacity-50 p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            Temperature Monitoring Dashboard
          </h1>
          <div className="px-4 py-2 bg-blue-900 rounded-lg text-blue-200 font-medium flex items-center shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            Real-time Data
          </div>
        </div>

        {noDataMessage}

        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {tempRanges.map((sensor, idx) => {
              const currentValue = currentData ? currentData[`temp${idx+1}`] : 0;
              const gaugeData = createGaugeData(currentValue, sensor.min, sensor.max);
              const status = getTempStatus(currentValue, sensor.min, sensor.max);
              
              // Calculate percentage for visual display
              const percentage = currentValue ? 
                Math.min(100, Math.max(0, ((currentValue - sensor.min) / (sensor.max - sensor.min)) * 100)) : 0;
              
              // Status colors
              const statusColors = {
                normal: "green",
                warning: "yellow",
                critical: "red"
              };
              
              return (
                <div key={`sensor-${idx}`} 
                     className="rounded-lg overflow-hidden border-2 transform transition-all duration-300 hover:scale-105"
                     style={{
                       background: 'linear-gradient(145deg, #0A192F 0%, #0d1423 100%)',
                       borderColor: sensor.color,
                       boxShadow: `0 0 15px ${sensor.glow}`
                     }}>
                  {/* Header with hexagonal design */}
                  <div className="p-3 border-b border-gray-800 flex justify-between items-center" 
                       style={{ background: 'linear-gradient(90deg, rgba(10,25,47,0.9) 0%, rgba(17,34,64,0.9) 100%)' }}>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-md" 
                           style={{ background: `linear-gradient(135deg, ${sensor.color}22, ${sensor.color}44)`, 
                                   border: `1px solid ${sensor.color}` }}>
                        <span style={{ color: sensor.color }} className="font-bold">{sensor.icon}</span>
                      </div>
                      <h2 className="font-semibold" style={{ color: sensor.color }}>
                        {sensor.name}
                      </h2>
                    </div>
                    <div className="text-xs text-gray-400 bg-black bg-opacity-40 px-2 py-1 rounded">{sensor.description}</div>
                  </div>
                  
                  {/* Robotics-style gauge */}
                  <div className="p-2 flex flex-col items-center justify-center">
                    <div className="h-48 w-48 relative mb-2">
                      {/* Outer ring with tech pattern */}
                      <div className="absolute inset-0 rounded-full border-4 border-gray-800 bg-black bg-opacity-60"></div>
                      
                      {/* Rotating light effect */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="w-full h-full animate-spin-slow" 
                             style={{ 
                               background: `conic-gradient(from 0deg, transparent, ${sensor.color}33, transparent, transparent)`,
                               animationDuration: '10s'
                             }}>
                        </div>
                      </div>
                      
                      {/* Main gauge meter */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ResponsiveContainer width="150%" height="150%">
                          <PieChart>
                            {/* Background track */}
                            <Pie
                              data={[{ value: 100 }]}
                              cx="50%"
                              cy="50%"
                              startAngle={220}
                              endAngle={-40}
                              innerRadius="65%"
                              outerRadius="100%"
                              dataKey="value"
                            >
                              <Cell fill="#1E293B" />
                            </Pie>
                            
                            {/* Active gauge segments */}
                            <Pie
                              data={gaugeData}
                              cx="50%"
                              cy="50%"
                              startAngle={220}
                              endAngle={-40}
                              innerRadius="65%"
                              outerRadius="90%"
                              dataKey="value"
                              stroke="none"
                            >
                              {gaugeData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.active ? sensor.color : 'transparent'}
                                  opacity={entry.active ? (0.5 + (index / gaugeData.length) * 0.5) : 0.1}
                                />
                              ))}
                            </Pie>
                            
                            {/* Center point */}
                            <Pie
                              data={[{ value: 100 }]}
                              cx="50%"
                              cy="50%"
                              outerRadius="60%"
                              dataKey="value"
                            >
                              <Cell fill="#0F172A" stroke={sensor.color} strokeWidth={2} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Digital display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="bg-black bg-opacity-70 px-2  rounded-lg border" 
                               style={{ borderColor: sensor.color }}>
                            <span className="text-sm font-bold" style={{ color: sensor.color }}>
                              {currentValue ? currentValue.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-sm" style={{ color: sensor.color }}>{sensor.unit}</span>
                          </div>
                          
                          {/* Status indicator */}
                          <div className="mt-1 flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 animate-pulse`}
                                 style={{ backgroundColor: statusColors[status] }}></div>
                            <span className="text-xs text-gray-400">
                              {status === "normal" ? "NORMAL" : status === "warning" ? "WARNING" : "CRITICAL"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Robotic scale indicator */}
                    <div className="w-full px-4 mt-2">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                             style={{ 
                               width: `${percentage}%`, 
                               background: `linear-gradient(90deg, ${sensor.color}88, ${sensor.color})`,
                               boxShadow: `0 0 10px ${sensor.color}`
                             }}>
                        </div>
                      </div>
                      <div className="flex justify-between w-full text-xs mt-1">
                        <span className="text-gray-500">{sensor.min}{sensor.unit}</span>
                        <span className="text-gray-500">{sensor.max}{sensor.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-xl border border-blue-800">
              <div className="flex flex-col items-center">
                <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-lg font-medium text-blue-400">Loading temperature data...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Temperature;