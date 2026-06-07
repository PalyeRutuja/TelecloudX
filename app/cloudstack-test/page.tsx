"use client";

import { useState } from "react";
import Link from "next/link";

export default function CloudStackTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testConnection = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cloudstack/test");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/vms"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to VMs
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white mt-4">
            CloudStack Connection Test
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Diagnose CloudStack API connectivity issues
          </p>
        </div>

        <button
          onClick={testConnection}
          disabled={loading}
          className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
        >
          {loading ? "Testing..." : "Test CloudStack Connection"}
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Status: </span>
              <span
                className={`font-mono font-bold ${
                  result.success
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {result.status} {result.statusText}
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">URL: </span>
              <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all">
                {result.url}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Response Data:
              </h3>
              <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl overflow-auto text-xs font-mono text-zinc-800 dark:text-zinc-200">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
