import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Gauge, PieChart, Activity } from 'lucide-react';
import axios from 'axios';

export default function Tachometer() {
    // State for RPM and pulse data
    const [rpm, setRpm] = useState(0);
    const [pulseData, setPulseData] = useState([]);
    const [orderAnalysis, setOrderAnalysis] = useState({
        o1: 0,
        o2: 0,
        o3: 0
    });

    // Fetch data from APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch RPM and order analysis data
                const rpmResponse = await axios.get('https://cmti-edge.online/SpindleVibration/RPM.php');
                const rpmData = rpmResponse.data;
                
                setRpm(rpmData.R1 || 0);
                setOrderAnalysis({
                    o1: rpmData.O1 || 0,
                    o2: rpmData.O2 || 0,
                    o3: rpmData.O3 || 0
                });
                
                // Fetch pulse data
                const pulseResponse = await axios.get('https://cmti-edge.online/intelipod/VibrationData.php');
                
                // Process the V4 array data
                if (pulseResponse.data && 
                    pulseResponse.data.success && 
                    pulseResponse.data.data && 
                    pulseResponse.data.data.length > 0 &&
                    pulseResponse.data.data[0].V4) {
                    
                    // Get the V4 array from the response
                    const v4Array = pulseResponse.data.data[0].V4;
                    
                    if (Array.isArray(v4Array) && v4Array.length > 0) {
                        // Generate data points with proper formatting for the chart
                        const newPulseData = v4Array.map((value, index) => ({
                            time: index,
                            value: value
                        }));
                        
                        // Set the pulse data directly from the API
                        setPulseData(newPulseData);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Initial fetch
        fetchData();
        
        // Set interval for continuous data fetching
        const interval = setInterval(fetchData, 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Calculate RPM percentage for circular gauge
    const rpmPercentage = (rpm / 8000) * 100;
    
    return (
        <div className="flex flex-col w-full h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 p-4 font-sans">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">TACHOMETER</h1>
                <div className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString()}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
                <div className="grid grid-cols-1 gap-6">
                    {/* RPM Gauge - Modern Circular Style */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <Gauge className="w-5 h-5 text-indigo-500 mr-2" />
                                <h2 className="text-xl font-semibold">RPM Meter</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Max 8000</span>
                        </div>
                        
                        <div className="flex justify-center items-center my-4 relative">
                            {/* Modern circular gauge */}
                            <div className="relative w-64 h-64">
                                {/* Background circle */}
                                <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
                                
                                {/* Colored progress arc */}
                                <svg className="absolute inset-0" viewBox="0 0 100 100">
                                    <path 
                                        d="M50,10 A40,40 0 1,1 49.999,10" 
                                        fill="none" 
                                        stroke="url(#gradient)" 
                                        strokeWidth="8"
                                        strokeDasharray={`${rpmPercentage * 2.51} 251`}
                                        transform="rotate(-90 50 50)"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#4f46e5" />
                                            <stop offset="100%" stopColor="#c026d3" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                
                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col justify-center items-center">
                                    <span className="text-4xl font-bold">{rpm.toLocaleString()}</span>
                                    <span className="text-xl text-gray-500 dark:text-gray-400">RPM</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* RPM zones indicator */}
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4">
                            <span>Idle</span>
                            <span>Normal</span>
                            <span>Sport</span>
                            <span>Danger</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div className="flex h-full">
                                <div className="w-1/4 bg-green-400"></div>
                                <div className="w-1/4 bg-blue-400"></div>
                                <div className="w-1/4 bg-amber-400"></div>
                                <div className="w-1/4 bg-red-400"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Analysis Cards - Horizontal Layout */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <PieChart className="w-5 h-5 text-indigo-500 mr-2" />
                            <h2 className="text-xl font-semibold">Order Analysis</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {/* O1 Card */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium">Order 1</span>
                                    <span className="font-bold text-indigo-500">{orderAnalysis.o1}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${Math.min(orderAnalysis.o1, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* O2 Card */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium">Order 2</span>
                                    <span className="font-bold text-purple-500">{orderAnalysis.o2}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500"
                                        style={{ width: `${Math.min(orderAnalysis.o2, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* O3 Card */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium">Order 3</span>
                                    <span className="font-bold text-pink-500">{orderAnalysis.o3}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-pink-500"
                                        style={{ width: `${Math.min(orderAnalysis.o3, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Pulse Plot - Full Height on Right Side */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col">
                    <div className="flex items-center mb-4">
                        <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                        <h2 className="text-xl font-semibold">Pulse Plot</h2>
                    </div>
                    
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={pulseData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="time" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#pulseGradient)"
                                    strokeWidth={1.5}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                                <defs>
                                    <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="100%" stopColor="#c026d3" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
                        <div>
                            <div className="font-medium">Data Points</div>
                            <div className="text-lg font-bold text-indigo-500">
                                {pulseData.length}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium">Average</div>
                            <div className="text-lg font-bold text-purple-500">
                                {pulseData.length > 0 
                                    ? (pulseData.reduce((acc, point) => acc + point.value, 0) / pulseData.length).toFixed(2)
                                    : "0.00"}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium">Max Value</div>
                            <div className="text-lg font-bold text-pink-500">
                                {pulseData.length > 0 
                                    ? Math.max(...pulseData.map(point => point.value)).toFixed(2)
                                    : "0.00"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Tachometer Dashboard · Real-time Engine Analysis
            </footer>
        </div>
    );
}