import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import VibrationSeverityAssessment from './VibrationSeverityAssessment';

const VibrationAnalysisDashboard = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pythonResponse, setPythonResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Internal loading state (not displayed to user)
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Modern color palette
  const colors = {
    background: "#0f172a", // Slate 900
    cardBg: "#1e293b",     // Slate 800
    accent: "#3b82f6",     // Blue 500
    accentLight: "#60a5fa", // Blue 400
    accentDark: "#1d4ed8",  // Blue 700
    channel1: "#22d3ee",   // Cyan 400
    channel2: "#a855f7",   // Purple 500
    channel3: "#eab308",   // Yellow 500
    text: "#f8fafc",       // Slate 50
    textSecondary: "#94a3b8", // Slate 400
    border: "#334155",     // Slate 700
    gridLines: "#1e293b",  // Slate 800
    success: "#10b981",    // Emerald 500
    error: "#ef4444"       // Red 500
  };

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      // Don't fetch if already loading
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;

      try {
        const response = await fetch('https://cmti-edge.online/intelipod/VibrationData.php', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const text = await response.text();
        let result;

        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid data format received');
        }

        if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
          throw new Error(result.error || 'Invalid or empty data received');
        }

        setData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        isLoadingRef.current = false;
      }
    };

    fetchData();

    if (autoRefresh) {
      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      intervalId = setInterval(() => {
        if (!isLoadingRef.current) {
          fetchData();
        }
      }, 5000);
    }

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoRefresh]);


  // 1. Add data sampling for large datasets
  const sampleData = (data, maxPoints = 2000) => {
    if (!data || data.length <= maxPoints) return data;

    const result = [];
    const step = Math.ceil(data.length / maxPoints);

    for (let i = 0; i < data.length; i += step) {
      result.push(data[i]);
    }

    return result;
  };

  // 2. Optimize prepareChannelData function to handle large datasets
  const prepareChannelData = (rawData, channel) => {
    if (!Array.isArray(rawData) || !rawData.length || !rawData[0]?.[channel]) {
      return [];
    }

    const channelData = rawData[0][channel];
    // Sample data if it's too large
    const sampledData = sampleData(channelData);

    return sampledData.map((value, index) => ({
      index,
      value
    }));
  };

  // Prepare combined data for all channels in one dataset
  const prepareCombinedData = () => {
    if (!Array.isArray(data) || !data.length) return [];

    const channelData = {
      V1: data[0]?.V1 ? sampleData(data[0].V1) : [],
      V2: data[0]?.V2 ? sampleData(data[0].V2) : [],
      V3: data[0]?.V3 ? sampleData(data[0].V3) : []
    };

    const maxLength = Math.max(
      channelData.V1.length,
      channelData.V2.length,
      channelData.V3.length
    );

    const combinedData = [];

    // Process in chunks to avoid UI freezing
    const chunkSize = 100;
    for (let i = 0; i < maxLength; i += chunkSize) {
      const endIdx = Math.min(i + chunkSize, maxLength);

      for (let j = i; j < endIdx; j++) {
        combinedData.push({
          index: j,
          V1: channelData.V1[j] !== undefined ? channelData.V1[j] : null,
          V2: channelData.V2[j] !== undefined ? channelData.V2[j] : null,
          V3: channelData.V3[j] !== undefined ? channelData.V3[j] : null
        });
      }
    }

    return combinedData;
  };


  // 4. Add a custom useMemo hook to memoize expensive calculations
  // Add this at the top level of your component
  const memoizedCombinedData = useMemo(() => prepareCombinedData(), [data]);
  const memoizedChannel1Data = useMemo(() => prepareChannelData(data, 'V1'), [data]);
  const memoizedChannel2Data = useMemo(() => prepareChannelData(data, 'V2'), [data]);
  const memoizedChannel3Data = useMemo(() => prepareChannelData(data, 'V3'), [data]);

  // 5. Optimize the fetch function to prevent memory leaks
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchData = async () => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;

      try {
        const response = await fetch('https://cmti-edge.online/intelipod/VibrationData.php', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const text = await response.text();
        let result;

        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid data format received');
        }

        if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
          throw new Error(result.error || 'Invalid or empty data received');
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setData(result.data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        isLoadingRef.current = false;
      }
    };

    fetchData();

    if (autoRefresh) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      intervalId = setInterval(() => {
        if (!isLoadingRef.current && isMounted) {
          fetchData();
        }
      }, 5000);
    }

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoRefresh]);

  // 6. Use React.memo to optimize the rendering of the VibrationSeverityAssessment component
  // This should be added where you define the component
  // const MemoizedVibrationSeverityAssessment = React.memo(VibrationSeverityAssessment);

  // Vibration Severity Assessment component
  // Optimized Vibration Severity Assessment component with performance improvements


  // 7. Update the renderChannelCharts function to use memoized data
  const renderChannelCharts = () => {
    if (!data.length) return null;

    // Use channel data based on selection
    const getChannelData = (channel) => {
      switch (channel) {
        case 'V1': return memoizedChannel1Data;
        case 'V2': return memoizedChannel2Data;
        case 'V3': return memoizedChannel3Data;
        default: return [];
      }
    };

    const channels = selectedChannel === 'all'
      ? [
        { key: 'V1', name: 'Channel 1', color: colors.channel1 },
        { key: 'V2', name: 'Channel 2', color: colors.channel2 },
        { key: 'V3', name: 'Channel 3', color: colors.channel3 }
      ]
      : [{
        key: `V${selectedChannel}`,
        name: `Channel ${selectedChannel}`,
        color: colors[`channel${selectedChannel}`]
      }];

      return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {channels.map((channel) => (
          <div
            key={channel.key}
            className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: channel.color }}></span>
                {channel.name}
              </h2>
              <div className="text-sm text-slate-400">
                {data[0]?.[channel.key]?.length || 0} samples
              </div>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getChannelData(channel.key)}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke={colors.gridLines} />
                  <XAxis
                    dataKey="index"
                    tick={{ fill: colors.textSecondary }}
                    stroke={colors.border}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: colors.textSecondary }}
                    stroke={colors.border}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.border,
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: colors.text }}
                    itemStyle={{ color: channel.color }}
                    formatter={(value) => [value.toFixed(3), 'Amplitude (m/s²)']}
                    labelFormatter={(value) => `Sample: ${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={channel.color}
                    strokeWidth={1}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* Add the Vibration Severity Assessment component here */}
        {(selectedChannel === 'all' || selectedChannel === '3') && (
          <VibrationSeverityAssessment data={data} />
        )}
      </div>
    );
  };

  // 8. Update the renderCombinedChart function to use memoized data
  const renderCombinedChart = () => {
    if (!data.length || selectedChannel !== 'all') return null;

    return (
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700 mt-6">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-blue-400">Combined Vibration Analysis</h2>
          <div className="flex items-center text-sm">
            <div className="flex space-x-3 mr-4">
              {[
                { name: "Channel 1", color: colors.channel1 },
                { name: "Channel 2", color: colors.channel2 },
                { name: "Channel 3", color: colors.channel3 }
              ].map(channel => (
                <div key={channel.name} className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: channel.color }}></span>
                  <span className="text-slate-300">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={memoizedCombinedData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke={colors.gridLines} />
              <XAxis
                dataKey="index"
                label={{ value: 'Sample', position: 'bottom', fill: colors.textSecondary }}
                tick={{ fill: colors.textSecondary }}
                stroke={colors.border}
              />
              <YAxis
                label={{ value: 'Amplitude (m/s²)', angle: -90, position: 'insideLeft', fill: colors.textSecondary }}
                domain={['auto', 'auto']}
                tick={{ fill: colors.textSecondary }}
                stroke={colors.border}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: '0.375rem'
                }}
                itemStyle={{ color: colors.text }}
                labelStyle={{ color: colors.textSecondary }}
                formatter={(value) => [value !== null ? value.toFixed(3) : 'N/A', 'Amplitude (m/s²)']}
                labelFormatter={(value) => `Sample: ${value}`}
              />
              <Legend
                iconType="circle"
                layout="horizontal"
                verticalAlign="top"
                align="center"
              />
              <Line
                type="monotone"
                dataKey="V1"
                stroke={colors.channel1}
                strokeWidth={1}
                dot={false}
                name="Channel 1"
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V2"
                stroke={colors.channel2}
                strokeWidth={1}
                dot={false}
                name="Channel 2"
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V3"
                stroke={colors.channel3}
                strokeWidth={1}
                dot={false}
                name="Channel 3"
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    if (!data.length) return null;

    const getChannelStats = (channel) => {
      const values = data[0]?.[channel] || [];
      if (!values.length) return { max: 0, min: 0, avg: 0 };

      const max = Math.max(...values);
      const min = Math.min(...values);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;

      return { max, min, avg };
    };

    const channels = [
      { key: 'V1', name: 'Channel 1', color: colors.channel1 },
      { key: 'V2', name: 'Channel 2', color: colors.channel2 },
      { key: 'V3', name: 'Channel 3', color: colors.channel3 }
    ];

    // return (
    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
    //     {channels.map(channel => {
    //       const stats = getChannelStats(channel.key);
    //       return (
    //         <div 
    //           key={channel.key} 
    //           className="bg-slate-800 rounded-lg shadow p-4 border border-slate-700"
    //         >
    //           <div className="flex items-center mb-2">
    //             <span 
    //               className="w-3 h-3 rounded-full mr-2" 
    //               style={{ backgroundColor: channel.color }}
    //             ></span>
    //             <h3 className="font-medium">{channel.name}</h3>
    //           </div>
    //           <div className="grid grid-cols-3 gap-2 text-center">
    //             <div className="bg-slate-900 p-2 rounded">
    //               <div className="text-xs text-slate-400">MAX</div>
    //               <div className="text-lg font-medium">{stats.max.toFixed(2)}</div>
    //             </div>
    //             <div className="bg-slate-900 p-2 rounded">
    //               <div className="text-xs text-slate-400">MIN</div>
    //               <div className="text-lg font-medium">{stats.min.toFixed(2)}</div>
    //             </div>
    //             <div className="bg-slate-900 p-2 rounded">
    //               <div className="text-xs text-slate-400">AVG</div>
    //               <div className="text-lg font-medium">{stats.avg.toFixed(2)}</div>
    //             </div>
    //           </div>
    //         </div>
    //       );
    //     })}
    //   </div>
    // );
  };

  // Silent refresh indicator (only for status bar, not a full loading screen)
  const renderRefreshStatus = () => {
    if (!autoRefresh) return null;

    return (
      <div className="flex items-center ml-3">
        <div className={`w-2 h-2 rounded-full mr-1 ${isLoadingRef.current ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`}></div>
        <span className="text-xs text-slate-400">
          {isLoadingRef.current ? 'Refreshing...' : 'Auto-refresh on'}
        </span>
      </div>
    );
  };

  
const triggerPython = async () => {
  try {
    setIsLoading(true);
    const response = await fetch("https://intellipod.online/Backend/backendPHP/runing_php.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ value: 1 })
    });

    const data = await response.json();
    console.log("Python response:", data);
    
    // Parse the nested JSON string in the output
    let parsedData = data;
    if (data.status === "success" && data.output) {
      try {
        const outputData = JSON.parse(data.output);
        parsedData = {
          ...data,
          parsedOutput: outputData
        };
      } catch (parseError) {
        console.error("Error parsing output:", parseError);
      }
    }
    
    setPythonResponse(parsedData);
  } catch (error) {
    console.error("Error:", error);
    setPythonResponse({ error: "Failed to execute. Please try again." });
  } finally {
    setIsLoading(false);
  }
};

// Helper function to render the response content
const renderResponseContent = (response) => {
  if (!response) return <div className="text-slate-400 italic">No data</div>;
  
  if (response.error) {
    return <div className="text-red-400">{response.error}</div>;
  }
  
  if (response.parsedOutput) {
    return (
      <div className="space-y-2">
        <div className="text-slate-200">
          <span className="text-slate-400">Silhouette Score:</span> {response.parsedOutput.silhouette_score_of_basic_model?.toFixed(4)}
        </div>
        <div className="text-slate-200">
          <span className="text-slate-400">DB Score:</span> {response.parsedOutput.db_score_of_basic_model?.toFixed(4)}
        </div>
      </div>
    );
  }
  
  // Fallback for other response formats
  const responseStr = typeof response === 'object' ? JSON.stringify(response) : response.toString();
  return (
    <div className="text-slate-200 break-all">
      {responseStr.substring(0, 50) + (responseStr.length > 50 ? '...' : '')}
    </div>
  );
};


  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Spindle Vibration Analysis
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time monitoring and analysis dashboard
            </p>
          </div>

          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                />
                <div className={`relative w-11 h-6 rounded-full transition ${autoRefresh ? 'bg-blue-600' : 'bg-slate-700'} peer-focus:ring-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                <span className="ml-3 text-sm font-medium text-slate-300">Auto-refresh</span>
              </label>
              {renderRefreshStatus()}
            </div>

            {lastUpdated && (
              <div className="flex items-center text-sm text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Status & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
  <div className="flex items-center">
    <div className={`w-3 h-3 rounded-full mr-2 ${error ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
    <div className="font-medium">
      {error ? 'Connection Error' : 'System Online'}
    </div>
    {error && <div className="ml-2 text-sm text-red-400">{error}</div>}
  </div>

  <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center md:space-x-4">
    <div className="flex items-center mb-2 md:mb-0">
      <span className="text-slate-400 mr-3">View:</span>
      <div className="flex space-x-2">
        {['all', '1', '2', '3'].map(channel => (
          <button
            key={channel}
            onClick={() => setSelectedChannel(channel)}
            className={`px-3 py-1 text-sm rounded-md transition ${selectedChannel === channel
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
          >
            {channel === 'all' ? 'All Channels' : `Ch ${channel}`}
          </button>
        ))}
      </div>
    </div>

    {/* Execute Button */}
    <div className="flex items-center space-x-4">
      <button
        onClick={triggerPython}
        disabled={isLoading}
        className={`px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
      >
        {isLoading ? 'Executing...' : 'Execute'}
      </button>

      {/* Response Display Box */}
      <div className="px-4 py-2 bg-slate-700 rounded-md min-w-48 min-h-8 flex items-center">
        {isLoading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          renderResponseContent(pythonResponse)
        )}
      </div>
    </div>

    {/* Full Response Display */}
    {pythonResponse && !isLoading && (
      <div className="mt-4 w-full">
        {pythonResponse.parsedOutput && (
          <div className="mb-4 p-4 bg-slate-700 rounded-md">
            <div className="text-sm font-medium text-slate-300 mb-3">Model Scores:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-600 p-3 rounded-md">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Silhouette Score</div>
                <div className="text-lg font-mono text-emerald-400">
                  {pythonResponse.parsedOutput.silhouette_score_of_basic_model?.toFixed(6)}
                </div>
              </div>
              <div className="bg-slate-600 p-3 rounded-md">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Davies-Bouldin Score</div>
                <div className="text-lg font-mono text-blue-400">
                  {pythonResponse.parsedOutput.db_score_of_basic_model?.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* <div className="p-3 bg-slate-700 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-1">Raw Response:</div>
          <pre className="text-xs text-slate-200 overflow-x-auto">
            {JSON.stringify(pythonResponse, null, 2)}
          </pre>
        </div> */}
      </div>
    )}
  </div>
</div>

        {/* No Data Message */}
        {!data.length && (
          <div className="bg-yellow-900 border border-yellow-800 text-yellow-200 p-4 rounded-lg text-center">
            No vibration data available. Please check the data source.
          </div>
        )}

        {/* Metrics Overview */}
        {renderMetrics()}

        {/* Combined Chart - All channels in one chart */}
        {renderCombinedChart()}

        {/* Individual Channel Charts */}
        {renderChannelCharts()}

        {/* Manual refresh button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              if (!isLoadingRef.current) {
                const fetchData = async () => {
                  isLoadingRef.current = true;
                  try {
                    const response = await fetch('https://cmti-edge.online/SpindleVibration/SpindleFFT.php', {
                      method: 'GET',
                      headers: { 'Accept': 'application/json' },
                      mode: 'cors'
                    });

                    if (!response.ok) {
                      throw new Error(`Server error: ${response.status}`);
                    }

                    const text = await response.text();
                    const result = JSON.parse(text);

                    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
                      throw new Error(result.error || 'Invalid or empty data received');
                    }

                    setData(result.data);
                    setLastUpdated(new Date());
                    setError(null);
                  } catch (err) {
                    setError(err.message || 'Failed to fetch data');
                  } finally {
                    isLoadingRef.current = false;
                  }
                };
                fetchData();
              }
            }}
            disabled={isLoadingRef.current}
            className={`px-4 py-2 rounded-md font-medium transition ${isLoadingRef.current ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default VibrationAnalysisDashboard;