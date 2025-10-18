import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThumbsUp, ThumbsDown, Minus, TrendingUp, MessageSquare, Search, Upload, FileText, RefreshCw, Trash2 } from 'lucide-react';

// Simple sentiment analysis function
const analyzeSentiment = (text) => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'awesome', 'happy', 'satisfied', 'impressed', 'recommend', 'beautiful', 'outstanding', 'superb', 'brilliant', 'exceptional'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'poor', 'waste', 'useless', 'broken', 'slow', 'expensive', 'never', 'wrong', 'disgusting', 'pathetic', 'annoying', 'frustrating'];
  
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

// Sample data
const generateSampleData = () => {
  const reviews = [
    { text: "This product is amazing! Best purchase ever.", category: "Electronics", date: "2025-10-01" },
    { text: "Terrible experience. Would not recommend.", category: "Service", date: "2025-10-02" },
    { text: "It's okay, nothing special.", category: "Electronics", date: "2025-10-03" },
    { text: "Love it! Exceeded my expectations.", category: "Fashion", date: "2025-10-04" },
    { text: "Worst product I've ever bought. Total waste of money.", category: "Electronics", date: "2025-10-05" },
    { text: "Pretty good quality for the price.", category: "Fashion", date: "2025-10-06" },
    { text: "Disappointed with the service.", category: "Service", date: "2025-10-07" },
    { text: "Excellent! Will definitely buy again.", category: "Electronics", date: "2025-10-08" },
    { text: "Not bad but could be better.", category: "Fashion", date: "2025-10-09" },
    { text: "Fantastic product, highly recommend!", category: "Electronics", date: "2025-10-10" },
    { text: "Poor quality, broke after one use.", category: "Electronics", date: "2025-10-11" },
    { text: "Good value for money.", category: "Fashion", date: "2025-10-12" },
    { text: "Amazing customer service!", category: "Service", date: "2025-10-13" },
    { text: "It's fine, does what it's supposed to.", category: "Electronics", date: "2025-10-14" },
    { text: "Horrible experience, never again.", category: "Service", date: "2025-10-15" },
    { text: "Perfect! Exactly what I needed.", category: "Fashion", date: "2025-10-16" },
    { text: "Decent product, nothing extraordinary.", category: "Electronics", date: "2025-10-17" },
    { text: "Love the design and quality!", category: "Fashion", date: "2025-10-18" },
  ];
  
  return reviews.map((review, idx) => ({
    ...review,
    id: idx + 1,
    sentiment: analyzeSentiment(review.text)
  }));
};

