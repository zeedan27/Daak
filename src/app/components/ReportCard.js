"use client";

import React from 'react';
import Link from 'next/link';

export default function ReportCard({ report }) {
  const formatDate = (ts) => {
    if (!ts) return 'Unknown';
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  };

  return (
    <article role="article" aria-labelledby={`report-${report.id}-title`} className="report-card focus:outline-none focus:ring-2 focus:ring-blue-500">
      <Link href={`/report-detail/${report.id}`} className="flex items-center gap-4 w-full">

        <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-white/5 flex items-center justify-center">
          {report.mediaUrl ? (
            <img src={report.mediaUrl} className="w-full h-full object-cover" alt={report.crimeType + ' image'} />
          ) : (
            <span className="text-sm text-white/70">No Image</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 id={`report-${report.id}-title`} className="truncate font-semibold">{report.crimeType}</h4>
            <div className="text-sm text-white/60">{formatDate(report.timestamp)}</div>
          </div>

          <div className="text-sm text-white/90 truncate">
            <p className="font-medium truncate">{report.region || 'Unknown'}</p>
            <p className="text-sm text-muted truncate">Reporter: {report.isAnonymous ? 'Anonymous' : (report.reporterName || 'User')}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}