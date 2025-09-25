import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Enhanced color schemes for the different channels
const COLORS = {
  F1: {
    primary: 'rgba(0, 204, 153, 1)',
    secondary: 'rgba(0, 204, 153, 0.2)',
    gradient: ['rgba(0, 204, 153, 0.8)', 'rgba(0, 204, 153, 0)']
  },
  F2: {
    primary: 'rgba(255, 102, 102, 1)',
    secondary: 'rgba(255, 102, 102, 0.2)',
    gradient: ['rgba(255, 102, 102, 0.8)', 'rgba(255, 102, 102, 0)']
  },
  F3: {
    primary: 'rgba(102, 153, 255, 1)',
    secondary: 'rgba(102, 153, 255, 0.2)',
    gradient: ['rgba(102, 153, 255, 0.8)', 'rgba(102, 153, 255, 0)']
  }
};

// Additional colors for charts
const ACCENT_COLORS = {
  yellow: 'rgba(255, 206, 86, 1)',
  purple: 'rgba(153, 102, 255, 1)',
  orange: 'rgba(255, 159, 64, 1)'
};

const FFTAnalysis = () => {
  // State for the selected channel
  const [selectedChannel, setSelectedChannel] = useState('F1');

  // State for holding the analysis data
  const [fftData, setFftData] = useState(null);

  // State for the selected time range
  const [timeRange, setTimeRange] = useState(100);

  // State for holding the loading status
  const [loading, setLoading] = useState(true);

  // State for showing/hiding the metrics panel
  const [showMetrics, setShowMetrics] = useState(true);

  // State for auto refresh toggle
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Ref for the auto refresh interval
  const refreshIntervalRef = useRef(null);

  // Function to fetch data from the backend
  const fetchFFTData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://cmti-edge.online/SpindleVibration/Analysis.php?action=analysis&limit=${timeRange}`);
      const data = await response.json();
      setFftData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FFT data:', error);
      setLoading(false);
    }
  };

  // Setup auto refresh
  useEffect(() => {
    if (autoRefresh) {
      fetchFFTData(); // Initial fetch
      refreshIntervalRef.current = setInterval(fetchFFTData, 5000); // Refresh every 5 seconds
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, timeRange]);

  // Prepare data for the frequency spectrum chart
  const prepareFrequencyData = () => {
    if (!fftData || !fftData.analysisResults || fftData.analysisResults.length === 0) {
      return null;
    }

    // Get the latest record
    const latestRecord = fftData.analysisResults[0];
    const channelData = latestRecord.analysis[selectedChannel];

    if (!channelData || !channelData.rawData) {
      return null;
    }

    const { frequencies, magnitudes } = channelData.rawData;

    let processedData = [];

    for (let i = 0; i < magnitudes.length; i++) {
      const value = Math.abs(magnitudes[i]);

      // Skip adding points that are exactly zero to reduce data size
      if (value === 0 || value === 0.0) {
        continue;
      }

      processedData.push({
        // Use the raw frequency value or index depending on your data structure
        frequency: frequencies ? frequencies[i] : i,
        amplitude: value
      });
    }

    return {
      // Don't format the frequency values with toFixed()
      labels: processedData.map(point => point.frequency),
      datasets: [
        {
          label: `${selectedChannel} Frequency Spectrum`,
          data: processedData.map(point => point.amplitude),
          borderColor: COLORS[selectedChannel].primary,
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return COLORS[selectedChannel].secondary;
            }

            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, COLORS[selectedChannel].gradient[1]);
            gradient.addColorStop(1, COLORS[selectedChannel].gradient[0]);
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  };

  // Prepare data for the time series chart
  const prepareTimeSeriesData = () => {
    if (!fftData || !fftData.analysisResults || fftData.analysisResults.length === 0) {
      return null;
    }

    // For time series we'll use total power over time
    const times = fftData.analysisResults.map(record => {
      const date = new Date(record.timestamp);
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }).reverse();

    const totalPowerData = fftData.analysisResults.map(record => {
      return record.analysis[selectedChannel]?.totalPower || 0;
    }).reverse();

    const meanFreqData = fftData.analysisResults.map(record => {
      return record.analysis[selectedChannel]?.meanFrequency || 0;
    }).reverse();

    const peakFreqData = fftData.analysisResults.map(record => {
      return record.analysis[selectedChannel]?.peakFrequency || 0;
    }).reverse();

    return {
      labels: times,
      datasets: [
        {
          label: 'Total Power',
          data: totalPowerData,
          borderColor: COLORS[selectedChannel].primary,
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Mean Frequency',
          data: meanFreqData,
          borderColor: ACCENT_COLORS.orange,
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Peak Frequency',
          data: peakFreqData,
          borderColor: ACCENT_COLORS.purple,
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Get the latest metrics for display
  const getLatestMetrics = () => {
    if (!fftData || !fftData.analysisResults || fftData.analysisResults.length === 0) {
      return null;
    }

    const latestRecord = fftData.analysisResults[0];
    return latestRecord.analysis[selectedChannel];
  };

  // Options for the frequency spectrum chart
  const frequencyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Frequency Spectrum Analysis',
        color: '#e2e8f0',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 14
        },
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderColor: COLORS[selectedChannel].primary,
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        displayColors: true
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Frequency (Hz)',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 20,
          callback: function (value) {
            // You can format the display value here if needed
            return value;
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Magnitude',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // Options for the time series chart
  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Time Series Analysis',
        color: '#e2e8f0',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderColor: '#475569',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Power',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Frequency (Hz)',
          color: '#e2e8f0',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const getTopThreePeaks = () => {
    if (!fftData || !fftData.analysisResults || fftData.analysisResults.length === 0) {
      return null;
    }

    // Get the latest record
    const latestRecord = fftData.analysisResults[0];
    const channelData = latestRecord.analysis[selectedChannel];

    if (!channelData || !channelData.rawData) {
      return null;
    }

    const { frequencies, magnitudes } = channelData.rawData;

    // Create array of frequency-magnitude pairs
    let frequencyPairs = [];
    for (let i = 0; i < magnitudes.length; i++) {
      frequencyPairs.push({
        frequency: frequencies ? frequencies[i] : i,
        magnitude: Math.abs(magnitudes[i])
      });
    }

    // Sort by magnitude in descending order to find the peaks
    frequencyPairs.sort((a, b) => b.magnitude - a.magnitude);

    // Return top 3 peaks
    return frequencyPairs.slice(0, 3);
  };


  // Format number for display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toFixed(2) : num;
  };

  // Get frequency data and time series data
  const frequencyData = prepareFrequencyData();
  const timeSeriesData = prepareTimeSeriesData();
  const metrics = getLatestMetrics();

  // Helper function to get color for selected channel
  const getChannelColor = (channel) => {
    switch (channel) {
      case 'F1': return 'bg-emerald-500';
      case 'F2': return 'bg-red-500';
      case 'F3': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-black text-gray-100 w-full p-5 min-h-full">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">FFT Analysis Dashboard</h1>
          <p className="text-gray-400">Real-time spindle vibration analysis</p>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 shadow-md">
            <label className="block text-sm mb-1 text-gray-400">Channel</label>
            <div className="flex space-x-2">
              {['F1', 'F2', 'F3'].map(channel => (
                <button
                  key={channel}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${selectedChannel === channel
                    ? `${getChannelColor(channel)} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 shadow-md">
            <label className="block text-sm mb-1 text-gray-400">Time Range</label>
            <select
              className="bg-gray-800 text-gray-100 rounded-md px-3 py-2 w-full border border-gray-700 focus:border-gray-600 focus:outline-none"
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
            >
              <option value={10}>Last 10 Records</option>
              <option value={50}>Last 50 Records</option>
              <option value={100}>Last 100 Records</option>
              <option value={200}>Last 200 Records</option>
            </select>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 shadow-md">
            <label className="block text-sm mb-1 text-gray-400">Auto Refresh</label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="toggle"
                id="toggle"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="toggle"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
              ></label>
            </div>
            <span className="ml-2 text-gray-300">{autoRefresh ? 'On' : 'Off'}</span>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 px-4 py-3 rounded-md flex items-center shadow-md"
            onClick={fetchFFTData}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Now
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-xl h-96 animate-slideInLeft">
            {frequencyData ? (
              <Line data={frequencyData} options={frequencyOptions} />
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-400">No frequency data available</p>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-xl h-96 animate-slideInRight">
            {timeSeriesData ? (
              <Line data={timeSeriesData} options={timeSeriesOptions} />
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-400">No time series data available</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">FFT Statistics</h2>
              <button
                className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition-colors duration-300 border border-gray-700"
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
              </button>
            </div>



            {showMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                {metrics ? (
                  <>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getChannelColor(selectedChannel)}`}></span>
                        Basic Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Total Power</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.totalPower)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Peak Frequency</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.peakFrequency)} Hz</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Low Band Power</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.lowBandPower)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getChannelColor(selectedChannel)}`}></span>
                        Frequency Distribution
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Mean Frequency</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.meanFrequency)} Hz</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Median Frequency</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.medianFrequency)} Hz</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Variance</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.varianceFrequency)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getChannelColor(selectedChannel)}`}></span>
                        Spectral Shape
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Spectral Flatness</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.spectralFlatness)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Spectral Crest</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.spectralCrest)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Spectral Entropy</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.spectralEntropy)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getChannelColor(selectedChannel)}`}></span>
                        Higher Order Moments
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Spectral Skewness</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.spectralSkewness)}</p>
                          <p className="text-xs text-gray-400">
                            {metrics.spectralSkewness > 0 ? 'More energy in higher frequencies' : 'More energy in lower frequencies'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Spectral Kurtosis</p>
                          <p className="text-lg font-bold text-white">{formatNumber(metrics.spectralKurtosis)}</p>
                          <p className="text-xs text-gray-400">
                            {metrics.spectralKurtosis > 3 ? 'Sharp peaks in spectrum' : 'Flat spectrum distribution'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="lg:col-span-4 text-center py-8">
                    <p className="text-gray-400">No metrics data available for the selected channel</p>
                  </div>
                )}
              </div>
            )}

            {showMetrics && metrics && (
              <div className="mt-8 animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-4">Top 3 Frequency Peaks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getTopThreePeaks() ? (
                    getTopThreePeaks().map((peak, index) => (
                      <div
                        key={index}
                        className={`bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300 ${index === 0 ? 'border-yellow-500' : index === 1 ? 'border-gray-400' : 'border-amber-700'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold flex items-center">
                            <span className={`text-2xl mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'
                              }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            Peak #{index + 1}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                              index === 1 ? 'bg-gray-500/20 text-gray-300' :
                                'bg-amber-700/20 text-amber-500'
                            }`}>
                            Rank #{index + 1}
                          </div>
                        </div>

                        {/* Frequency - Highlighted as most important */}
                        <div className="mb-3 p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm text-blue-300 font-medium">Frequency</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(peak.frequency)} <span className="text-blue-300 text-lg">Hz</span></p>
                        </div>

                        {/* Magnitude */}
                        <div className="mb-2">
                          <p className="text-sm text-gray-400">Magnitude</p>
                          <p className="text-lg font-bold text-white">{formatNumber(peak.magnitude)}</p>
                        </div>

                        {/* Peak Point Indicator */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center mb-1">
                            <span className="text-xs text-gray-400 mr-2">Peak Point</span>
                            <span className="flex-grow h-px bg-gray-700"></span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>x: {formatNumber(peak.frequency)}</span>
                            <span>y: {formatNumber(peak.magnitude)}</span>
                          </div>

                          {/* Visual representation of magnitude relative to the highest peak */}
                          <div className="mt-2 bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                                }`}
                              style={{
                                width: `${index === 0 ? 100 : (peak.magnitude / getTopThreePeaks()[0].magnitude * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-3 text-center py-8">
                      <p className="text-gray-400">No peak data available for the selected channel</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
          height: 100%;
          background-color: #000000;
          color: #e2e8f0;
        }

        #root {
          width: 100%;
          height: 100%;
        }
        
        /* Toggle Checkbox */
        .toggle-checkbox:checked {
          right: 0;
          border-color: #10b981;
        }
        .toggle-label {
          transition: background-color 0.3s ease;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          transition: all 0.3s ease-in-out;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #10b981;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FFTAnalysis;