"use client";

import { useState, useEffect, useRef } from "react";

// Mock Data
const MOCK_BLOCKS = [
  { number: 98567432, age: "2 secs ago", txs: 156, validator: "xdc1a2b...3c4d", reward: "2.45 XDC" },
  { number: 98567431, age: "4 secs ago", txs: 89, validator: "xdc5e6f...7g8h", reward: "2.45 XDC" },
  { number: 98567430, age: "6 secs ago", txs: 234, validator: "xdc9i0j...1k2l", reward: "2.45 XDC" },
  { number: 98567429, age: "8 secs ago", txs: 67, validator: "xdc3m4n...5o6p", reward: "2.45 XDC" },
  { number: 98567428, age: "10 secs ago", txs: 198, validator: "xdc7q8r...9s0t", reward: "2.45 XDC" },
];

const MOCK_TXS = [
  { hash: "0x7a8b9c...d0e1f2", age: "3 secs ago", from: "xdc1a2b...3c4d", to: "xdc5e6f...7g8h", amount: "1,250.00 XDC", fee: "0.0021" },
  { hash: "0x3g4h5i...6j7k8l", age: "5 secs ago", from: "xdc9m0n...1o2p3", to: "xdc4q5r...6s7t8", amount: "45.50 XDC", fee: "0.0018" },
  { hash: "0x9u0v1w...2x3y4z", age: "7 secs ago", from: "xdc5a6b...7c8d9", to: "xdc0e1f...2g3h4", amount: "10,000.00 XDC", fee: "0.0032" },
  { hash: "0x1i2j3k...4l5m6n", age: "9 secs ago", from: "xdc7o8p...9q0r1", to: "xdc2s3t...4u5v6", amount: "789.25 XDC", fee: "0.0025" },
  { hash: "0x5w6x7y...8z9a0b", age: "11 secs ago", from: "xdc1c2d...3e4f5", to: "xdc6g7h...8i9j0", amount: "2,500.00 XDC", fee: "0.0020" },
];

const MOCK_TOKENS = [
  { rank: 1, name: "XDC Token", symbol: "XDC", price: "$0.0284", change: "+5.23%", changePositive: true },
  { rank: 2, name: "Prime Numbers", symbol: "PRNT", price: "$0.1567", change: "+12.45%", changePositive: true },
  { rank: 3, name: "GlobeNet", symbol: "GNET", price: "$0.0089", change: "-2.11%", changePositive: false },
  { rank: 4, name: "TradeFinex", symbol: "TFX", price: "$0.0456", change: "+8.92%", changePositive: true },
  { rank: 5, name: "XDC Utility", symbol: "XDCU", price: "$0.0034", change: "-0.55%", changePositive: false },
];

const SOLIDITY_CODE = `pragma solidity ^0.8.19;

contract TokenSwap {
    address public owner;
    mapping(address => uint256) public balances;
    
    event Swap(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    function swap(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        emit Swap(msg.sender, amount, block.timestamp);
    }
}`;

const AI_RESPONSE = `This is a token swap contract with the following characteristics:

**Contract Type:** ERC-20 Token Swap
**Risk Level:** Medium

**Key Functions:**
- swap(): Allows users to swap tokens (requires sufficient balance)
- Owner-only functions with access control

**Security Analysis:**
✓ Access control implemented with onlyOwner modifier
✓ Input validation on swap amount
✓ Event emission for transparency
⚠ No reentrancy guard on swap function
⚠ No pause mechanism in case of emergency

**Recommendations:**
1. Add ReentrancyGuard from OpenZeppelin
2. Implement emergency pause functionality
3. Add slippage protection for swaps`;

