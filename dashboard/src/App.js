import { useState, useEffect } from "react";
import Temperature from "./Components/Temperature/Temperature";
import Analog from "./Components/AnalogOutput/Analog";
import CarDashboard from "./Components/CAN/CarDashboard";
import AdvancedParameters from "./Components/CAN/AdvancedParameters";
import EnhancedParameters from "./Components/CAN/EnhancedParameters";
import Tacometer from "./Components/Tacometer/Tacometer";
import { motion , AnimatePresence } from "framer-motion";
import FFT from "./Components/FFT/FFT";
import VibrationAnalysisDashboard from "./Components/Vibration/VibrationPlot";
import MHI from "../src/Assets/companylogo/MHI.png"
import cmti from "../src/Assets/companylogo/CMTILogo.png"
import { X, Menu, Gauge, Thermometer, Waves, Activity, FileDigit, Settings, Car, ChevronDown, ChevronRight,BatteryMedium , SquareMousePointer, WindArrowDown, Fuel  } from "lucide-react";
import RULAnalysisDashboard from "./Components/RUA/RULAnalysisDashboard";

function App() {
  const [selectedComponent, setSelectedComponent] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showMachineDetails, setShowMachineDetails] = useState(false);

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const detailsTimer = setTimeout(() => {
      setShowMachineDetails(true);
    }, 3500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
      clearTimeout(detailsTimer);
    };
  }, []);

  // Company details for the landing page
  const companyDetails = {
    name: "Central Manufacturing Technology Institute",
    tagline: "( An autonomous R&D Institute under the Ministry of Heavy Industries, Govt. of India )",
    machineModel: "Intellipod : Advanced Vibration and Signal Analysis Device",
    machineDescription: "Intellipod is a high-performance signal acquisition and analysis device designed for real-time monitoring and diagnostics of industrial machinery. It captures vibration, temperature, analog, and digital sensor data to detect and predict faults using advanced AI/ML algorithms. Equipped with 16 analog inputs, 2 analog outputs, 32 programmable digital I/Os, and multiple DAQ cards, Intellipod ensures seamless integration with various sensors. It features dual CAN Bus ports for reliable data acquisition from automotive, aviation, navigation, and industrial systems—making it ideal for AI-driven fault diagnostics across critical sectors."
  };

  // Components mapping
  const components = {
    dashboard: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col items-center w-full"
      >
        {/* Company header section */}
        <div className="w-full flex flex-col items-center relative pb-6 border-b border-blue-800/30">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-4"
          >
            <h1 className="text-3xl md:text-2xl lg:text-5xl font-bold text-blue-400 tracking-wider">{companyDetails.name}</h1>
            <motion.div
              className="h-1 w-40 md:w-60 bg-blue-500 mx-auto mt-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.8 }}
            ></motion.div>
            <p className="text-blue-300 mt-3 text-lg md:text-xl italic">{companyDetails.tagline}</p>
          </motion.div>

          {/* Animated decorative elements */}
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
            <motion.div
              className="absolute top-4 left-8 w-28 h-28 border-2 border-blue-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
                rotate: 360
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-4 right-12 w-20 h-20 border border-blue-500 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0.2, 0.5],
                rotate: -360
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/4 top-1/2 h-1 w-1 bg-blue-400 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              className="absolute right-1/3 top-1/3 h-1 w-1 bg-blue-400 rounded-full"
              animate={{
                y: [0, -15, 0],
                opacity: [0.5, 1, 0.5],
                scale: [1, 2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
            />
          </div>
        </div>

        {/* Machine showcase section */}
        <div className="w-full max-w-7xl mx-auto mt-8 px-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-blue-400">{companyDetails.machineModel}</h2>
            <div className="h-1 w-32 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-10 items-center">
            {/* Machine image */}
            <motion.div
              className="w-full md:w-1/2 aspect-square flex items-center justify-center relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="relative w-full max-w-lg aspect-square">
                {/* Placeholder machine image with animated elements */}
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-900/50 shadow-lg shadow-blue-900/20 overflow-hidden relative">
                  {/* Machine visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4">
                      {/* Control unit */}
                      <motion.div
                        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-black rounded-lg border border-blue-700 flex items-center justify-center shadow-lg"
                        animate={{ boxShadow: ["0 0 10px rgba(59, 130, 246, 0.3)", "0 0 20px rgba(59, 130, 246, 0.6)", "0 0 10px rgba(59, 130, 246, 0.3)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="bg-blue-900/30 w-3/4 h-3/4 rounded-md relative">
                          <motion.div
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"
                            animate={{ backgroundColor: ["#3b82f6", "#60a5fa", "#3b82f6"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute top-2 left-2 w-2 h-2 rounded-full bg-green-500"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          />
                          {/* Screen display */}
                          <div className="absolute top-1/4 left-1/6 right-1/6 bottom-1/4 bg-black/80 rounded-sm overflow-hidden">
                            <motion.div
                              className="h-1 bg-blue-500 opacity-70"
                              animate={{ scaleX: [0, 1, 0], x: ["-100%", "100%", "-100%"] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Decorative circuit lines */}
                      <motion.div
                        className="absolute top-0 left-1/3 w-1 h-1/4 bg-blue-600"
                        initial={{ height: 0 }}
                        animate={{ height: "25%" }}
                        transition={{ duration: 1, delay: 1.6 }}
                      />
                      <motion.div
                        className="absolute top-3/4 left-1/3 w-1 h-1/4 bg-blue-600"
                        initial={{ height: 0 }}
                        animate={{ height: "25%" }}
                        transition={{ duration: 1, delay: 1.8 }}
                      />
                      <motion.div
                        className="absolute top-1/4 left-0 w-1/3 h-1 bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        transition={{ duration: 1, delay: 1.7 }}
                      />
                      <motion.div
                        className="absolute top-3/4 right-0 w-1/3 h-1 bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        transition={{ duration: 1, delay: 1.9 }}
                      />
                    </div>
                  </div>

                  {/* Animated scan line effect */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-blue-500/20 to-transparent"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.5) 25%, rgba(59, 130, 246, 0.5) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.5) 25%, rgba(59, 130, 246, 0.5) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5) 76%, transparent 77%, transparent)",
                    backgroundSize: "50px 50px"
                  }} />
                </div>

                {/* Animated circle around machine */}
                <motion.div
                  className="absolute -inset-4 rounded-full border-2 border-blue-500/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute -inset-8 rounded-full border border-blue-600/20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />

                {/* Technical measurement points */}
                <motion.div
                  className="absolute w-3 h-3 bg-blue-500 rounded-full top-1/4 -left-1 shadow-lg shadow-blue-500/50"
                  animate={{ boxShadow: ["0 0 0 rgba(59, 130, 246, 0.3)", "0 0 10px rgba(59, 130, 246, 0.8)", "0 0 0 rgba(59, 130, 246, 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-3 h-3 bg-blue-500 rounded-full bottom-1/4 -right-1 shadow-lg shadow-blue-500/50"
                  animate={{ boxShadow: ["0 0 0 rgba(59, 130, 246, 0.3)", "0 0 10px rgba(59, 130, 246, 0.8)", "0 0 0 rgba(59, 130, 246, 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                />
              </div>
            </motion.div>

            {/* Machine description */}
            <motion.div
              className="w-full md:w-3/4 lg:w-3/4 mx-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: showMachineDetails ? 1 : 0, x: showMachineDetails ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gray-300 text-lg leading-relaxed">{companyDetails.machineDescription}</p>

              <motion.div
                className="mt-8 space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: showMachineDetails ? 1 : 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl text-blue-400 font-semibold">Key Specifications</h3>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <SpecItem label="CPU" value="Intel® Celeron® J6412 quad core" />
                  <SpecItem label="Storage" value="1 x 2.5 SATA or 1 x M.2 slot)" />
                  <SpecItem label="Sampling Rate" value="1 ~ 192 kS/s" />
                  <SpecItem label="AI/AO/DI/DO Channels" value="4/2/4/4" />
                  <SpecItem label="Input Range" value="±1 V, ±2 V, ±5 V, ±10 V" />
                  <SpecItem label="Memory" value="1 x SDRAM DDR4 3200 MHz (max. 32G)" />
                  <SpecItem label="Resolution" value="24 bits (delta-sigma ADC)" />
                  <SpecItem label="Network (LAN)" value="2 x 10/100/1000/2500 Mbps Ethernet (Intel I226-LM)" />
                </motion.div>

                <motion.div
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full flex items-center space-x-2 font-semibold transition-all"
                    onClick={() => setSelectedComponent("carDashboard")}
                  >
                    <span>Explore System</span>
                    <ChevronDown size={18} />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="w-full h-24 relative mt-16">
          <motion.div
            className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2, duration: 1 }}
          />

          <motion.div
            className="absolute bottom-8 left-8 text-xs text-blue-400/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 2.2, duration: 1 }}
          >
            Intellipod © Central Manufacturing Technology Institute 2025
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-8 text-xs text-blue-400/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 2.3, duration: 1 }}
          >
            v1.0.0 | CMTI
          </motion.div>
        </div>
      </motion.div>
    ),
    fft: <FFT />,
    vibration: <VibrationAnalysisDashboard />,
    temperature: <Temperature />,
    analog: <Analog />,
    carDashboard: <CarDashboard />,
    advancedParams: <AdvancedParameters />,
    enhancedParams: <EnhancedParameters />,
    tacometer: <Tacometer />,
    usefulLife: <RULAnalysisDashboard />
  };

  // Navigation items with icons
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Gauge /> },
    { id: "fft", label: "FFT Analysis", icon: <Activity /> },
    { id: "vibration", label: "Vibration", icon: <Waves /> },
    { id: "temperature", label: "Temperature", icon: <Thermometer /> },
    { id: "analog", label: "Analog Output", icon: <FileDigit /> },
    { 
      id: "canProtocol", 
      label: "CAN bus protocol", 
      icon: <SquareMousePointer />,
      isExpandable: true,
      children: [
        { id: "carDashboard", label: "Engine Condition", icon: <Car /> },
        { id: "advancedParams", label: "Fuel condition", icon: <Fuel /> },
        { id: "enhancedParams", label: "Pressure & Torque", icon: <WindArrowDown /> }
      ]
    },
    { id: "tacometer", label: "Tachometer", icon: <Gauge /> },
    { id: "usefulLife", label: "Remaining Useful Life", icon: <BatteryMedium  /> }
  ];

  const [expandedItems, setExpandedItems] = useState({
    canProtocol: false
  });

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
            rotateZ: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-blue-400 font-bold"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TX
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-4"
        >
          <motion.p
            className="text-blue-400 text-lg"
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing Intellipod System...
          </motion.p>
          <motion.div
            className="h-1 bg-blue-600 mt-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-black text-gray-200 overflow-hidden">
      {/* Custom cursor */}
      <motion.div
        className="fixed w-10 h-10 rounded-full border-2 border-blue-400 pointer-events-none z-50 mix-blend-difference"
        animate={{ x: cursorPosition.x - 20, y: cursorPosition.y - 20 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
      />
      <motion.div
        className="fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-50 opacity-70"
        animate={{ x: cursorPosition.x - 8, y: cursorPosition.y - 8 }}
        transition={{ type: "spring", damping: 15, stiffness: 150 }}
      />
      <motion.div
        className="fixed w-1 h-1 bg-white rounded-full pointer-events-none z-50"
        animate={{ x: cursorPosition.x - 1, y: cursorPosition.y - 1 }}
      />

      {/* Sidebar with brand logo in top-left */}
      <motion.div
      initial={{ x: -280 }}
      animate={{ x: sidebarOpen ? 0 : -280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full w-72 bg-gray-900 border-r border-blue-900 shadow-lg relative z-10"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-b border-blue-900"
      >
        {/* Company logo in top-left corner */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative w-20 h-14 bg-black rounded-lg border border-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg border border-blue-400 opacity-50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-t-2 border-l-2 border-blue-500"
            />
            <motion.div
              animate={{ scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 flex items-center justify-center text-blue-400 font-bold text-xl"
            >
              <img
                src={cmti}
                alt="TechnoVision Dynamics Logo"
                className="w-44 h-14 object-contain"
              />
            </motion.div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-blue-400 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <Settings size={22} className="text-blue-400" />
          </motion.div>
          Central Manufacturing Technology Institute
        </h1>
      </motion.div>

      <div className="py-4 overflow-y-auto h-full">
        {navItems.map((item) => (
          <div key={item.id}>
            <motion.div
              whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              className={`flex items-center px-4 py-3 cursor-pointer ${
                selectedComponent === item.id ? "bg-blue-900/30 border-l-4 border-blue-500" : ""
              }`}
              onClick={() => {
                if (item.isExpandable) {
                  toggleExpand(item.id);
                } else {
                  setSelectedComponent(item.id);
                }
              }}
            >
              <span className="mr-3 text-blue-400">{item.icon}</span>
              <span>{item.label}</span>
              
              {/* Show dropdown arrow for expandable items */}
              {item.isExpandable && (
                <span className="ml-auto text-blue-400">
                  {expandedItems[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
              
              {/* Active indicator dot */}
              {selectedComponent === item.id && !item.isExpandable && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-blue-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </motion.div>
            
            {/* Dropdown menu items */}
            {item.isExpandable && (
              <AnimatePresence>
                {expandedItems[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden bg-gray-800/50"
                  >
                    {item.children.map((child) => (
                      <motion.div
                        key={child.id}
                        whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                        className={`flex items-center pl-10 pr-4 py-2 cursor-pointer ${
                          selectedComponent === child.id ? "bg-blue-900/30 border-l-4 border-blue-500" : ""
                        }`}
                        onClick={() => setSelectedComponent(child.id)}
                      >
                        <span className="mr-3 text-blue-400">{child.icon}</span>
                        <span>{child.label}</span>
                        {selectedComponent === child.id && (
                          <motion.div
                            layoutId="activeSubIndicator"
                            className="ml-auto h-2 w-2 rounded-full bg-blue-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-4 top-12 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10"
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </motion.button>

      {/* Bottom company logo badge */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.5 }}
      >
        <div className="px-3 py-1 rounded-full border border-blue-800/30 text-blue-400/70 text-xs flex items-center">
          <span className="mr-1">Intellipod</span>
          <span className="relative w-2 h-2">
            <motion.span
              className="absolute inset-0 inline-flex rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </span>
          <span className="ml-1">V - 1</span>
        </div>
      </motion.div>
    </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 relative"
      >
        {/* Company logo in top-right corner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute top-4 right-6 flex items-center"
        >
          <div className="w-44 h-14 rounded-lg bg-black border border-blue-600 flex items-center justify-center mr-3 shadow-md shadow-blue-900/30 overflow-hidden">
            <motion.div
              animate={{
                boxShadow: ["0 0 5px rgba(59, 130, 246, 0.3)", "0 0 15px rgba(59, 130, 246, 0.7)", "0 0 5px rgba(59, 130, 246, 0.3)"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full flex items-center justify-center"
            >
              <img
                src={MHI}
                alt="TechnoVision Dynamics Logo"
                className="w-44 h-14 object-contain bg-white"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px"
        }} />

        {/* Content area */}
        <div className="relative z-10">
          {components[selectedComponent]}
        </div>

        {/* Decorative bottom border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        />
      </motion.div>
    </div>
  );
}

// Specification item component for machine specs
function SpecItem({ label, value }) {
  return (
    <motion.div
      className="bg-gray-800/50 border border-blue-900/30 rounded-lg p-3"
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(29, 78, 216, 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-blue-300 font-mono">{value}</span>
      </div>
      <motion.div
        className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden"
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
      >
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default App;