import React, { useContext, useState } from "react";
import { DonationContext } from "@/context/DonationContext";
import { AppContext } from "@/context/AppContext";
import { useRouter } from "next/router";

type CharityProps = {
  id: number;
  name: string;
  mission: string;
  website: string;
  // wei string
  totalDonation: string;
  active: boolean;
  // @ts-expect-error
  wallet: ethers.utils.Address;
};

function Donate({
  charityId,
  charity,
  onClose,
}: {
  charityId: number;
  charity: CharityProps;
  onClose: () => void;
}) {
  const { connected, connectWallet, error } = useContext(AppContext);
  const {
    charityInFocus,
    isSuccessful,
    setIsSuccessfulFlag,
    donationInProgress,
    transactionHash,
    transactionConfirmed,
    setConfirmed,
    donationAmount,
    handleAmount,
    makeDonation,
  } = useContext(DonationContext);

  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleDonate = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    await makeDonation(charityId);
    // transactionConfirmed && refreshData();
    refreshData();
  };

  const handleClose = () => {
    setConfirmed(false); // To reset the transaction confrimed flag to false
    onClose();
  };

  return (
    <div>
      {!charity ? (
        <div className="relative w-full max-w-md mx-auto overflow-hidden bg-white rounded-xl p-6">
          <div className="absolute top-0 right-0 pt-3 pr-3">
            <button
              type="button"
              className="p-1 text-gray-400 transition-all duration-200 bg-white rounded-md hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only"> Đóng </span>
              ×
            </button>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Đang tải thông tin tổ chức từ thiện...</p>
            <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát!</p>
          </div>
        </div>
      ) : (
        (donationInProgress || transactionConfirmed) ? (
          <div className="relative w-full max-w-md mx-auto overflow-hidden bg-white rounded-xl">
            <div className="absolute top-0 right-0 pt-3 pr-3">
              <button
                type="button"
                className="p-1 text-gray-400 transition-all duration-200 bg-white rounded-md hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={handleClose}
              >
                <span className="sr-only"> Close </span>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="text-center">
                {!transactionConfirmed ? (
                  <svg
                    className="w-10 h-10 mx-auto text-gray-900 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-16 h-16 mx-auto text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

                {charityId !== charityInFocus ? (
                  <>
                    <p className="mt-8 text-xl font-bold text-gray-900">
                      Bạn có một khoản đóng góp đang chờ xử lý
                    </p>
                    <p className="mt-3 text-base font-medium text-gray-600">
                      Vui lòng xác nhận khoản đóng góp đang chờ với{" "}
                      <span className="text-green">{charity.name}</span>
                      trong ví Metamask của bạn trước khi thực hiện một khoản đóng góp khác.
                    </p>
                  </>
                ) : (
                  <>
                    {!transactionConfirmed ? (
                      <>
                        <p className="mt-8 text-xl font-bold text-gray-900">
                          Đang xác nhận giao dịch...
                        </p>
                        <p className="mt-3 text-base font-medium text-gray-600">
                          Hãy xác nhận giao dịch này trong ví Metamask của bạn.
                          Vui lòng chờ trong giây lát.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 text-xl font-bold text-green">
                          Giao dịch thành công!
                        </p>
                        <p className="mt-3 text-base font-medium text-gray-600">
                          Cảm ơn bạn đã đóng góp cho{" "}
                          <span className="text-green">{charity.name}</span>.
                        </p>
                      </>
                    )}
                  </>
                )}

                <div className="mt-8">
                  {!transactionConfirmed ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-gray-900 uppercase transition-all duration-200 bg-transparent border border-gray-900 rounded-md animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 hover:text-white cursor-not-allowed pointer-events-none"
                    >
                      Vui lòng chờ...
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-gray-900 uppercase transition-all duration-200 bg-transparent border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 hover:text-white"
                      onClick={handleClose}
                    >
                      Tiếp tục
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md mx-auto overflow-hidden bg-white rounded-xl">
            <div className="absolute top-0 right-0 pt-3 pr-3">
              <button
                type="button"
                className="p-1 text-gray-400 transition-all duration-200 bg-white rounded-md hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only"> Đóng </span>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="px-6 py-8 md:p-8 xl:p-12">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Quyên góp cho {" "}
                  <a href={charity.website} target="_blank" rel="noreferrer">
                    <span className="text-green">{charity.name}</span>
                  </a>
                </p>
                <p className="mt-2 text-base font-medium text-gray-500">
                  Bạn đã sẵn sàng thắp sáng hy vọng? Trân trọng tấm lòng vàng của bạn!
                </p>
              </div>

              <div className="mt-8 bg-white border border-gray-200 rounded-xl">
                <div className="p-4">
                  <div className="flex items-center">
                    <img
                      className="object-cover w-auto rounded-lg shrink-0 h-14"
                      // src="https://landingfoliocom.imgix.net/store/collection/niftyui/images/approve-transaction/2/product-thumbnail.png"
                      src="/images/logo.svg"
                      alt=""
                    />

                    <div className="flex-1 space-y-2 ml-4">
                      <div className="flex items-center space-x-1">
                        {/* <p className="whitespace-nowrap text-base font-bold text-gray-900 lg:whitespace-normal"> */}
                        <p className="text-base font-bold text-gray-900">
                          {charity.name}
                        </p>
                        <img
                          className="w-5 h-5"
                          src="/images/verified-animated.gif"
                          alt="verified"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* <p className=" md:whitespace-nowrap mt-1 text-sm font-medium text-gray-500">
                        $: 0.0
                      </p> */}
                        <input
                          type="number"
                          name="amount"
                          id=""
                          min="0"
                          step="0.0001"
                          placeholder="0 ETH"
                          className="block w-1/2 h-5 px-3 py-3 placeholder-gray-500 border-b-2 border-gray-300 border-opacity-75 outline-none rounded-none focus:ring-green-600 focus:border-gray-400 sm:text-sm caret-green-600"
                          onChange={(e) => {
                            handleAmount(e, e.currentTarget.name);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTE: Fix bug that causes iphone to accept string input instead of numbers only */}
              <div className="mt-6">
                {connected ? (
                  <button
                    type="button"
                    className={`inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-green-hover ${donationAmount.amount > 0
                      ? ""
                      : "opacity-60 cursor-not-allowed pointer-events-none"
                      }`}
                    onClick={(e) => handleDonate(e)}
                  >
                    Quyên góp
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-green-hover"
                    onClick={connectWallet}
                  >
                    Kết nối ví
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Donate;
