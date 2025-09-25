import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VibrationTimeDomain = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s

  const validateJSONResponse = (text) => {
    try {
      const result = JSON.parse(text);
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      return result;
    } catch (e) {
      console.error('JSON validation error:', e);
      throw new Error('JSON parsing failed');
    }
  };

  const validateDataStructure = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;

    // Check if at least one channel exists and timestamp is present
    const channels = ['V1', 'V2', 'V3'];
    return channels.some(field => field in data[0]) && 'timestamp' in data[0];
  };

  useEffect(() => {
    const fetchWithBackoff = async () => {
      try {
        setError(null);
        const response = await fetch('https://cmti-edge.online/SpindleVibration/SpindleFFT.php', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const result = validateJSONResponse(text);

        if (!result.success) {
          throw new Error(result.error || 'Server returned an error');
        }

        if (!validateDataStructure(result.data)) {
          throw new Error('Invalid data structure received');
        }

        setData(result.data);
        setRetryCount(0);
      } catch (error) {
        console.error('Error details:', error);
        setError(error.message || 'Failed to fetch data');
        setData([]);
        setRetryCount(prev => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    fetchWithBackoff();
    const interval = setInterval(fetchWithBackoff, backoffTime);
    return () => clearInterval(interval);
  }, [backoffTime]);

  const prepareVibrationData = (rawData, channel) => {
    if (!Array.isArray(rawData) || !rawData.length) return [];
    
    return rawData[0]?.[channel]?.map((value, index) => ({
      index,
      value: value  // Raw value without Math.abs()
    })) || [];
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
      <p className="text-yellow-200">No data available</p>
    </div>
  );

  // Enhanced color scheme for the black theme
  const colors = {
    channel1: "#00E5FF", // Bright Cyan
    channel2: "#FF00FF", // Bright Magenta
    channel3: "#EEFF41", // Lime Yellow
    accent: "#7B1FA2",   // Purple accent
    text: "#FFFFFF",     // White text
    textSecondary: "#BBBBBB", // Light gray
    cardBg: "#121212",   // Very dark gray cards
    gridLines: "#333333" // Dark grid lines
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center bg-black">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            Spindle Vibration Analysis
          </h1>
          <div className="px-4 py-2 bg-purple-900 rounded-lg text-purple-200 font-medium flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            Real-time Monitoring
          </div>
        </div>

        {noDataMessage}

        {data.length > 0 && (
          <>
            <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-purple-900 mb-6">
              <div className="p-4 border-b border-purple-900 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-400">
                  Combined Time Domain Vibration Data
                </h2>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="p-4 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis 
                      dataKey="index" 
                      label={{ value: 'Sample', position: 'bottom', fill: '#BBBBBB' }} 
                      tick={{ fill: '#BBBBBB' }}
                      stroke="#444444"
                    />
                    <YAxis 
                      label={{ value: 'Amplitude (m/s²)', angle: -90, position: 'insideLeft', fill: '#BBBBBB' }} 
                      domain={['auto', 'auto']} 
                      tick={{ fill: '#BBBBBB' }}
                      stroke="#444444"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: '#444444', color: '#FFFFFF' }} 
                      itemStyle={{ color: '#FFFFFF' }}
                      labelStyle={{ color: '#BBBBBB' }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#FFFFFF' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      data={prepareVibrationData(data, 'V1')} 
                      dataKey="value" 
                      stroke={colors.channel1} 
                      strokeWidth={2}
                      dot={false} 
                      name="Channel 1" 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      data={prepareVibrationData(data, 'V2')} 
                      dataKey="value" 
                      stroke={colors.channel2}
                      strokeWidth={2} 
                      dot={false} 
                      name="Channel 2" 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      data={prepareVibrationData(data, 'V3')} 
                      dataKey="value" 
                      stroke={colors.channel3}
                      strokeWidth={2} 
                      dot={false} 
                      name="Channel 3" 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Channel 1", key: "V1", color: colors.channel1 },
                { name: "Channel 2", key: "V2", color: colors.channel2 },
                { name: "Channel 3", key: "V3", color: colors.channel3 }
              ].map((channel) => (
                <div key={channel.key} className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800 hover:border-purple-900 transition-all duration-300">
                  <div className="p-3 border-b border-gray-800 flex justify-between items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <h2 className="font-semibold" style={{ color: channel.color }}>
                      {channel.name} ({channel.key})
                    </h2>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: channel.color }}></div>
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  </div>
                  <div className="p-3 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareVibrationData(data, channel.key)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                        <XAxis 
                          dataKey="index" 
                          tick={{ fill: '#888888', fontSize: 10 }}
                          stroke="#333333"
                          tickSize={2}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fill: '#888888', fontSize: 10 }}
                          stroke="#333333"
                          tickSize={2}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', borderColor: '#333333', color: '#FFFFFF', fontSize: 12 }} 
                          labelFormatter={(value) => `Sample: ${value}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={channel.color} 
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={true}
                          animationDuration={300}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-xl border border-purple-800">
              <div className="flex flex-col items-center">
                <div className="animate-spin w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-lg font-medium text-purple-400">Loading vibration data...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibrationTimeDomain;