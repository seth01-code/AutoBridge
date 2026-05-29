"use client";

import { Suspense } from "react";
import TrackerClient from "./TrackerClient";

function TrackerSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white px-6 py-12 animate-pulse">
      <div className="max-w-5xl mx-auto">
        {/* HERO */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 mx-auto mb-6" />

          <div className="h-10 w-72 bg-white/5 rounded-xl mx-auto mb-4" />

          <div className="h-4 w-[500px] max-w-full bg-white/5 rounded mx-auto" />
        </div>

        {/* SEARCH */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-14 flex-1 rounded-2xl bg-white/5" />

            <div className="h-14 w-[180px] rounded-2xl bg-orange-500/20" />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="h-6 w-32 rounded-full bg-orange-500/20" />

              <div className="h-10 w-64 bg-white/5 rounded-xl" />

              <div className="h-4 w-48 bg-white/5 rounded" />
            </div>

            <div className="lg:w-[320px]">
              <div className="flex justify-between mb-3">
                <div className="h-4 w-28 bg-white/5 rounded" />

                <div className="h-4 w-10 bg-white/5 rounded" />
              </div>

              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-orange-500/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
          <div className="h-8 w-56 bg-white/5 rounded-xl mb-10" />

          <div className="space-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5" />

                  {i !== 4 && (
                    <div className="w-[2px] h-24 bg-white/5 my-2" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="h-5 w-40 bg-white/5 rounded" />

                      <div className="h-4 w-72 bg-white/5 rounded" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-white/5 rounded" />

                      <div className="h-4 w-24 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
            >
              <div className="h-4 w-24 bg-white/5 rounded mb-4" />

              <div className="h-6 w-40 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<TrackerSkeleton />}>
      <TrackerClient />
    </Suspense>
  );
}