export default function Home() {
  const [blockNumber, setBlockNumber] = useState(98567432);
  const [activeTab, setActiveTab] = useState("code");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [searchType, setSearchType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Auto-increment block number
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle AI question
  const handleAskAi = () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    setTimeout(() => {
      setAiResponse(AI_RESPONSE);
      setIsAiLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#05070f] grid-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">XDCExplorer</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-cyan-400/10 text-cyan-400 rounded border border-cyan-400/20">AI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {[
                { id: "blockchain", label: "Blockchain" },
                { id: "tokens", label: "Tokens" },
                { id: "nfts", label: "NFTs" },
                { id: "contracts", label: "Contracts" },
                { id: "ai-reader", label: "AI Reader", badge: "BETA" },
                { id: "analytics", label: "Analytics" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`text-sm font-medium transition-colors relative ${
                    activeNav === item.id ? "text-cyan-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-violet-500/20 text-violet-400 rounded border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowWalletModal(true)}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-900 rounded-lg hover-glow btn-shine"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="slide-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span>
              <span className="text-sm text-emerald-400 font-medium">XDC Network · Live Explorer</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Smart <span className="gradient-text">AI-Powered</span> Blockchain Explorer
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mb-8">
              Explore the XDC Network with advanced AI intelligence. Real-time analytics, smart contract analysis, and predictive insights for the XinFin ecosystem.
            </p>
          </div>

          {/* Search Bar */}
          <div className="slide-up slide-up-delay-1 max-w-3xl">
            <div className="glass rounded-xl p-1 search-glow transition-shadow">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors border-r border-gray-700">
                    <span>{searchType}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search by address / tx hash / block / token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none text-sm"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-900 font-medium rounded-lg hover-glow">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "XDC Price", value: "$0.0284", change: "+5.23%", changePositive: true, border: "border-top-cyan" },
            { label: "Latest Block", value: blockNumber.toLocaleString(), change: "2.0s", changePositive: true, border: "border-top-violet", isBlock: true },
            { label: "Transactions (24h)", value: "1.2M", change: "+12.5%", changePositive: true, border: "border-top-emerald" },
            { label: "Active Validators", value: "108", change: "+2", changePositive: true, border: "border-top-orange" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`glass rounded-xl p-6 hover-glow slide-up slide-up-delay-${index + 1} ${stat.border}`}
            >
              <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                <span className={`text-sm font-medium ${stat.changePositive ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Feature Banner */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-xl p-8 relative overflow-hidden slide-up slide-up-delay-2">
            <span className="ai-watermark text-violet-500">AI</span>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-violet-500/20 to-cyan-400/20 text-cyan-400 rounded-full border border-cyan-400/30">
                  Powered by Claude
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Smart Contract Intelligence</h2>
              <p className="text-gray-400 mb-6 max-w-xl">
                Analyze, audit, and understand smart contracts with AI-powered insights. Detect vulnerabilities, optimize gas, and decode complex logic.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {["Code Reader", "Vulnerability Scan", "Function Explainer", "Gas Optimizer", "ABI Decoder"].map((pill) => (
                  <span key={pill} className="px-4 py-2 text-sm bg-navy-700/50 text-cyan-400 rounded-lg border border-cyan-400/20">
                    {pill}
                  </span>
                ))}
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-400 text-white font-medium rounded-lg hover-glow btn-shine">
                Try AI Reader →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blocks + Transactions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Blocks */}
          <div className="glass rounded-xl overflow-hidden slide-up slide-up-delay-3">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span>
                <h3 className="text-lg font-semibold text-white">Latest Blocks</h3>
              </div>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-gray-800">
              {MOCK_BLOCKS.map((block) => (
                <div key={block.number} className="px-6 py-4 row-hover flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 font-mono font-medium">{block.number.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{block.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">{block.txs} txs</p>
                    <p className="text-sm text-gray-500 font-mono">{block.validator}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="glass rounded-xl overflow-hidden slide-up slide-up-delay-4">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot"></span>
                <h3 className="text-lg font-semibold text-white">Latest Transactions</h3>
              </div>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-gray-800">
              {MOCK_TXS.map((tx) => (
                <div key={tx.hash} className="px-6 py-4 row-hover">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cyan-400 font-mono text-sm">{tx.hash}</span>
                    <span className="text-sm text-gray-500">{tx.age}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-mono">{tx.from}</span>
                      <span className="text-gray-600">→</span>
                      <span className="font-mono">{tx.to}</span>
                    </div>
                    <span className="text-white font-medium">{tx.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Contract Reader Panel */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-xl overflow-hidden slide-up slide-up-delay-3">
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-violet-500/20 text-violet-400 rounded border border-violet-500/30">AI</span>
                <h3 className="text-lg font-semibold text-white">Smart Contract Reader</h3>
              </div>
              <div className="flex gap-6">
                {["code", "abi", "events"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab ? "tab-active" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Code Panel */}
              <div className="p-6 border-r border-gray-800">
                <div className="bg-navy-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code>
                      {SOLIDITY_CODE.split("\n").map((line, i) => (
                        <div key={i} className="table-row">
                          <span className="table-cell text-gray-600 select-none pr-4 text-right">{i + 1}</span>
                          <span className="table-cell">
                            {line.includes("pragma") || line.includes("contract") || line.includes("function") || line.includes("modifier") || line.includes("event") || line.includes("mapping") || line.includes("require") ? (
                              <span className="syntax-keyword">{line}</span>
                            ) : line.includes("'") || line.includes('"') ? (
                              <span className="syntax-string">{line}</span>
                            ) : line.includes("//") ? (
                              <span className="syntax-comment">{line}</span>
                            ) : (
                              line
                            )}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>

              {/* AI Analysis Panel */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-violet-400">AI Analysis</span>
                  </div>
                  {isAiLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing contract...</span>
                    </div>
                  ) : aiResponse ? (
                    <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                      {aiResponse}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Enter a question to analyze this contract</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI about this contract..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAskAi()}
                    className="flex-1 bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    onClick={handleAskAi}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 text-white text-sm font-medium rounded-lg hover-glow"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tokens + Network Status */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tokens */}
          <div className="glass rounded-xl overflow-hidden slide-up slide-up-delay-4">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Top Tokens</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {MOCK_TOKENS.map((token) => (
                <div key={token.rank} className="px-6 py-4 row-hover flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-6">{token.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-cyan-400">{token.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono">{token.price}</p>
                    <p className={`text-sm ${token.changePositive ? "text-emerald-400" : "text-red-400"}`}>
                      {token.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div className="glass rounded-xl overflow-hidden slide-up slide-up-delay-5">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Network Status</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: "Consensus", value: "XDPoS 2.0", status: "Active", color: "emerald" },
                { label: "Chain ID", value: "50", status: "Mainnet", color: "cyan" },
                { label: "Gas Price", value: "0.0001 XDC", status: "Low", color: "emerald" },
                { label: "TPS", value: "2,000+", status: "High", color: "emerald" },
                { label: "Finality", value: "2s", status: "Fast", color: "emerald" },
                { label: "Validators", value: "108/108", status: "100%", color: "emerald", progress: 100 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">{item.value}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full bg-${item.color}-400/10 text-${item.color}-400 border border-${item.color}-400/20`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {item.progress !== undefined && (
                      <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${item.color}-400 rounded-full progress-animated`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-400">© 2024 XDCExplorer. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {["API", "Docs", "GitHub", "Status"].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-strong rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {["MetaMask", "WalletConnect", "Coinbase Wallet", "XDCPay"].map((wallet) => (
                <button
                  key={wallet}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors border border-gray-700 hover:border-cyan-400/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">{wallet[0]}</span>
                  </div>
                  <span className="text-white font-medium">{wallet}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
