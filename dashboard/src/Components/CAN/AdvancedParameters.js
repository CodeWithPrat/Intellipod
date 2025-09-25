import React, { useState, useEffect } from 'react';
import { 
  Gauge, Droplet, Thermometer, Flame, 
  Minimize2, ArrowUpCircle, Percent, 
  Zap, BarChart3, TrendingUp, Sliders, 
  AlertOctagon, RotateCcw, Truck
} from 'lucide-react';

const AdvancedParameters = () => {
  const [animateValues, setAnimateValues] = useState(false);
  
  useEffect(() => {
    // Start animations after component mounts
    setTimeout(() => {
      setAnimateValues(true);
    }, 500);
  }, []);
  
  // Parameters NOT used in the main Dashboard
  const unusedParameters = {
    fuelPressure: {
      value: 385.20,
      unit: "kPa",
      icon: <Gauge />,
      title: "FUEL PRESSURE",
      max: 600,
      steps: [0, 150, 300, 450, 600],
      warning: 550,
      danger: 580
    },
    mafAirFlowRate: {
      value: 24.65,
      unit: "g/s",
      icon: <TrendingUp />,
      title: "AIR FLOW RATE",
      max: 60,
      steps: [0, 15, 30, 45, 60],
      warning: 50,
      danger: 55
    },
    fuelRailPressureRelativeToManifoldVacuum: {
      value: 203.10,
      unit: "kPa",
      icon: <BarChart3 />,
      title: "RAIL PRESSURE (VAC)",
      max: 400,
      steps: [0, 100, 200, 300, 400],
      warning: 350,
      danger: 380
    },
    fuelRailGaugePressure: {
      value: 256.80,
      unit: "kPa",
      icon: <Gauge />,
      title: "RAIL GAUGE PRESS",
      max: 400,
      steps: [0, 100, 200, 300, 400],
      warning: 350,
      danger: 370
    },
    commandedEGR: {
      value: 14.20,
      unit: "%",
      icon: <RotateCcw />,
      title: "COMMANDED EGR",
      max: 100,
      steps: [0, 25, 50, 75, 100],
      warning: 90,
      danger: 95
    },
    commandedAirFuelEquivalenceRatio: {
      value: 1.04,
      unit: "λ",
      icon: <Sliders />,
      title: "AIR/FUEL RATIO",
      max: 2,
      steps: [0, 0.5, 1, 1.5, 2],
      warning: 1.6,
      danger: 1.8
    },
    relativeThrottlePosition: {
      value: 4.40,
      unit: "%",
      icon: <Percent />,
      title: "REL THROTTLE POS",
      max: 100,
      steps: [0, 25, 50, 75, 100],
      warning: 90,
      danger: 95
    },
    absoluteEvapSystemVaporPressure: {
      value: 12.40,
      unit: "kPa",
      icon: <Droplet />,
      title: "EVAP SYS PRESSURE",
      max: 30,
      steps: [0, 7.5, 15, 22.5, 30],
      warning: 25,
      danger: 28
    },
    engineOilTemperature: {
      value: 92.30,
      unit: "°C",
      icon: <Thermometer />,
      title: "OIL TEMPERATURE",
      max: 150,
      steps: [0, 35, 70, 105, 140],
      warning: 110,
      danger: 120
    },
    relativeAcceleratorPedalPosition: {
      value: 5.80,
      unit: "%",
      icon: <ArrowUpCircle />,
      title: "REL PEDAL POS",
      max: 100,
      steps: [0, 25, 50, 75, 100],
      warning: 90,
      danger: 95
    },
    engineFuelRate: {
      value: 4.65,
      unit: "L/h",
      icon: <Flame />,
      title: "FUEL RATE",
      max: 20,
      steps: [0, 5, 10, 15, 20],
      warning: 18,
      danger: 19
    },
    driversDemandEnginePercentTorque: {
      value: 28.40,
      unit: "%",
      icon: <Zap />,
      title: "DEMAND TORQUE",
      max: 100,
      steps: [0, 25, 50, 75, 100],
      warning: 90,
      danger: 95
    },
    actualEnginePercentTorque: {
      value: 27.20,
      unit: "%",
      icon: <Zap />,
      title: "ACTUAL TORQUE",
      max: 100,
      steps: [0, 25, 50, 75, 100],
      warning: 90,
      danger: 95
    },
    engineReferenceTorque: {
      value: 385.00,
      unit: "N-m",
      icon: <AlertOctagon />,
      title: "REF TORQUE",
      max: 600,
      steps: [0, 150, 300, 450, 600],
      warning: 550,
      danger: 580
    },
    cylinderFuelRate: {
      value: 12.35,
      unit: "mg/stroke",
      icon: <Truck />,
      title: "CYL FUEL RATE",
      max: 25,
      steps: [0, 6.25, 12.5, 18.75, 25],
      warning: 20,
      danger: 22
    }
  };

  // Convert object to array for easier rendering
  const parametersArray = Object.entries(unusedParameters);

  const getStatusColor = (param, value) => {
    if (value >= param.danger) return "from-red-500 to-red-600";
    if (value >= param.warning) return "from-yellow-400 to-orange-500";
    return "from-blue-400 to-blue-600";
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black text-white p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <h1 className="text-3xl font-bold text-blue-400 text-center mb-2">Intellipod V-1</h1>
        <div className="w-full max-w-3xl mx-auto h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <p className="text-center text-gray-400 mt-2">Extended Vehicle Diagnostic Parameters</p>
      </div>

      {/* Parameters Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {parametersArray.map(([key, param], index) => (
          <div
            key={key}
            className={`bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${
              animateValues 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold flex items-center text-white">
                <span className="w-6 h-6 mr-2 text-blue-400">
                  {param.icon}
                </span>
                {param.title}
              </h3>
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                param.value >= param.danger 
                  ? 'text-red-400 animate-pulse' 
                  : param.value >= param.warning 
                    ? 'text-yellow-400' 
                    : 'text-blue-400'
              }`}>
                {typeof param.value === 'number' ? param.value.toFixed(1) : param.value}
                <span className="text-sm ml-1 font-normal text-gray-400">{param.unit}</span>
              </span>
            </div>

            <div className="relative w-full h-5 bg-gray-800/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getStatusColor(param, param.value)}`}
                style={{ width: `${animateValues ? (param.value / param.max) * 100 : 0}%` }}
              ></div>

              <div className="absolute top-0 left-0 w-full h-full flex items-center">
                {param.steps.map((mark, idx) => (
                  <div 
                    key={idx} 
                    className="h-full flex flex-col items-center" 
                    style={{ width: `${100 / param.steps.length}%` }}
                  >
                    <div className="w-px h-2 bg-gray-500/50"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-xs mt-1 text-gray-500 font-medium">
              {param.steps.map((step, idx) => (
                <span key={idx}>
                  {typeof step === 'number' && step % 1 === 0 ? step : step.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom status bar */}
      <div 
        className={`relative z-10 mt-8 max-w-7xl mx-auto bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-blue-900 flex flex-wrap justify-around gap-2 transition-all duration-1000 ${
          animateValues ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} 
        style={{ transitionDelay: '800ms' }}
      >
        <div className="text-center px-4">
          <span className="text-gray-400 text-sm">DATA REFRESH RATE</span>
          <div className="text-xl font-bold text-blue-400">5 Hz</div>
        </div>
        <div className="text-center px-4">
          <span className="text-gray-400 text-sm">SENSOR STATUS</span>
          <div className="text-xl font-bold text-green-400">NORMAL</div>
        </div>
        <div className="text-center px-4">
          <span className="text-gray-400 text-sm">PARAMETERS DISPLAYED</span>
          <div className="text-xl font-bold text-blue-400">{parametersArray.length}</div>
        </div>
        <div className="text-center px-4">
          <span className="text-gray-400 text-sm">DIAGNOSTIC MODE</span>
          <div className="text-xl font-bold text-blue-400">ADVANCED</div>
        </div>
      </div>

      {/* Pulsing activity indicator */}
      <div className="absolute bottom-4 right-4 flex items-center z-10">
        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
        <span className="text-gray-400 text-xs">SENSOR DATA ACTIVE</span>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default AdvancedParameters;