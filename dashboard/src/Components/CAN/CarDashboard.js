import React, { useEffect, useState } from 'react';
import {
    Gauge, Activity, Battery, Wind, Clock, Fuel, Thermometer, BarChart3, TrendingUp, Sliders, RotateCcw} from 'lucide-react';
import Car from "../../Assets/bgVideos/Car.mp4"

const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const [animateValues, setAnimateValues] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Start animations after component mounts
        setTimeout(() => {
            setAnimateValues(true);
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);



    const vehicleData = {
        timeSinceEngineStart: "00:13:08",
        intakeManifoldAbsolutePressure: 55.00,
        engineRPM: 849.50,
        engineCoolantTemperature: 81.00,
        vehicleSpeed: 180.00,
        throttlePosition: 15.60,
        intakeAirTemperature: 55.00,
        calculatedEngineLoad: 27.60,
        fuelTankLevel: 91.41,
        barometricPressure: 90.00,
        moduleVoltage: 13.64,
        absoluteLoadValue: 32.80,
        ambientAirTemperature: 40.00
    };

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
        }
    };

    // Data for the gauges


    // Calculate RPM percentage for gauge (assuming max RPM is 8000)
    const rpmPercentage = (vehicleData.engineRPM / 8000) * 100;

    // Format time
    const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Format date
    const formattedDate = time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    

    return (
        <div className="relative w-auto h-screen overflow-hidden bg-black text-white">
            {/* Background video with overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black bg-opacity-35 z-10"></div>
                <video
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                >
                    <source src={Car} type="video/mp4" />
                </video>
            </div>

            {/* Dashboard content */}
            <div className="relative z-20 w-auto h-full p-6 flex flex-col">

                {/* Header with time and date */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-6 h-6 text-blue-400" />
                        <div>
                            <div className="text-3xl font-bold text-blue-400">{formattedTime}</div>
                            <div className="text-gray-400">{formattedDate}</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400">Intellipod V-1</div>
                        <div className="text-gray-400">Advanced Control System</div>
                    </div>
                </div>

                {/* Main dashboard */}
                <div className="flex-1 grid grid-cols-12 gap-5">

                    {/* Left panel */}
                    <div className="col-span-3 flex flex-col space-y-6">
                        {/* RPM Gauge */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Activity className="w-6 h-6 mr-3 text-blue-400" />
                                    ENGINE RPM
                                </h3>
                                <span className={`text-3xl font-bold transition-colors duration-300 ${vehicleData.engineRPM > 6000 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                                    }`}>
                                    {vehicleData.engineRPM.toFixed(0)}
                                </span>
                            </div>

                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${rpmPercentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        rpmPercentage > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-blue-400 to-blue-600'
                                        }`}
                                    style={{ width: `${animateValues ? rpmPercentage : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                                    {[0, 2000, 4000, 6000, 8000].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center justify-between">
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>0</span>
                                <span>2000</span>
                                <span>4000</span>
                                <span>6000</span>
                                <span>8000</span>
                            </div>
                        </div>

                        {/* Engine Temperature */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                                }`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Thermometer className="w-6 h-6 mr-3 text-blue-400" />
                                    ENGINE TEMP
                                </h3>
                                <span className={`text-3xl font-bold transition-colors duration-300 ${vehicleData.engineCoolantTemperature > 95 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                                    }`}>
                                    {vehicleData.engineCoolantTemperature}°C
                                </span>
                            </div>

                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${vehicleData.engineCoolantTemperature > 95 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        vehicleData.engineCoolantTemperature > 85 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-blue-400 to-blue-600'
                                        }`}
                                    style={{ width: `${animateValues ? (vehicleData.engineCoolantTemperature / 120) * 100 : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                                    {[0, 40, 80, 120].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center justify-between">
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>0°C</span>
                                <span>40°C</span>
                                <span>80°C</span>
                                <span>120°C</span>
                            </div>
                        </div>

                        {/* Fuel Level */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                                }`}
                            style={{ transitionDelay: '400ms' }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Fuel className="w-6 h-6 mr-3 text-blue-400" />
                                    FUEL LEVEL
                                </h3>
                                <span className={`text-3xl font-bold transition-colors duration-300 ${vehicleData.fuelTankLevel < 20 ? 'text-red-400' : 'text-blue-400'
                                    }`}>
                                    {vehicleData.fuelTankLevel.toFixed(1)}%
                                </span>
                            </div>

                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${vehicleData.fuelTankLevel < 20 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        vehicleData.fuelTankLevel < 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-green-400 to-green-600'
                                        }`}
                                    style={{ width: `${animateValues ? vehicleData.fuelTankLevel : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                                    {[0, 25, 50, 75, 100].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center" style={{ width: '20%' }}>
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>E</span>
                                <span>1/4</span>
                                <span>1/2</span>
                                <span>3/4</span>
                                <span>F</span>
                            </div>
                        </div>
                    </div>

                    {/* Center speedometer */}
                    <div className="col-span-6 flex flex-col items-center justify-center">
                        <div className={`relative w-96 h-96 transition-all duration-1000 ${animateValues ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Outer glowing ring */}
                                <div className="absolute inset-0 rounded-full opacity-20 animate-pulse bg-blue-500 blur-md"></div>

                                <svg className="w-full h-full" viewBox="0 0 200 200">
                                    {/* Subtle radial background gradient */}
                                    <defs>
                                        <radialGradient id="speedBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" stopColor="#111827" />
                                            <stop offset="85%" stopColor="#0f172a" />
                                            <stop offset="100%" stopColor="#020617" />
                                        </radialGradient>

                                        {/* Glowing effect for progress arc */}
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>

                                        {/* Linear gradient for progress arc */}
                                        <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="50%" stopColor="#60a5fa" />
                                            <stop offset="100%" stopColor="#93c5fd" />
                                        </linearGradient>
                                    </defs>

                                    {/* Base circle background */}
                                    <circle cx="100" cy="100" r="92" fill="url(#speedBg)" />

                                    {/* Tick marks for speed increments - fixed spacing */}
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        // Use 270 degrees range (from -135 to +135)
                                        const rotation = -135 + (i * (250 / 27));
                                        return (
                                            <line
                                                key={i}
                                                x1="100"
                                                y1="20"
                                                x2="100"
                                                y2={i % 4 === 0 ? "30" : "25"}
                                                stroke={i % 4 === 0 ? "#3b82f6" : "#475569"}
                                                strokeWidth={i % 4 === 0 ? "2" : "1"}
                                                transform={`rotate(${rotation} 100 100)`}
                                            />
                                        );
                                    })}

                                    {/* Outer decorative ring */}
                                    <circle cx="100" cy="100" r="88" fill="none" stroke="#0f172a" strokeWidth="8" />
                                    <circle cx="100" cy="100" r="88" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" />

                                    {/* Speed gauge track - corrected arc length for 270 degrees */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="88"
                                        fill="none"
                                        stroke="#334155"
                                        strokeWidth="8"
                                        strokeDasharray="415"
                                        strokeDashoffset="0"
                                        transform="rotate(-135 100 100)"
                                        strokeLinecap="round"
                                    />

                                    {/* Speed gauge progress - animated arc with proper arc calculation */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="88"
                                        fill="none"
                                        stroke="url(#speedGradient)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="415"
                                        strokeDashoffset={415 - ((vehicleData.vehicleSpeed / 240) * 415)}
                                        transform="rotate(-135 100 100)"
                                        filter="url(#glow)"
                                        className="transition-all duration-700 ease-out"
                                    />

                                    {/* Inner decorative elements */}
                                    <circle cx="100" cy="100" r="75" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                                    <circle cx="100" cy="100" r="70" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="1 3" />
                                    <circle cx="100" cy="100" r="65" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="60"
                                        fill="none"
                                        stroke="#1e40af"
                                        strokeWidth="0.5"
                                        strokeDasharray="30 5"
                                        strokeDashoffset={animateValues ? "0" : "35"}
                                        className="transition-all duration-3000 ease-out"
                                    />

                                    {/* Center hub */}
                                    <circle cx="100" cy="100" r="8" fill="#1e40af" />
                                    <circle cx="100" cy="100" r="6" fill="#3b82f6" />
                                    <circle cx="100" cy="100" r="3" fill="#93c5fd" className="animate-pulse" />
                                </svg>

                                {/* Speed needle - corrected rotation calculation */}
                                <div
                                    className="absolute w-1 h-32 origin-bottom transition-transform duration-700 ease-out top-16"
                                    style={{
                                        transform: `rotate(${-135 + (vehicleData.vehicleSpeed / 270) * 310}deg)`,
                                        background: "linear-gradient(to top, #3b82f6 10%, #60a5fa 70%, #93c5fd 100%)"
                                    }}
                                >
                                    <div className="absolute -left-1 top-0 w-3 h-3 bg-white rounded-full shadow-lg shadow-blue-500/50"></div>
                                </div>

                                {/* Digital display background */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center top-28">
                                    <div className="bg-gray-900 bg-opacity-70 rounded-xl px-4 py-2 backdrop-blur-sm border border-blue-900/30">
                                        <span className="text-2xl font-bold text-white drop-shadow-md">
                                            {Math.round(vehicleData.vehicleSpeed)}
                                        </span>
                                        <span className="text-lg font-medium text-blue-400 ml-1">km/h</span>
                                        <div className="text-xs text-gray-400 mt-1 font-light tracking-wider">VELOCITY</div>
                                    </div>
                                </div>
                            </div>

                            {/* Speed markers with correct positioning for 270 degree arc */}
                            <div className="absolute inset-0 ">
                                {[0, 40, 80, 120, 160, 200, 240].map((speed, index) => {
                                    // Calculate angle for 270 degree arc from -135 to +135
                                    const angle = (-225 + (index * (270 / 6))) * Math.PI / 180;
                                    const radius = 210;
                                    return (
                                        <div
                                            key={index}
                                            className={`absolute text-xs font-semibold ${speed > 160 ? 'text-red-400' : 'text-blue-300'}`}
                                            style={{
                                                left: `${190 + radius * Math.cos(angle)}px`,
                                                top: `${190 + radius * Math.sin(angle)}px`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        >
                                            <div className="backdrop-blur-sm bg-gray-900/30 rounded px-1.5 py-0.5 border border-gray-700/30">
                                                {speed}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Additional decorative elements */}
                            <div className="absolute top-8 left-0 w-full flex justify-center">
                                <div className="text-xs text-blue-400 uppercase tracking-widest font-light bg-gray-900/40 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-900/20">
                                    MAX 240
                                </div>
                            </div>

                            {/* Bottom label with glowing effect */}
                            <div className="absolute bottom-1 left-0 w-full flex justify-center">
                                <div className="text-xs text-blue-200 font-medium bg-blue-900/20 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-500/20 shadow-sm shadow-blue-500/30">
                                    NEXUS-Z SPEEDOMETER
                                </div>
                            </div>
                        </div>

                        {/* Additional information under speedometer */}
                        <div className={`mt-8 grid grid-cols-3 gap-4 w-full text-center transition-all duration-1000 ${animateValues ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">ENGINE LOAD</div>
                                <div className="text-2xl font-bold text-blue-400">{vehicleData.calculatedEngineLoad}%</div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">RUNTIME</div>
                                <div className="text-2xl font-bold text-blue-400">{vehicleData.timeSinceEngineStart}</div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">THROTTLE</div>
                                <div className="text-2xl font-bold text-blue-400">{vehicleData.throttlePosition}%</div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">FUEL PRESSURE</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.fuelPressure.value} {unusedParameters.fuelPressure.unit}
                                </div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">AIR FLOW RATE</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.mafAirFlowRate.value} {unusedParameters.mafAirFlowRate.unit}
                                </div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">RAIL PRESSURE (VAC)</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.fuelRailPressureRelativeToManifoldVacuum.value} {unusedParameters.fuelRailPressureRelativeToManifoldVacuum.unit}
                                </div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">RAIL GAUGE PRESS</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.fuelRailGaugePressure.value} {unusedParameters.fuelRailGaugePressure.unit}
                                </div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">COMMANDED EGR</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.commandedEGR.value} {unusedParameters.commandedEGR.unit}
                                </div>
                            </div>
                            <div className="bg-gray-900 bg-opacity-60 rounded-xl p-3 border border-blue-900">
                                <div className="text-gray-400 mb-1 text-sm">AIR/FUEL RATIO</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {unusedParameters.commandedAirFuelEquivalenceRatio.value} {unusedParameters.commandedAirFuelEquivalenceRatio.unit}
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Right panel */}
                    <div className="col-span-3 flex flex-col space-y-8">
                        {/* Voltage */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Battery className="w-6 h-6 mr-3 text-blue-400" />
                                    VOLTAGE
                                </h3>
                                <span className={`text-3xl font-bold transition-colors duration-300 ${vehicleData.moduleVoltage < 12 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                                    }`}>
                                    {vehicleData.moduleVoltage.toFixed(1)}V
                                </span>
                            </div>

                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${vehicleData.moduleVoltage < 12 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        vehicleData.moduleVoltage < 12.5 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-green-400 to-green-600'
                                        }`}
                                    style={{ width: `${animateValues ? ((vehicleData.moduleVoltage - 10) / 5) * 100 : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                                    {[10, 12, 14, 15].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center justify-between">
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>10V</span>
                                <span>12V</span>
                                <span>14V</span>
                                <span>15V</span>
                            </div>
                        </div>

                        {/* Intake Temperature */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                                }`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Wind className="w-6 h-6 mr-3 text-blue-400" />
                                    INTAKE TEMP
                                </h3>
                                <span className={`text-3xl font-bold transition-colors duration-300 ${vehicleData.intakeAirTemperature > 60 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                                    }`}>
                                    {vehicleData.intakeAirTemperature}°C
                                </span>
                            </div>
                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${vehicleData.intakeAirTemperature > 60 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        vehicleData.intakeAirTemperature > 45 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                            'bg-gradient-to-r from-blue-400 to-blue-600'
                                        }`}
                                    style={{ width: `${animateValues ? (vehicleData.intakeAirTemperature / 80) * 100 : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                                    {[0, 20, 40, 60, 80].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center justify-between">
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>0°C</span>
                                <span>20°C</span>
                                <span>40°C</span>
                                <span>60°C</span>
                                <span>80°C</span>
                            </div>
                        </div>

                        {/* Pressure */}
                        <div
                            className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-700 transform ${animateValues ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                                }`}
                            style={{ transitionDelay: '400ms' }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center text-white">
                                    <Gauge className="w-6 h-6 mr-3 text-blue-400" />
                                    MAP PRESSURE
                                </h3>
                                <span className="text-3xl font-bold text-blue-400">
                                    {vehicleData.intakeManifoldAbsolutePressure} kPa
                                </span>
                            </div>

                            <div className="relative w-full h-6 bg-gray-800/60 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                                    style={{ width: `${animateValues ? (vehicleData.intakeManifoldAbsolutePressure / 120) * 100 : 0}%` }}
                                ></div>

                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-around">
                                    {[0, 30, 60, 90, 120].map((mark, idx) => (
                                        <div key={idx} className="h-full flex flex-col items-center justify-between">
                                            <div className="w-px h-2 bg-gray-500/50"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 text-gray-400 font-medium">
                                <span>0 kPa</span>
                                <span>30 kPa</span>
                                <span>60 kPa</span>
                                <span>90 kPa</span>
                                <span>120 kPa</span>
                            </div>
                        </div>
                    </div>

                    
                </div>

                <enhancedParameters/>

                {/* Bottom status bar */}
                <div className={`mt-6 bg-gray-900 bg-opacity-60 rounded-2xl p-4 border border-blue-900 grid grid-cols-6 gap-4 transition-all duration-1000 ${animateValues ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">AMBIENT TEMP</span>
                        <span className="text-xl font-bold text-blue-400">{vehicleData.ambientAirTemperature}°C</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">BARO PRESSURE</span>
                        <span className="text-xl font-bold text-blue-400">{vehicleData.barometricPressure} kPa</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">ABS LOAD</span>
                        <span className="text-xl font-bold text-blue-400">{vehicleData.absoluteLoadValue}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">SYSTEM STATUS</span>
                        <span className="text-xl font-bold text-green-400">NORMAL</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">DRIVE MODE</span>
                        <span className="text-xl font-bold text-blue-400">ECO</span>
                    </div>
                </div>

                {/* Pulsing activity indicator */}
                <div className="absolute bottom-4 right-10 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    <span className="text-gray-400 text-xs">TELEMETRY ACTIVE</span>
                </div>
            </div>
            
        </div>
    );
};

export default Dashboard;