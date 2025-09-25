import React, { useState } from 'react';
import { Play, RefreshCw, Activity, TrendingDown, AlertTriangle, CheckCircle, Maximize2, ZoomIn, ZoomOut, Download, X, BarChart3, Zap, Clock, Database } from 'lucide-react';

const RULAnalysisDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());

    // Image viewer states
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const executeAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('https://intellipod.online/Backend/backendPHP/run_new_file.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: 1 })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setResult(data);
                setImageTimestamp(Date.now());
            } else {
                setError(data.message || 'Analysis failed');
            }
        } catch (err) {
            setError('Failed to connect to the server: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const parseOutput = (output) => {
        if (!output) return null;

        const lines = output.split('\n').filter(line => line.trim());
        const parsed = {};

        lines.forEach(line => {
            if (line.includes('Estimated failure time:')) {
                parsed.failureTime = line.split(':')[1].trim();
            }
            if (line.includes('Remaining Useful Life (RUL):')) {
                parsed.rul = line.split(':')[1].trim().replace(' units', '');
            }
            if (line.includes('shape')) {
                parsed.dataShape = line.match(/\((\d+),\s*(\d+)\)/)?.[0];
            }
        });

        return parsed;
    };

    // Image viewer functions
    const openFullscreen = (imageSrc, title) => {
        setFullscreenImage({ src: imageSrc, title });
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const closeFullscreen = () => {
        setFullscreenImage(null);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.25, 5));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.25, 0.25));
    };

    const downloadImage = async (imageSrc, filename) => {
        try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - imagePosition.x,
                y: e.clientY - imagePosition.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const MetricCard = ({ icon: Icon, title, value, subtitle, gradient, iconColor }) => (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    </div>
                </div>
                <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>
                <p className="text-white text-2xl font-bold mb-1">{value}</p>
                {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
            </div>
        </div>
    );

    const ImageCard = ({ src, alt, title, icon: Icon, gradient }) => (
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white text-xl font-bold">{title}</h3>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => openFullscreen(src, title)}
                            className="group/btn p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-110"
                            title="Full Screen"
                        >
                            <Maximize2 className="w-4 h-4 text-blue-400 group-hover/btn:text-blue-300 transition-colors" />
                        </button>
                        <button
                            onClick={() => downloadImage(src, `${alt.toLowerCase().replace(/\s+/g, '_')}.png`)}
                            className="group/btn p-3 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-110"
                            title="Download"
                        >
                            <Download className="w-4 h-4 text-emerald-400 group-hover/btn:text-emerald-300 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl ring-1 ring-slate-900/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-auto relative z-10 transition-transform duration-500"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                            <p className="text-slate-400">Failed to load {alt.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const outputData = result ? parseOutput(result.output) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl animate-bounce delay-2000"></div>
            </div>

            <div className="relative z-10 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            {/* <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/25">
                <Activity className="w-12 h-12 text-white" />
              </div> */}
                            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                RUL Analysis
                            </h1>
                        </div>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            Advanced Remaining Useful Life prediction powered by machine learning clustering and intelligent health index analysis
                        </p>
                    </div>

                    {/* Execute Button */}
                    <div className="mb-12 flex justify-center">
                        <button
                            onClick={executeAnalysis}
                            disabled={isLoading}
                            className="group relative overflow-hidden px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-4">
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-7 h-7 animate-spin" />
                                        <span>Analyzing System Health...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-7 h-7 transition-transform group-hover:scale-110" />
                                        <span>Execute RUL Analysis</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-12 max-w-2xl mx-auto">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/50 to-red-800/50 border border-red-500/50 p-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-500/5"></div>
                                <div className="relative flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-red-500/20">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-red-100 font-bold text-lg mb-2">Analysis Error</h3>
                                        <p className="text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-12">
                            {/* Status Card */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-slate-700/50 p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-blue-600/5"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Analysis Complete</h2>
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                                            <span className="text-emerald-400 text-sm font-medium">Live</span>
                                        </div>
                                    </div>

                                    {outputData && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {outputData.dataShape && (
                                                <MetricCard
                                                    icon={Database}
                                                    title="Dataset Shape"
                                                    value={outputData.dataShape}
                                                    subtitle="Data points analyzed"
                                                    gradient="from-blue-600 to-cyan-600"
                                                />
                                            )}

                                            {outputData.failureTime && (
                                                <MetricCard
                                                    icon={Clock}
                                                    title="Estimated Failure Time"
                                                    value={outputData.failureTime}
                                                    subtitle="Predicted failure point"
                                                    gradient="from-orange-600 to-red-600"
                                                />
                                            )}

                                            {outputData.rul && (
                                                <MetricCard
                                                    icon={Zap}
                                                    title="Remaining Useful Life"
                                                    value={`${outputData.rul} Hrs`}
                                                    subtitle="Operational lifespan remaining"
                                                    gradient="from-emerald-600 to-teal-600"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <ImageCard
                                    src={`https://intellipod.online/Backend/base_model/health_index_plot.png?t=${imageTimestamp}`}
                                    alt="Health Index Plot"
                                    title="Health Index Over Time"
                                    icon={TrendingDown}
                                    gradient="from-blue-600 to-indigo-600"
                                />

                                <ImageCard
                                    src={`https://intellipod.online/Backend/base_model/rul_estimate.png?t=${imageTimestamp}`}
                                    alt="RUL Estimate Plot"
                                    title="RUL Estimation Analysis"
                                    icon={BarChart3}
                                    gradient="from-purple-600 to-pink-600"
                                />
                            </div>

                            {/* Raw Output */}
                            <details className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <summary className="relative cursor-pointer p-8 font-bold text-xl text-white hover:text-blue-100 transition-colors list-none">
                                    <div className="flex items-center gap-4">
                                        {/* Custom Triangle Indicator */}
                                        <div className="relative flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-slate-400 transition-transform duration-300 group-open:rotate-90"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        {/* Icon */}
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                                            <Activity className="w-6 h-6 text-white" />
                                        </div>

                                        {/* Title */}
                                        <span className="text-white">Raw Analysis Output</span>

                                        {/* Expand hint */}
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="text-sm text-slate-400 font-normal">Click to expand</span>
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        </div>
                                    </div>
                                </summary>

                                <div className="relative px-8 pb-8">
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/30 shadow-2xl">
                                        {/* Header bar */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                                                </div>
                                                <span className="text-slate-400 text-sm font-mono">analysis_output.log</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                <span>Live Output</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <pre className="text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                                {result.output}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-20 pt-12 border-t border-slate-700/50 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <p className="text-slate-400 text-lg">
                                Powered by K-Means clustering and logarithmic degradation modeling
                            </p>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-500"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Header with controls */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                        <h3 className="text-2xl font-bold text-white">{fullscreenImage.title}</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleZoomOut}
                                className="p-3 rounded-xl bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <div className="px-4 py-2 bg-black/50 text-white text-sm rounded-xl">
                                {Math.round(zoomLevel * 100)}%
                            </div>
                            <button
                                onClick={handleZoomIn}
                                className="p-3 rounded-xl bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => downloadImage(fullscreenImage.src, `${fullscreenImage.title.toLowerCase().replace(/\s+/g, '_')}.png`)}
                                className="p-3 rounded-xl bg-emerald-600/50 hover:bg-emerald-600/70 text-white transition-all duration-300 hover:scale-110"
                                title="Download"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={closeFullscreen}
                                className="p-3 rounded-xl bg-red-600/50 hover:bg-red-600/70 text-white transition-all duration-300 hover:scale-110"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Image container */}
                    <div
                        className="relative overflow-hidden w-full h-full flex items-center justify-center"
                        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                    >
                        <img
                            src={fullscreenImage.src}
                            alt={fullscreenImage.title}
                            className="max-w-none transition-transform duration-200 rounded-2xl shadow-2xl"
                            style={{
                                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                                maxHeight: zoomLevel === 1 ? '85vh' : 'none',
                                maxWidth: zoomLevel === 1 ? '85vw' : 'none'
                            }}
                            onMouseDown={handleMouseDown}
                            draggable={false}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-6 py-3 rounded-xl">
                        {zoomLevel > 1 ? 'Drag to pan • ' : ''}Use zoom controls or mouse wheel to zoom
                    </div>
                </div>
            )}
        </div>
    );
};

export default RULAnalysisDashboard;