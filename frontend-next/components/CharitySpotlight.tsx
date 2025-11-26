"use client";

import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { CharityContext } from "@/context/CharityContext";
import { compressAddress } from "@/utils/helper";
import { ethers } from "ethers";

export default function CharitySpotlight() {
  const { getCharities } = useContext(CharityContext);
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const all = await getCharities();
        // pick top 3 active charities as featured
        const picks = (all || []).filter((c: any) => c.active).slice(0, 3);
        if (mounted) setFeatured(picks);
      } catch (e) {
        console.warn("Failed to load charities for spotlight", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getCharities]);

  const renderProgress = (charity: any) => {
    // default goal (in ether) if not provided
    const defaultGoalEth = 10;
    const totalDonationWei = charity.totalDonation || '0';
    let totalEth = 0;
    try {
      totalEth = parseFloat(ethers.utils.formatEther(totalDonationWei.toString()));
    } catch (e) {
      totalEth = Number(totalDonationWei) || 0;
    }
    const goalEth = (typeof charity.goalEth !== 'undefined' && charity.goalEth !== null && charity.goalEth !== '' ? Number(charity.goalEth) : (typeof charity.targetEth !== 'undefined' && charity.targetEth !== null && charity.targetEth !== '' ? Number(charity.targetEth) : defaultGoalEth));
    const percent = Math.min(100, Math.round((totalEth / goalEth) * 100));
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium text-gray-700">Tiến độ</div>
          <div className="text-sm font-medium text-gray-700">{percent}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-green h-3 rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2 text-sm text-gray-500">Đã đạt: {totalEth} / {goalEth} ETH</div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-start">
          <div className="text-center w-full">
            <h2 className="text-4xl font-bold text-gray-900 font-pj">CHIẾN DỊCH NỔI BẬT</h2>
            <p className="mt-2 text-base leading-7 text-gray-600">Các dự án đang rất cần giúp đỡ chung tay của các bạn</p>
          </div>

          <div className="mt-6 w-full grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.length === 0 ? (
              <div className="text-sm text-gray-500">No featured campaigns yet.</div>
            ) : (
              featured.map((c: any) => (
                <div key={c.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/causes/${c.id}`} className="text-lg font-semibold text-gray-900">{c.name}</Link>
                      <p className="mt-1 text-sm text-gray-600">{c.mission}</p>
                    </div>
                    {/* <div className="text-sm text-gray-500">ID #{c.id}</div> */}
                  </div>

                  {renderProgress(c)}

                  <div className="mt-4 text-sm text-gray-600">
                    <div><strong>Ví:</strong> <a className="text-indigo-600" href={`https://sepolia.etherscan.io/address/${c.wallet}`} target="_blank" rel="noreferrer">{compressAddress(c.wallet)}</a></div>
                  </div>

                  <div className="mt-4 flex items-center space-x-2">
                    {/* <Link href={`/causes/${c.id}`} className="text-sm font-semibold text-indigo-600 underline">Xem chi tiết</Link> */}
                    <Link href={`/causes?donate=${c.id}`} className="ml-2 text-sm text-white bg-green px-3 py-2 rounded-md">Gây quỹ</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
