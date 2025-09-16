import { useState, useEffect, useRef } from 'react';

export default function SpamWebhookApp() {
  // State management
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');
  const [spamCount, setSpamCount] = useState(10);
  const [delay, setDelay] = useState(1000);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isSpamming, setIsSpamming] = useState(false);
  const [logs, setLogs] = useState<Array<{type: 'success' | 'error', message: string, timestamp: Date}>>([]);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageSpam, setIsImageSpam] = useState(false);

  const spamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Statistics
  const successRate = totalToSend > 0 ? ((sentCount / totalToSend) * 100).toFixed(2) : '0.00';

  // Webhook sending function
  const sendWebhook = async (content: string | File) => {
    try {
      const formData = new FormData();
      
      if (typeof content === 'string') {
        formData.append('content', content);
      } else {
        formData.append('file', content);
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSentCount(prev => prev + 1);
        setLogs(prev => [...prev, {
          type: 'success',
          message: typeof content === 'string' 
            ? `Success: ${content.substring(0, 50)}...` 
            : `Success: File ${content.name} sent`,
          timestamp: new Date()
        }]);
        return true;
      } else {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      setFailedCount(prev => prev + 1);
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
      return false;
    }
  };

  // Start/Stop spam function
  const toggleSpam = () => {
    if (isSpamming) {
      // Stop spamming
      if (spamIntervalRef.current) {
        clearInterval(spamIntervalRef.current);
        spamIntervalRef.current = null;
      }
      setIsSpamming(false);
      setLogs(prev => [...prev, {
        type: 'success',
        message: 'Spamming stopped',
        timestamp: new Date()
      }]);
    } else {
      // Start spamming
      if (!webhookUrl) {
        setLogs(prev => [...prev, {
          type: 'error',
          message: 'Error: Webhook URL is required',
          timestamp: new Date()
        }]);
        return;
      }

      setIsSpamming(true);
      setTotalToSend(isUnlimited ? Infinity : spamCount);
      setSentCount(0);
      setFailedCount(0);

      setLogs(prev => [...prev, {
        type: 'success',
        message: `Spamming started${isUnlimited ? ' (unlimited)' : ` (${spamCount} messages)`}`,
        timestamp: new Date()
      }]);

      let sent = 0;
      const target = isUnlimited ? Infinity : spamCount;

      const spamFunc = async () => {
        if (sent >= target && !isUnlimited) {
          if (spamIntervalRef.current) {
            clearInterval(spamIntervalRef.current);
          }
          setIsSpamming(false);
          return;
        }

        if (isImageSpam && selectedFile) {
          await sendWebhook(selectedFile);
        } else {
          await sendWebhook(message);
        }
        
        sent++;
      };

      // Initial call
      spamFunc();
      
      // Set interval for subsequent calls
      spamIntervalRef.current = setInterval(spamFunc, delay);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spamIntervalRef.current) {
        clearInterval(spamIntervalRef.current);
      }
    };
  }, []);

  // File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setIsImageSpam(true);
      setLogs(prev => [...prev, {
        type: 'success',
        message: `File selected: ${file.name}`,
        timestamp: new Date()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="font-bold text-xl text-white">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Abiel's Webhook Spammer</h1>
                  <p className="text-sm text-gray-600">Powerful Webhook Testing Tool</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <a 
                  href="https://youtube.com/@abielsamp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  YouTube
                </a>
                <a 
                  href="https://discord.gg/QtkHyW9TWu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2 rounded-lg transition-all duration-200 flex items-center text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
                  </svg>
                  Discord
                </a>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Control Panel</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">Webhook URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message to spam..."
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">Or Upload File/Image</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:bg-gray-100 file:border-0 file:text-gray-700 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:hover:bg-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Spam Count</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={spamCount}
                    onChange={(e) => setSpamCount(parseInt(e.target.value) || 1)}
                    disabled={isUnlimited}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-60 disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Delay (ms)</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={delay}
                    onChange={(e) => setDelay(parseInt(e.target.value) || 1000)}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center bg-gray-100 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="unlimited"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="unlimited" className="ml-3 text-sm font-medium text-gray-700">Unlimited Mode</label>
              </div>

              <button
                onClick={toggleSpam}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isSpamming 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                }`}
              >
                {isSpamming ? '🛑 Stop Spamming' : '🚀 Start Spamming'}
              </button>
            </div>
          </div>

          {/* Statistics Panel */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-600">Live Statistics</h2>
            
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center border border-green-200 shadow-sm">
                <div className="text-4xl font-bold text-green-600">{sentCount}</div>
                <div className="text-sm font-medium text-green-700 mt-1">Messages Sent</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 text-center border border-red-200 shadow-sm">
                <div className="text-4xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm font-medium text-red-700 mt-1">Messages Failed</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-600">
                  {isUnlimited ? '∞' : totalToSend}
                </div>
                <div className="text-sm font-medium text-blue-700 mt-1">Total to Send</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 text-center border border-yellow-200 shadow-sm">
                <div className="text-4xl font-bold text-yellow-600">{successRate}%</div>
                <div className="text-sm font-medium text-yellow-700 mt-1">Success Rate</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Recent Activity</h3>
              <div className="bg-blue-50/50 rounded-xl p-4 h-48 overflow-y-auto border border-blue-200">
                {logs.length === 0 ? (
                  <div className="text-blue-600 text-center py-12 font-medium">No activity yet. Start spamming to see logs!</div>
                ) : (
                  <div className="space-y-3">
                    {[...logs].reverse().slice(0, 10).map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-xl text-sm border-l-4 ${
                          log.type === 'success' 
                            ? 'bg-green-50/80 border-l-green-500 text-green-700' 
                            : 'bg-red-50/80 border-l-red-500 text-red-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{log.message}</span>
                          <span className="text-xs text-blue-600 font-medium whitespace-nowrap ml-3">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-purple-200 shadow-lg mt-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">About This Tool</h2>
          <div className="text-gray-700">
            <p className="leading-relaxed">
              This powerful Webhook Spammer tool allows you to send multiple messages or files to any webhook endpoint 
              with fully customizable timing and settings. Perfect for developers testing webhook integrations, 
              automating message delivery, or stress testing your applications.
            </p>
            <p className="mt-4 font-semibold text-purple-700">
              Key Features:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-gray-700">
              <li>Send unlimited text messages and files/images to webhooks</li>
              <li>Customizable delay timing between requests (100ms to 10s)</li>
              <li>Flexible spam modes: limited count or unlimited continuous</li>
              <li>Real-time statistics dashboard with success rates</li>
              <li>Activity logs with timestamps for easy monitoring</li>
              <li>One-click start/stop controls</li>
              <li>Responsive design works on all devices</li>
            </ul>
            <p className="mt-5 text-sm text-purple-600 font-medium bg-purple-50 p-3 rounded-lg">
              🚀 Created by Abiel • ⚡ Hosted on Vercel • 🛠️ Built with React & TypeScript
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 border-t border-gray-200 mt-12 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 font-medium mb-4 md:mb-0">
              © {new Date().getFullYear()} Abiel's Webhook Tools. All rights reserved.
            </div>
            <div className="flex space-x-5">
              <a 
                href="https://youtube.com/@abielsamp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                YouTube
              </a>
              <a 
                href="https://discord.gg/QtkHyW9TWu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#5865F2] transition-colors font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
                </svg>
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
