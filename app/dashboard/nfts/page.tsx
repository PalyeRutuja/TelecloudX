"use client";

import { useEffect, useState } from "react";

interface NFTRecord {
  id: string;
  vmId: string;
  region: string;
  cpu: number;
  ram: number;
  os: string;
  deploymentTimestamp: string;
  ipfsHash: string;
  tokenURI: string;
  txHash?: string;
  explorerUrl?: string;
  source: "firestore" | "pinata";
}

export default function NFTDashboard() {
  const [nfts, setNfts] = useState<NFTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/nft/list", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNfts(data.nfts || []);
        else setError(data.error || "Failed to load");
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading NFTs...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">🎨 Deployment Proof Center</h1>
      <p className="text-gray-400 mb-8">Every VM deployment mints a permanent NFT on XDC Network.</p>

      {nfts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-lg">No Deployment Proof NFTs yet.</p>
          <p className="text-gray-500 mt-2">Deploy your first VM to mint an NFT!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition"
            >
              <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                <span className="text-5xl">🖥️</span>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-lg truncate">
                  VM {nft.vmId}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Source: <span className="text-gray-300 capitalize">{nft.source}</span>
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Region</span>
                    <span className="text-gray-300">{nft.region}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CPU</span>
                    <span className="text-gray-300">{nft.cpu} vCPU</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">RAM</span>
                    <span className="text-gray-300">{nft.ram} MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">OS</span>
                    <span className="text-gray-300">{nft.os}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">
                    Deployed {new Date(nft.deploymentTimestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 font-mono break-all mt-1">
                    IPFS: {nft.ipfsHash}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={nft.tokenURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded-lg text-center transition"
                  >
                    IPFS Metadata
                  </a>
                  {nft.explorerUrl && (
                    <a
                      href={nft.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg text-center transition"
                    >
                      Explorer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
