import React, { useState, useRef } from "react";
import {
  Camera,
  Wifi,
  WifiOff,
  Play,
  Square,
  Settings,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface CameraInfo {
  ip: string;
  model: string;
  firmware: string;
  battery: number;
  status: "connected" | "disconnected" | "recording";
}

interface CameraSettings {
  resolution: string;
  quality: string;
  mode: string;
}

const XiaomiYiCameraApp: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<CameraInfo | null>(null);
  const [cameraIP, setCameraIP] = useState("192.168.42.1"); // Default Yi camera IP
  const [streamUrl, setStreamUrl] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<CameraSettings>({
    resolution: "1920x1080",
    quality: "high",
    mode: "video",
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulate camera API calls (replace with actual Yi camera API)
  const connectToCamera = async (ip: string): Promise<boolean> => {
    try {
      setError("");

      // Simulate API call to camera
      const response = await fetch(`http://${ip}/camera-info`, {
        method: "GET",
      });

      if (response.ok) {
        const info = await response.json();
        setCameraInfo({
          ip,
          model: info.model || "Xiaomi Yi Camera",
          firmware: info.firmware || "1.4.13",
          battery: info.battery || 85,
          status: "connected",
        });
        setIsConnected(true);
        setStreamUrl(`http://${ip}:8080/live`);
        return true;
      }
      return false;
    } catch (err) {
      setError(
        "Failed to connect to camera. Please check IP address and network connection."
      );
      return false;
    }
  };

  const startLiveView = async () => {
    if (!cameraInfo) return;

    try {
      // For actual implementation, you would send a command to start live streaming
      const response = await fetch(`http://${cameraInfo.ip}/start-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: settings.resolution }),
      }).catch(() => ({ ok: true })); // Simulate success for demo

      if (response.ok && videoRef.current) {
        // In a real implementation, you'd get the actual stream URL from the camera
        videoRef.current.src = `http://${cameraInfo.ip}:8080/live`;
        videoRef.current.play().catch(() => {
          // Fallback: show placeholder for demo
          setError("Live stream not available in demo mode");
        });
      }
    } catch (err) {
      setError("Failed to start live view");
    }
  };

  const stopLiveView = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  };

  const startRecording = async () => {
    if (!cameraInfo) return;

    try {
      const response = await fetch(`http://${cameraInfo.ip}/start-record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }).catch(() => ({ ok: true }));

      if (response.ok) {
        setIsRecording(true);
        setCameraInfo((prev) =>
          prev ? { ...prev, status: "recording" } : null
        );
      }
    } catch (err) {
      setError("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!cameraInfo) return;

    try {
      const response = await fetch(`http://${cameraInfo.ip}/stop-record`, {
        method: "POST",
      }).catch(() => ({ ok: true }));

      if (response.ok) {
        setIsRecording(false);
        setCameraInfo((prev) =>
          prev ? { ...prev, status: "connected" } : null
        );
      }
    } catch (err) {
      setError("Failed to stop recording");
    }
  };

  const scanForCameras = async () => {
    setIsScanning(true);
    setError("");

    // Simulate scanning for cameras on common IPs
    const commonIPs = ["192.168.42.1", "192.168.1.100", "192.168.0.100"];

    for (const ip of commonIPs) {
      const connected = await connectToCamera(ip);
      if (connected) {
        setCameraIP(ip);
        break;
      }
    }

    if (!isConnected) {
      setError("No Xiaomi Yi cameras found on network");
    }

    setIsScanning(false);
  };

  const disconnect = () => {
    setIsConnected(false);
    setCameraInfo(null);
    setIsRecording(false);
    stopLiveView();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Camera className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Xiaomi Yi Camera Controller</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-400">
                <Wifi className="w-5 h-5 mr-2" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-400">
                <WifiOff className="w-5 h-5 mr-2" />
                <span>Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Camera IP Address
                </label>
                <input
                  type="text"
                  value={cameraIP}
                  onChange={(e) => setCameraIP(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="192.168.42.1"
                  disabled={isConnected}
                />
              </div>

              <div className="flex space-x-2">
                {!isConnected ? (
                  <>
                    <button
                      onClick={() => connectToCamera(cameraIP)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Connect
                    </button>
                    <button
                      onClick={scanForCameras}
                      disabled={isScanning}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isScanning ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={disconnect}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Camera Info */}
            {cameraInfo && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="font-semibold mb-3">Camera Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model:</span>
                    <span>{cameraInfo.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Firmware:</span>
                    <span>{cameraInfo.firmware}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Battery:</span>
                    <span className="text-green-400">
                      {cameraInfo.battery}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={
                        cameraInfo.status === "recording"
                          ? "text-red-400"
                          : cameraInfo.status === "connected"
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      {cameraInfo.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live View */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live View</h2>
              <div className="flex space-x-2">
                {isConnected && (
                  <>
                    <button
                      onClick={startLiveView}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Preview
                    </button>
                    <button
                      onClick={stopLiveView}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {isConnected ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted
                  autoPlay
                  onError={() => {
                    // Show placeholder when video fails to load
                    const placeholder = document.createElement("div");
                    placeholder.className =
                      "w-full h-full flex items-center justify-center text-gray-400";
                    placeholder.innerHTML =
                      '<div class="text-center"><div class="w-16 h-16 mx-auto mb-4 opacity-50"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg></div><p>Live stream placeholder</p><p class="text-sm mt-2">Camera feed would appear here</p></div>';
                    if (videoRef.current && videoRef.current.parentNode) {
                      videoRef.current.style.display = "none";
                      videoRef.current.parentNode.appendChild(placeholder);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Connect to camera to view live stream</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            {isConnected && (
              <div className="mt-4 flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Square className="w-4 h-4 mr-3 fill-current" />
                    Stop Recording
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {isConnected && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-semibold">Camera Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resolution
                </label>
                <select
                  value={settings.resolution}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      resolution: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3840x2160">4K (3840x2160)</option>
                  <option value="1920x1080">Full HD (1920x1080)</option>
                  <option value="1280x720">HD (1280x720)</option>
                  <option value="640x480">VGA (640x480)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      quality: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <select
                  value={settings.mode}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, mode: e.target.value }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video">Video</option>
                  <option value="photo">Photo</option>
                  <option value="timelapse">Time Lapse</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XiaomiYiCameraApp;
