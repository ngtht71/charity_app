import { AppContext } from "@/context/AppContext";
import { getUserBalance } from "@/utils/interactions";
import { ethers } from "ethers";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";

function DashboardHighlight({ donations }: { donations: any[] }) {
  const { account } = useContext(AppContext);

  const [balance, setBalance] = useState("0.0");
  useEffect(() => {
    const handleBalance = async () => {
      const amount = await getUserBalance();
      if (amount) {
        const balanceInEth = ethers.utils.formatEther(amount);
        const balanceInNumber = parseFloat(balanceInEth);
        const balanceRounded = balanceInNumber.toFixed(4);
        setBalance(balanceRounded.toString());
      }
    };

    handleBalance();
  }, []);

  const formatEth = (bn: any) => {
    try {
      const asBn = ethers.BigNumber.isBigNumber(bn)
        ? bn
        : ethers.BigNumber.from(bn || "0");
      const asFloat = parseFloat(ethers.utils.formatEther(asBn));
      return asFloat.toFixed(2);
    } catch (e) {
      return "0.00";
    }
  };

  const getTotalUserDonations = () => {
    const acct = (account || "").toString().toLowerCase();
    let sum = ethers.BigNumber.from(0);
    donations.forEach((tx: any) => {
      try {
        const from = (tx.from || tx.fromAddress || "").toString().toLowerCase();
        if (from && acct && from === acct) {
          sum = sum.add(ethers.BigNumber.from(tx.value || tx.amount || "0"));
        }
      } catch (e) {
        // ignore malformed
      }
    });
    return formatEth(sum);
  };

  const getTodayUserDonations = () => {
    const today = moment().startOf("day");
    const acct = (account || "").toString().toLowerCase();
    let sum = ethers.BigNumber.from(0);
    donations.forEach((tx: any) => {
      try {
        const from = (tx.from || tx.fromAddress || "").toString().toLowerCase();
        const donationTimestamp = moment.unix(tx.timeStamp || tx.timestamp || tx.time);
        if (from && acct && from === acct && today.isSame(donationTimestamp, "day")) {
          sum = sum.add(ethers.BigNumber.from(tx.value || tx.amount || "0"));
        }
      } catch (e) {
        // ignore malformed entries
      }
    });
    return formatEth(sum);
  };

  const getTotalUserDonation = () => {
    const acct = (account || "").toString().toLowerCase();
    let count = 0;
    donations.forEach((tx: any) => {
      try {
        const from = (tx.from || tx.fromAddress || "").toString().toLowerCase();
        if (from && acct && from === acct) count += 1;
      } catch (e) {
        // ignore
      }
    });
    return count;
  };

  const getTotalDonationsAll = () => {
    let sum = ethers.BigNumber.from(0);
    donations.forEach((donation) => {
      try {
        sum = sum.add(ethers.BigNumber.from(donation.value || donation.amount || "0"));
      } catch (e) {
        // ignore malformed
      }
    });
    return formatEth(sum);
  };

  const getTodayDonationsAll = () => {
    const today = moment().startOf("day");
    let sum = ethers.BigNumber.from(0);
    donations.forEach((donation) => {
      try {
        const donationTimestamp = moment.unix(donation.timeStamp || donation.timestamp || donation.time);
        if (today.isSame(donationTimestamp, "day")) {
          sum = sum.add(ethers.BigNumber.from(donation.value || donation.amount || "0"));
        }
      } catch (e) {
        // ignore malformed entries
      }
    });
    return formatEth(sum);
  };

  // const getTotalDonations = () => {
  //   let sum = ethers.BigNumber.from(0);
  //   let totalDonations = donations.map((donation) => {
  //     return ethers.BigNumber.from(donation.value);
  //   });
  //   totalDonations.forEach((value) => {
  //     sum = sum.add(value);
  //   });
  //   return ethers.utils.formatEther(sum);
  // };

  // const getTotalDonors = () => {
  //   let donors = new Set();
  //   donations.forEach((donation) => {
  //     donors.add(donation.from);
  //   });
  //   return donors.size;
  // };

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Số dư ví
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xl font-bold text-gray-800">{balance} ETH</p>

            {/* <span className="inline-flex items-center text-sm font-semibold text-green-500">
              + 36%
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 ml-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                ></path>
              </svg>
            </span> */}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Số tiền quyên góp hôm nay
          </p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xl font-bold text-gray-800">
                {getTodayDonationsAll()} ETH
              </p>
              {account ? (
                <p className="text-sm text-gray-500">Bạn: {getTodayUserDonations()} ETH</p>
              ) : null}
            </div>

            {/* <span className="inline-flex items-center text-sm font-semibold text-red-500">
              - 14%
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 ml-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                />
              </svg>
            </span> */}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Tổng số tiền quyên góp
          </p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xl font-bold text-gray-800">
                {getTotalDonationsAll()} ETH
              </p>
              {account ? (
                <p className="text-sm text-gray-500">Bạn: {getTotalUserDonations()} ETH</p>
              ) : null}
            </div>

            {/* <span className="inline-flex items-center text-sm font-semibold text-green-500">
              + 36%
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 ml-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                ></path>
              </svg>
            </span> */}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Số lần đã quyên góp
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xl font-bold text-gray-800">
              {getTotalUserDonation()}
            </p>

            {/* <span className="inline-flex items-center text-sm font-semibold text-green-500">
              + 36%
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 ml-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                ></path>
              </svg>
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHighlight;
