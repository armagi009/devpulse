'use client';

import React from 'react';

/**
 * MinimalTest Component
 * 
 * A minimal component to test if Tailwind CSS is working properly.
 * This component uses basic Tailwind classes and can be embedded anywhere.
 */
export default function MinimalTest() {
  return (
    <div className="p-4 m-4 border border-gray-200 rounded-lg bg-white shadow">
      <h2 className="text-lg font-medium text-blue-600 mb-2">Tailwind Test Component</h2>
      <p className="text-gray-600 mb-4">
        This component uses Tailwind CSS classes. If it appears styled, Tailwind is working.
      </p>
      <div className="flex space-x-2">
        <div className="h-6 w-6 bg-red-500 rounded-full"></div>
        <div className="h-6 w-6 bg-yellow-500 rounded-full"></div>
        <div className="h-6 w-6 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
}