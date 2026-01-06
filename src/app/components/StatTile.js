"use client";

import React from 'react';

export default function StatTile({ type, count }) {
  return (
    <div className="card flex flex-col justify-between p-4">
      <div>
        <h4 className="font-semibold text-lg">{type}</h4>
        <p className="text-sm text-muted">Recent reports</p>
      </div>
      <div className="mt-3 text-2xl font-bold">{count}</div>
    </div>
  );
}