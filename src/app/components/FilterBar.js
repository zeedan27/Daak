"use client";

import React from 'react';

export default function FilterBar({ search, setSearch, crimeFilter, setCrimeFilter, sortBy, setSortBy }) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="flex-1 min-w-[160px] px-4 py-2 rounded-md bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search by area, type or keyword"
        aria-label="search"
      />

      <select value={crimeFilter} onChange={e => setCrimeFilter(e.target.value)} className="px-3 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="all">All Crimes</option>
        <option value="Robbery">Robbery</option>
        <option value="Theft">Theft</option>
        <option value="Assault">Assault</option>
        <option value="Harassment">Harassment</option>
        <option value="Murder">Murder</option>
      </select>

      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="recent">Most Recent</option>
        <option value="region">By Region</option>
      </select>
    </div>
  );
}