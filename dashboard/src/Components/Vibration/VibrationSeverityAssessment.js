import React, { useState, useEffect, useCallback } from 'react';
import ISOImage from "../../Assets/companylogo/ISO/ISOChart.jpeg"
const VibrationSeverityAssessment = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState('1');
  const [showISOChart, setShowISOChart] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Ensure state persistence between renders
  useEffect(() => {
    // Component state initialization
  }, []);

  // Function to determine severity based on vibration value and machine class
  const determineSeverity = useCallback((value, machineClass) => {
    // Convert from mm/s to RMS velocity
    const mmPerSecond = Math.abs(value);

    // ISO 10816 thresholds (mm/s)
    const thresholds = {
      '1': { // Class I - Small machines
        good: 1.12,        // Up to 1.12 mm/s is good
        satisfactory: 2.80, // Up to 2.80 mm/s is satisfactory
        unsatisfactory: 7.10 // Up to 7.10 mm/s is unsatisfactory, above is unacceptable
      },
      '2': { // Class II - Medium machines
        good: 1.80,
        satisfactory: 4.50,
        unsatisfactory: 11.2
      },
      '3': { // Class III - Large rigid foundation
        good: 2.80,
        satisfactory: 7.10,
        unsatisfactory: 18.0
      },
      '4': { // Class IV - Large soft foundation
        good: 4.50,
        satisfactory: 11.2,
        unsatisfactory: 28.0
      }
    };

    const classThresholds = thresholds[machineClass];

    if (mmPerSecond <= classThresholds.good) {
      return { status: 'Good', color: '#10b981' }; // Emerald 500
    } else if (mmPerSecond <= classThresholds.satisfactory) {
      return { status: 'Satisfactory', color: '#a3e635' }; // Lime 400
    } else if (mmPerSecond <= classThresholds.unsatisfactory) {
      return { status: 'Unsatisfactory', color: '#f97316' }; // Orange 500
    } else {
      return { status: 'Unacceptable', color: '#ef4444' }; // Red 500
    }
  }, []);

  // Calculate channel vibration using a memoized callback to avoid recalculation
  const calculateChannelVibration = useCallback((channelNum) => {
    if (!data || !data[0]) return 0;

    const channelKey = `V${channelNum}`;
    if (!data[0][channelKey] || !data[0][channelKey].length) return 0;

    // Use a more efficient way to find max value
    let maxVal = -Infinity;
    const channelData = data[0][channelKey];
    const dataLength = Math.min(channelData.length, 1000); // Limit to prevent browser crash

    for (let i = 0; i < dataLength; i++) {
      if (channelData[i] > maxVal) {
        maxVal = channelData[i];
      }
    }

    return maxVal === -Infinity ? 0 : maxVal;
  }, [data]);

  // Calculate max vibration across all channels
  const calculateMaxVibration = useCallback(() => {
    if (!data || !data[0]) return 0;

    return Math.max(
      calculateChannelVibration(1),
      calculateChannelVibration(2),
      calculateChannelVibration(3)
    );
  }, [data, calculateChannelVibration]);

  // Get vibration based on selected tab
  const getVibrationValue = useCallback(() => {
    if (activeTab === 'all') {
      return calculateMaxVibration();
    } else {
      return calculateChannelVibration(activeTab);
    }
  }, [activeTab, calculateMaxVibration, calculateChannelVibration]);

  const vibrationValue = getVibrationValue();
  const severity = determineSeverity(vibrationValue, selectedClass);

  // Fixed event handlers
  const handleTabClick = useCallback((tab, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveTab(tab);
  }, []);

  const handleClassChange = useCallback((e) => {
    setSelectedClass(e.target.value);
  }, []);

  const toggleISOChart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowISOChart(prev => !prev);
  }, []);

  // Prevent selection from being changed - only use for buttons
  const preventDefaultAndStopPropagation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-blue-400">Vibration Severity</h2>
        <button
          onClick={toggleISOChart}
          onMouseDown={preventDefaultAndStopPropagation}
          className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300"
          title="Show ISO 10816 Chart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Channel selection tabs */}
        <div className="mb-4 flex border border-slate-700 rounded overflow-hidden">
          <button
            onClick={(e) => handleTabClick('all', e)}
            onMouseDown={preventDefaultAndStopPropagation}
            className={`flex-1 py-2 text-sm ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            All Ch
          </button>
          <button
            onClick={(e) => handleTabClick('1', e)}
            onMouseDown={preventDefaultAndStopPropagation}
            className={`flex-1 py-2 text-sm ${activeTab === '1' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Ch 1
          </button>
          <button
            onClick={(e) => handleTabClick('2', e)}
            onMouseDown={preventDefaultAndStopPropagation}
            className={`flex-1 py-2 text-sm ${activeTab === '2' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Ch 2
          </button>
          <button
            onClick={(e) => handleTabClick('3', e)}
            onMouseDown={preventDefaultAndStopPropagation}
            className={`flex-1 py-2 text-sm ${activeTab === '3' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Ch 3
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">Select Machine Class:</label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Class I - Small machines</option>
            <option value="2">Class II - Medium machines</option>
            <option value="3">Class III - Large rigid foundation</option>
            <option value="4">Class IV - Large soft foundation</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-xs text-slate-400">
              {activeTab === 'all' ? 'MAX VIBRATION' : `CH ${activeTab} VIBRATION`}
            </div>
            <div className="text-lg font-medium">{vibrationValue.toFixed(2)} mm/s</div>
          </div>
          <div className="bg-slate-900 p-3 rounded" style={{ borderLeft: `4px solid ${severity.color}` }}>
            <div className="text-xs text-slate-400">STATUS</div>
            <div className="text-lg font-medium" style={{ color: severity.color }}>{severity.status}</div>
          </div>
        </div>

        {showISOChart && (
          <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700">
            <div className="flex justify-center">
              <img
                src={ISOImage}
                alt="ISO 10816 Vibration Severity Chart"
                className="max-w-full h-auto border border-slate-600 rounded"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default React.memo(VibrationSeverityAssessment);