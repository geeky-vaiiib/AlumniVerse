'use client';

import { useState, useEffect } from 'react';
import apiService from '@/lib/api';

export default function TestApiPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test Health Check
      console.log('Testing health check...');
      testResults.health = await apiService.health();

      // Test Jobs API
      console.log('Testing jobs API...');
      testResults.jobs = await apiService.jobs.getAll({ limit: 5 });

      // Test Events API
      console.log('Testing events API...');
      testResults.events = await apiService.events.getAll({ limit: 5 });

      // Test Directory API
      console.log('Testing directory API...');
      testResults.directory = await apiService.directory.getAll({ limit: 5 });

      // Test Storage Info
      console.log('Testing storage info...');
      testResults.storage = await apiService.storage.getInfo();

      // Test Auth Health
      console.log('Testing auth health...');
      testResults.authHealth = await apiService.request('/supabase-auth/health');

    } catch (error) {
      console.error('Test failed:', error);
      testResults.error = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AlumniVerse API Test</h1>
      
      <div className="mb-4">
        <button
          onClick={testEndpoints}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Health Check</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.health, null, 2)}
          </pre>
        </div>

        {/* Jobs API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Jobs API</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.jobs, null, 2)}
          </pre>
        </div>

        {/* Events API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Events API</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.events, null, 2)}
          </pre>
        </div>

        {/* Directory API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Directory API</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.directory, null, 2)}
          </pre>
        </div>

        {/* Storage Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Storage Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.storage, null, 2)}
          </pre>
        </div>

        {/* Auth Health */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Health</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results.authHealth, null, 2)}
          </pre>
        </div>

        {/* Error Display */}
        {results.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded col-span-full">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {results.error}</span>
          </div>
        )}
      </div>

      {/* API Status Summary */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">API Status Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded ${results.health ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Health Check</div>
            <div>{results.health ? '✅ Working' : '❌ Failed'}</div>
          </div>
          <div className={`p-3 rounded ${results.jobs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Jobs API</div>
            <div>{results.jobs ? '✅ Working' : '❌ Failed'}</div>
          </div>
          <div className={`p-3 rounded ${results.events ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Events API</div>
            <div>{results.events ? '✅ Working' : '❌ Failed'}</div>
          </div>
          <div className={`p-3 rounded ${results.directory ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Directory API</div>
            <div>{results.directory ? '✅ Working' : '❌ Failed'}</div>
          </div>
          <div className={`p-3 rounded ${results.storage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Storage API</div>
            <div>{results.storage ? '✅ Working' : '❌ Failed'}</div>
          </div>
          <div className={`p-3 rounded ${results.authHealth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-semibold">Auth API</div>
            <div>{results.authHealth ? '✅ Working' : '❌ Failed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
