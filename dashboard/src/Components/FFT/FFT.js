import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar
} from 'recharts';
import { motion } from 'framer-motion';

const FFT = () => {
  const [fftData, setFftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChannel, setActiveChannel] = useState('F1');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [rpm, setRpm] = useState(500);
  const [rpmData, setRpmData] = useState(null);
  const [rpmLoading, setRpmLoading] = useState(false);
  const [faultAnalysis, setFaultAnalysis] = useState(null);
  const [analyzingFault, setAnalyzingFault] = useState(false);

  // Colors for our dark theme
  const colors = useMemo(() => ({
    primary: '#10B981', // Green
    secondary: '#6366F1', // Indigo
    tertiary: '#EC4899', // Pink
    background: '#121212',
    cardBg: '#1E1E1E',
    text: '#E5E7EB',
    border: '#374151',
    chartLine: {
      F1: '#10B981', // Green
      F2: '#6366F1', // Indigo
      F3: '#EC4899', // Pink
    }
  }), []);

  const fetchRpmData = useCallback(async () => {
    try {
      const response = await fetch('https://cmti-edge.online/SpindleVibration/RPM.php');
      const data = await response.json();
      setRpm(data.R1); // Update RPM state with the R1 value from API
    } catch (err) {
      console.error('Failed to fetch RPM data:', err);
      // You might want to keep the previous RPM value or set a default
    }
  }, []);

  // Set up interval for RPM data fetching
  useEffect(() => {
    fetchRpmData(); // Initial fetch

    const rpmIntervalId = setInterval(() => {
      fetchRpmData();
    }, refreshInterval); // Use the same refresh interval as other data

    return () => clearInterval(rpmIntervalId);
  }, [fetchRpmData, refreshInterval]);

  // Fetch data from the API
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('https://cmti-edge.online/intelipod/FFTDataAnalysis.php');
      const data = await response.json();
      setFftData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch FFT data. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Initial data fetch and setup interval
  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      if (isRefreshing) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval, isRefreshing]);

  // Defect Analysis Function (Python logic converted to JavaScript)
  const performDefectAnalysis = useCallback(() => {
    if (!fftData || !fftData.raw_data) {
      return null;
    }

    setAnalyzingFault(true);

    try {
      // Get FFT data for all three channels
      const f1Data = fftData.raw_data.F1 || [];
      const f2Data = fftData.raw_data.F2 || [];
      const f3Data = fftData.raw_data.F3 || [];

      // Calculate harmonic frequencies (converting RPM to Hz)
      const o1 = Math.floor(rpm / 60); // 1x frequency
      const o2 = 2 * o1; // 2x frequency  
      const o3 = 3 * o1; // 3x frequency

      // Find maximum values around harmonic frequencies (±5 Hz window)
      const getMaxInRange = (data, center, window = 5) => {
        const start = Math.max(0, center - window);
        const end = Math.min(data.length - 1, center + window);
        let max = 0;

        for (let i = start; i <= end; i++) {
          const value = parseFloat(data[i]) || 0;
          if (value > max) {
            max = value;
          }
        }
        return max;
      };

      const v1_max = getMaxInRange(f1Data, o1);
      const v2_max = getMaxInRange(f1Data, o2);
      const v3_max = getMaxInRange(f1Data, o3);

      let faultType = 'Unknown';
      let confidence = 'Low';
      let description = '';

      if (v1_max < 0.1 && v2_max < 0.1 && v3_max < 0.1) {
        faultType = 'No fault Condition';
        confidence = 'High';
        description = 'All harmonic amplitudes are very low, indicating normal operating condition with minimal vibration.';
      } else if (v1_max > v2_max && v2_max > v3_max) {
        faultType = 'Unbalance';
        confidence = 'High';
        description = 'Decreasing harmonic pattern with dominant 1x vibration indicates static or dynamic unbalance.';
      } else if (v1_max > v2_max && v3_max < 0.5) {
        faultType = 'Bent Rotor';
        confidence = 'High';
        description = 'Dominant 1x vibration with low 3x harmonic suggests a bent rotor shaft.';
      } else if (v1_max > v2_max && v2_max > v3_max && v3_max > 0.5) {
        faultType = 'Angular Missalignment';
        confidence = 'High';
        description = 'Decreasing harmonic pattern with significant 3x component indicates angular misalignment.';
      } else if (v2_max > v1_max && v1_max >= v3_max) {
        faultType = 'Parallel misalignment';
        confidence = 'High';
        description = 'Dominant 2x vibration indicates parallel misalignment between coupled shafts.';
      } else if (v2_max > v1_max && v2_max > v3_max) {
        faultType = 'Misalignment';
        confidence = 'High';
        description = 'Dominant 2x vibration pattern suggests general misalignment condition.';
      } else if (v3_max > v1_max && v3_max > v2_max) {
        faultType = 'Extreme lossness';
        confidence = 'High';
        description = 'Dominant 3x vibration indicates extreme looseness in mechanical connections.';
      } else {
        faultType = 'Normal';
        confidence = 'Medium';
        description = 'Vibration pattern appears normal or does not match common fault signatures.';
      }

      const analysis = {
        rpm,
        harmonics: { o1, o2, o3 },
        amplitudes: {
          v1_max: parseFloat(v1_max.toFixed(5)),
          v2_max: parseFloat(v2_max.toFixed(5)),
          v3_max: parseFloat(v3_max.toFixed(5))
        },
        faultType,
        confidence,
        description,
        timestamp: new Date().toISOString()
      };

      setFaultAnalysis(analysis);
      return analysis;

    } catch (error) {
      console.error('Error in fault analysis:', error);
      setFaultAnalysis({
        error: 'Failed to perform fault analysis',
        timestamp: new Date().toISOString()
      });
    } finally {
      setAnalyzingFault(false);
    }
  }, [fftData, rpm]);

  // Prepare chart data
  const prepareChartData = useCallback((channelData) => {
  if (!fftData || !fftData.raw_data || !fftData.raw_data[channelData]) {
    return [];
  }

  // Get the raw data array
  const rawData = fftData.raw_data[channelData];
  
  // Convert FFT data into a format suitable for recharts
  const data = rawData
    // Skip first 10 elements and take next 1000 elements
    .slice(10, 1010) // 10-1009 (total of 1000 samples)
    .map((value, index) => {
      // Stop plotting when we hit zeros
      if (parseFloat(value) === 0 || parseFloat(value) === 0.0) {
        return null;
      }
      return {
        frequency: index + 10, // Add 10 to maintain correct frequency values
        amplitude: parseFloat(value)
      };
    })
    .filter(item => item !== null);

  return data;
}, [fftData]);

  // Find top 3 peaks in the data
  const findTopPeaks = useCallback((channelData) => {
  if (!fftData || !fftData.raw_data || !fftData.raw_data[channelData]) {
    return [];
  }

  // Get the raw data array and take only the 1000 samples we're interested in
  const data = [...fftData.raw_data[channelData]].slice(10, 1010);
  
  // Make a copy of the data with index to track frequency (adding 10 to maintain correct frequency)
  const dataWithIndex = data.map((value, index) => ({ 
    value: parseFloat(value), 
    frequency: index + 10 
  }));

  // Sort by amplitude descending and take top 3
  dataWithIndex.sort((a, b) => b.value - a.value);

  return dataWithIndex.slice(0, 3).map(peak => ({
    frequency: peak.frequency,
    amplitude: peak.value
  }));
}, [fftData]);

  const chartData = prepareChartData(activeChannel);
  const topPeaks = findTopPeaks(activeChannel);

  // Render Fault Analysis Section
  const renderFaultAnalysis = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4 md:mb-0">
            Fault Analysis
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label className="text-gray-400 mr-2">Current RPM:</label>
              <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 w-24">
                {rpm}
              </div>
            </div>
            <button
              onClick={performDefectAnalysis}
              disabled={analyzingFault || !fftData}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${analyzingFault || !fftData
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
            >
              {analyzingFault ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Find Fault'
              )}
            </button>
          </div>
        </div>

        {faultAnalysis && !faultAnalysis.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Fault Result Card */}
            <div className={`p-6 rounded-lg shadow-lg border-l-4 ${faultAnalysis.confidence === 'High' ? 'bg-red-900/30 border-red-500' :
                faultAnalysis.confidence === 'Medium' ? 'bg-yellow-900/30 border-yellow-500' :
                  'bg-blue-900/30 border-blue-500'
              }`}>
              <div className="flex items-center mb-4">
                <div className={`h-3 w-3 rounded-full mr-3 ${faultAnalysis.confidence === 'High' ? 'bg-red-500' :
                    faultAnalysis.confidence === 'Medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                  }`}></div>
                <h4 className="text-lg font-bold text-white">Detected Fault</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Fault Type:</span>
                  <p className="text-xl font-semibold text-white mt-1">{faultAnalysis.faultType}</p>
                </div>
                <div>
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${faultAnalysis.confidence === 'High' ? 'bg-red-500/20 text-red-300' :
                      faultAnalysis.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                    }`}>
                    {faultAnalysis.confidence}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-gray-200 mt-1 leading-relaxed">{faultAnalysis.description}</p>
                </div>
              </div>
            </div>

            {/* Analysis Data Card */}
            <div className="bg-gray-700/50 p-6 rounded-lg shadow-lg">
              <h4 className="text-lg font-bold text-white mb-4">Analysis Data</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">1x Harmonic</p>
                    <p className="text-green-400 font-bold">{faultAnalysis.harmonics.o1} Hz</p>
                    <p className="text-gray-300 text-sm">{faultAnalysis.amplitudes.v1_max}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">2x Harmonic</p>
                    <p className="text-indigo-400 font-bold">{faultAnalysis.harmonics.o2} Hz</p>
                    <p className="text-gray-300 text-sm">{faultAnalysis.amplitudes.v2_max}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">3x Harmonic</p>
                    <p className="text-pink-400 font-bold">{faultAnalysis.harmonics.o3} Hz</p>
                    <p className="text-gray-300 text-sm">{faultAnalysis.amplitudes.v3_max}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-600">
                  <p className="text-gray-400 text-sm">Analysis performed at {rpm} RPM</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(faultAnalysis.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {faultAnalysis && faultAnalysis.error && (
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
            <p className="text-red-300">{faultAnalysis.error}</p>
          </div>
        )}

        {!faultAnalysis && (
          <div className="text-center py-8 text-gray-400">
            <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p>Click "Find Fault" to analyze the vibration data for potential machinery faults</p>
          </div>
        )}
      </motion.div>
    );
  };

  // Statistics cards
  const renderStatCards = () => {
    if (!fftData || !fftData.analysis || !fftData.analysis[activeChannel]) {
      return <div>No statistics available</div>;
    }

    const stats = fftData.analysis[activeChannel];

    // Group statistics for displaying in grid
    const statGroups = [
      { title: 'Basic Stats', items: ['mean', 'rms', 'standard_deviation', 'variance'] },
      { title: 'Distribution', items: ['skewness', 'kurtosis'] },
      { title: 'Amplitude', items: ['peak', 'peak_to_peak', 'crest_factor'] },
      { title: 'Shape Analysis', items: ['impulse_factor', 'shape_factor'] },
      { title: 'Energy & Entropy', items: ['energy', 'power', 'spectral_entropy'] }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {statGroups.map((group, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-700 pb-2">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.items.map(stat => (
                <div key={stat} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">
                    {stat.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-gray-200 font-medium">
                    {typeof stats[stat] === 'number' ? stats[stat].toExponential(3) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Top 3 peaks display
  const renderTopPeaks = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">
          Top 3 Peaks - {activeChannel}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPeaks.map((peak, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg shadow-md relative overflow-hidden 
                ${idx === 0 ? 'bg-gradient-to-br from-yellow-700 to-yellow-900' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-600 to-gray-800' :
                    'bg-gradient-to-br from-amber-700 to-amber-900'}`}
            >
              <div className="absolute -right-1 -top-2 text-6xl font-bold opacity-10 text-white">
                #{idx + 1}
              </div>
              <h4 className="font-bold text-white mb-2">Peak #{idx + 1}</h4>
              <div className="flex justify-between text-gray-200">
                <span>Frequency:</span>
                <span className="font-medium">{peak.frequency} Hz</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Amplitude:</span>
                <span className="font-medium">{peak.amplitude.toExponential(3)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Main FFT Chart
  const renderFFTChart = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-96"
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-200">
          FFT Analysis - {activeChannel}
        </h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="frequency"
              stroke="#999"
              label={{ value: 'Frequency (Hz)', position: 'insideBottomRight', offset: -5, fill: '#999' }}
            />
            <YAxis
              stroke="#999"
              label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', fill: '#999' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#eee' }}
              labelStyle={{ color: '#eee' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amplitude"
              stroke={colors.chartLine[activeChannel]}
              dot={false}
              strokeWidth={2}
              name={`${activeChannel} Amplitude`}
              animationDuration={1000}
            />
            {topPeaks.map((peak, idx) => (
              <ReferenceLine
                key={idx}
                x={peak.frequency}
                stroke={idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : "#CD7F32"}
                strokeDasharray="3 3"
                label={{
                  value: `Peak #${idx + 1}`,
                  position: 'top',
                  fill: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : "#CD7F32"
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading FFT Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-red-900/30 rounded-lg max-w-md">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              FFT Data Analysis Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Real-time vibration analysis via Fast Fourier Transform
            </p>
            {fftData && fftData.timestamp && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(fftData.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="flex border border-gray-700 rounded-md overflow-hidden">
              {['F1', 'F2', 'F3'].map(channel => (
                <button
                  key={channel}
                  onClick={() => setActiveChannel(channel)}
                  className={`px-4 py-2 transition-colors ${activeChannel === channel
                      ? `bg-${channel === 'F1' ? 'green' : channel === 'F2' ? 'indigo' : 'pink'}-600 text-white`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {channel}
                </button>
              ))}
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setIsRefreshing(!isRefreshing)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isRefreshing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                <svg
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Auto Refresh On' : 'Auto Refresh Off'}
              </button>

              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="ml-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6">
          {/* FFT Chart */}
          {renderFFTChart()}

          {/* Top 3 Peaks */}
          {renderTopPeaks()}

          {/* Statistics Cards */}
          {renderStatCards()}

          {/* Fault Analysis Section */}
          {renderFaultAnalysis()}
        </div>
      </motion.div>
    </div>
  );
};

export default FFT;