const SentimentDashboard = () => {
  const [data, setData] = useState(generateSampleData());
  const [customText, setCustomText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [analyzedText, setAnalyzedText] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = data.length;
    const positive = data.filter(d => d.sentiment === 'positive').length;
    const negative = data.filter(d => d.sentiment === 'negative').length;
    const neutral = data.filter(d => d.sentiment === 'neutral').length;
    
    return {
      total,
      positive,
      negative,
      neutral,
      positivePercent: total > 0 ? ((positive / total) * 100).toFixed(1) : 0,
      negativePercent: total > 0 ? ((negative / total) * 100).toFixed(1) : 0,
      neutralPercent: total > 0 ? ((neutral / total) * 100).toFixed(1) : 0
    };
  }, [data]);

  // Sentiment distribution for pie chart
  const pieData = [
    { name: 'Positive', value: metrics.positive, color: '#10b981' },
    { name: 'Negative', value: metrics.negative, color: '#ef4444' },
    { name: 'Neutral', value: metrics.neutral, color: '#6b7280' }
  ];

  // Trend data by date
  const trendData = useMemo(() => {
    const dateMap = {};
    data.forEach(item => {
      const date = item.date;
      if (!dateMap[date]) {
        dateMap[date] = { date, positive: 0, negative: 0, neutral: 0 };
      }
      dateMap[date][item.sentiment]++;
    });
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const catMap = {};
    data.forEach(item => {
      if (!catMap[item.category]) {
        catMap[item.category] = { category: item.category, positive: 0, negative: 0, neutral: 0 };
      }
      catMap[item.category][item.sentiment]++;
    });
    return Object.values(catMap);
  }, [data]);

  // Word frequency
  const wordFrequency = useMemo(() => {
    const words = {};
    const stopWords = ['this', 'that', 'with', 'from', 'have', 'been', 'they', 'were', 'their'];
    data.forEach(item => {
      const tokens = item.text.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.includes(w));
      tokens.forEach(word => {
        if (!words[word]) words[word] = 0;
        words[word]++;
      });
    });
    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }, [data]);

  const handleAnalyze = () => {
    if (customText.trim()) {
      const sentiment = analyzeSentiment(customText);
      setAnalyzedText({ text: customText, sentiment });
      
      const newEntry = {
        id: data.length + 1,
        text: customText,
        sentiment,
        category: 'Custom',
        date: new Date().toISOString().split('T')[0]
      };
      setData([...data, newEntry]);
      setCustomText('');
    }
  };

  const handleBulkAnalyze = () => {
    if (bulkText.trim()) {
      const lines = bulkText.split('\n').filter(line => line.trim());
      const newEntries = lines.map((line, idx) => ({
        id: data.length + idx + 1,
        text: line.trim(),
        sentiment: analyzeSentiment(line.trim()),
        category: 'Bulk Import',
        date: new Date().toISOString().split('T')[0]
      }));
      
      setData([...data, ...newEntries]);
      setBulkText('');
      setAnalyzedText({ text: `Successfully analyzed ${newEntries.length} texts!`, sentiment: 'info' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Try to parse as CSV
        const newEntries = lines.slice(1).map((line, idx) => {
          const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          const textContent = parts[0] || line;
          
          return {
            id: data.length + idx + 1,
            text: textContent,
            sentiment: analyzeSentiment(textContent),
            category: parts[1] || 'File Import',
            date: parts[2] || new Date().toISOString().split('T')[0]
          };
        });
        
        setData([...data, ...newEntries]);
        setAnalyzedText({ text: `Successfully imported ${newEntries.length} entries from file!`, sentiment: 'info' });
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const resetData = () => {
    setData(generateSampleData());
    setAnalyzedText({ text: 'Data reset to sample reviews', sentiment: 'info' });
  };

  const clearAllData = () => {
    setData([]);
    setAnalyzedText({ text: 'All data cleared', sentiment: 'info' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sentiment Analysis Dashboard</h1>
          <p className="text-purple-200">Real-time text sentiment analysis and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Reviews</p>
                <p className="text-3xl font-bold text-white">{metrics.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Positive</p>
                <p className="text-3xl font-bold text-white">{metrics.positivePercent}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Negative</p>
                <p className="text-3xl font-bold text-white">{metrics.negativePercent}%</p>
              </div>
              <ThumbsDown className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm">Neutral</p>
                <p className="text-3xl font-bold text-white">{metrics.neutralPercent}%</p>
              </div>
              <Minus className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Analysis Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/20">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'single' 
                  ? 'text-white border-b-2 border-purple-400' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Single Text
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'bulk' 
                  ? 'text-white border-b-2 border-purple-400' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bulk Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'file' 
                  ? 'text-white border-b-2 border-purple-400' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </div>
            </button>
          </div>

          {/* Single Text Analysis */}
          {activeTab === 'single' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Analyze Single Text</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter text to analyze sentiment..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300"
                />
                <button
                  onClick={handleAnalyze}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Analyze
                </button>
              </div>
            </div>
          )}

          {/* Bulk Text Analysis */}
          {activeTab === 'bulk' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Bulk Text Analysis</h2>
              <p className="text-purple-200 text-sm mb-3">Enter multiple texts (one per line):</p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Example:&#10;This product is amazing!&#10;Terrible customer service&#10;It's okay, nothing special&#10;&#10;Paste as many reviews as you want..."
                className="w-full h-40 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 resize-none"
              />
              <button
                onClick={handleBulkAnalyze}
                className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Analyze All ({bulkText.split('\n').filter(line => line.trim()).length} texts)
              </button>
            </div>
          )}

          {/* File Upload */}
          {activeTab === 'file' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Upload CSV/Text File</h2>
              <p className="text-purple-200 text-sm mb-3">
                Upload a CSV file with format: text, category (optional), date (optional)
              </p>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Click to upload file</p>
                    <p className="text-purple-300 text-sm">CSV or TXT format</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Result Display */}
          {analyzedText && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/20">
              <p className="text-purple-200 text-sm mb-2">Result:</p>
              <p className="text-white mb-2">{analyzedText.text}</p>
              {analyzedText.sentiment !== 'info' && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  analyzedText.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                  analyzedText.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {analyzedText.sentiment.toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Data Management Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
            <button
              onClick={resetData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Sample Data
            </button>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Sentiment Distribution</h2>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-purple-300">
                No data to display. Add some reviews to see the chart.
              </div>
            )}
          </div>

          {/* Trend Over Time */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sentiment Trends
            </h2>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                  <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-purple-300">
                No data to display. Add some reviews to see the trend.
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Sentiment by Category</h2>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="category" stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                  <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Legend />
                  <Bar dataKey="positive" fill="#10b981" />
                  <Bar dataKey="negative" fill="#ef4444" />
                  <Bar dataKey="neutral" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-purple-300">
                No data to display. Add some reviews to see categories.
              </div>
            )}
          </div>

          {/* Word Frequency */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Top Keywords</h2>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wordFrequency} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis type="number" stroke="#ffffff80" tick={{ fill: '#ffffff80' }} />
                  <YAxis type="category" dataKey="word" stroke="#ffffff80" tick={{ fill: '#ffffff80' }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-purple-300">
                No data to display. Add some reviews to see keywords.
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Recent Reviews ({data.length} total)</h2>
          {data.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.slice().reverse().slice(0, 20).map(item => (
                <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white mb-2">{item.text}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-purple-300">{item.category}</span>
                        <span className="text-purple-300">{item.date}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      item.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                      item.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-purple-300">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reviews yet. Start by adding some text to analyze!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentDashboard;