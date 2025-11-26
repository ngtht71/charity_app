import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { CharityContext } from "@/context/CharityContext";
import AddCharity from "@/components/AddCharity";
import FormProvider from "@/context/FormContext";
import { AppContext } from "@/context/AppContext";
import { compressAddress } from "@/utils/helper";
import { ethers } from "ethers";

export default function CharityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getCharities, getDonations } = useContext(CharityContext);
  const [charity, setCharity] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const { isOwner } = useContext(AppContext);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchCharity = async () => {
      const all = await getCharities();
      const found = all.find((c: any) => Number(c.id) === Number(id));
      setCharity(found || null);
      try {
        const d = await getDonations(Number(id));
        setDonations(d || []);
      } catch (e) {
        console.warn("getDonations error", e);
        setDonations([]);
      }
    };
    fetchCharity();

    const onUpdated = (ev: any) => {
      try {
        const updatedId = Number(ev?.detail?.id);
        if (!isNaN(updatedId) && Number(id) === updatedId) {
          fetchCharity();
        }
      } catch (e) {
        console.warn("charityUpdated handler error", e);
      }
    };

    window.addEventListener("charityUpdated", onUpdated as EventListener);
    return () => {
      window.removeEventListener("charityUpdated", onUpdated as EventListener);
    };
  }, [id, getCharities, getDonations]);

  if (!charity) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <p className="text-gray-500">Đang tải thông tin quỹ...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`VietTrust - Quỹ ${charity.name}`}</title>
        <meta name="description" content={`Chi tiết và lịch sử quyên góp cho quỹ ${charity.name}`} />
      </Head>
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <button
          className="mb-6 text-sm text-gray-600 underline"
          onClick={() => router.back()}
        >
          &larr; Quay lại
        </button>

        {charity.image && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
            <img
              src={charity.image}
              alt={charity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900">{charity.name}</h1>
        <p className="mt-2 text-sm text-gray-600">{charity.mission}</p>

        {isOwner && (
          <div className="mt-4">
            <button
              className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray bg-[#FFE4B5] rounded-md hover:bg-[#FFDA94]"
              onClick={() => setShowEditModal(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <p>
            <strong>Website:</strong>{" "}
            <a
              href={charity.website}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 underline"
            >
              {charity.website}
            </a>
          </p>

          <p>
            <strong>Ví:</strong>{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${charity.wallet}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 underline"
            >
              {compressAddress(charity.wallet)}
            </a>
          </p>

          <p>
            <strong>Tổng quyên góp:</strong>{" "}
            {ethers.utils.formatEther(charity.totalDonation.toString())} ETH
          </p>

          <p>
            <strong>Mục tiêu:</strong>{" "}
            {((typeof charity.goalEth !== 'undefined' && charity.goalEth !== null && charity.goalEth !== '') ? `${charity.goalEth} ETH` : (typeof charity.targetEth !== 'undefined' && charity.targetEth !== null && charity.targetEth !== '' ? `${charity.targetEth} ETH` : '—'))}
          </p>

          <p>
            <strong>Trạng thái:</strong>{" "}
            {charity.active ? (
              <span className="text-green-600">Hoạt động</span>
            ) : (
              <span className="text-red-600">Ngưng hoạt động</span>
            )}
          </p>

          {charity.description && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Giới thiệu</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-line">
                {charity.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Lịch sử quyên góp</h3>
          {donations.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Chưa có quyên góp nào.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {donations.map((d: any, idx: number) => (
                <div key={d.txHash || idx} className="p-3 border rounded-md">
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-700">
                      <strong>Người quyên góp:</strong> {compressAddress(d.donor)}
                    </div>
                    <div className="text-gray-500">
                      {d.timestamp ? new Date(d.timestamp * 1000).toLocaleString() : `Block ${d.blockNumber}`}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    <strong>Số tiền:</strong> {ethers.utils.formatEther(d.amount.toString())} ETH
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Tx: <span className="font-mono">{d.txHash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <FormProvider>
          <AddCharity
            setShowModal={setShowEditModal}
            charityId={Number(id)}
            initialData={charity}
          />
        </FormProvider>
      )}
    </>
  );
}