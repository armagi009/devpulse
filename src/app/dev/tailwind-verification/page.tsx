'use client';

import React from 'react';
import Link from 'next/link';
import MinimalTest from '../../../components/ui/MinimalTest';

export default function TailwindVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Tailwind CSS Verification</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Tailwind Test</h2>
          <p className="text-gray-700 mb-4">
            This page tests if Tailwind CSS is working properly. If you can see styled elements below, Tailwind is working.
          </p>
          
          <div className="flex space-x-4 mb-6">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Blue Button
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Green Button
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Red Button
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded">Grid Item 1</div>
            <div className="bg-blue-100 p-4 rounded">Grid Item 2</div>
            <div className="bg-blue-100 p-4 rounded">Grid Item 3</div>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-purple-500 mr-4"></div>
            <div>
              <h3 className="font-medium">Avatar Test</h3>
              <p className="text-sm text-gray-500">This tests rounded shapes and colors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Minimal Test Component</h2>
          <MinimalTest />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tailwind Utilities Test</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Flexbox</h3>
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Spacing</h3>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 w-full"></div>
                <div className="h-4 bg-gray-400 w-3/4"></div>
                <div className="h-4 bg-gray-500 w-1/2"></div>
                <div className="h-4 bg-gray-600 w-1/4"></div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Typography</h3>
              <p className="text-xs">Extra Small</p>
              <p className="text-sm">Small</p>
              <p className="text-base">Base</p>
              <p className="text-lg">Large</p>
              <p className="text-xl">Extra Large</p>
              <p className="font-bold">Bold</p>
              <p className="italic">Italic</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link href="/dev/css-diagnostic" className="text-blue-500 hover:text-blue-700">
            Go to CSS Diagnostic Tool
          </Link>
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}