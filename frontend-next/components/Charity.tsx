import { compressAddress } from "@/utils/helper";
import { ethers } from "ethers";
import { useState } from "react";
import { useRouter } from "next/router";

type CharityProps = {
  id: number;
  name: string;
  mission: string;
  website: string;
  totalDonation: number;
  active: boolean;
  // @ts-expect-error
  wallet: ethers.utils.Address;
  image?: string;
  description?: string;
};

interface CharityPropsWithDonationModal extends CharityProps {
  // toggleModal: () => void;
  donationProps: {
    setCharity: (charityId: number) => void;
    toggleDonationModal: () => void;
  };
}

function Charity({
  id,
  name,
  mission,
  website,
  totalDonation,
  active,
  wallet,
  image,
  description,
  donationProps,
}: CharityPropsWithDonationModal) {
  const { setCharity, toggleDonationModal } = donationProps;
  const handleClick = () => {
    toggleDonationModal();
    setCharity(id);
  };
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const goToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/causes/${id}`);
  };

  return (
    <div
      id={id.toString()}
      className="overflow-hidden transition-all duration-100 transform bg-white border border-gray-100 rounded-lg hover:shadow-lg hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="object-cover w-5 h-5 rounded-full shrink-0"
              src="/images/author.png"
              alt=""
            />
            {/* NOTE: link below will change in production */}
            <a
              href={`https://goerli.etherscan.io/address/${wallet}#internaltx`}
              target="_blank"
              rel="noreferrer"
              title=""
              className="ml-2 text-sm font-medium text-gray-900"
            >
              {" "}
              {compressAddress(wallet.toLowerCase())}{" "}
            </a>
          </div>
          {active ? (
            <span className="px-2 py-1.5 text-xs font-medium text-white rounded bg-blue-400">
              {" "}
              Hoạt động{" "}
            </span>
          ) : (
            <span className="px-2 py-1.5 text-xs font-medium text-white rounded bg-red-400">
              {" "}
              Không hoạt động{" "}
            </span>
          )}
        </div>

        <div className="block mt-4 overflow-hidden rounded-lg aspect-w-3 aspect-h-2">
          <div
            className="w-full h-40 rounded-lg bg-center bg-cover"
            style={{ backgroundImage: `url(${image || "/images/forest.jpg"})` }}
          />
        </div>

        <div className="mt-4">
          {active ? (
            <div className="flex items-center">
              {id < 3 ? (
                <>
                  <p className="text-sm font-medium text-gray-500">Top Pick</p>
                  <div className="relative top-[-3px]">
                    <img
                      className="w-5 h-5 "
                      src="/images/fire.gif"
                      alt="fire"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-gray-500">Featured</p>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-500">Defunct</p>
            </div>
          )}
          <div className="mt-2">
            <div className="text-base font-bold text-gray-900 flex items-center justify-between">
              <a href={website} target="_blank" rel="noreferrer" title="" className="truncate max-w-[220px]">
                {name}
              </a>
              {isHovered ? (
                <img className="w-5 h-5" src="/images/verified-animated.gif" alt="verified" />
              ) : (
                <img className="w-5 h-5 " src="/images/verified.png" alt="verified" />
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {description ? description : mission}
            </p>

            <p className="mt-2 text-sm font-medium text-green">
              Tổng số tiền quyên góp {ethers.utils.formatEther(totalDonation.toString())} ETH
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 space-x-4">
          <a
            href={`/causes/${id}`}
            onClick={goToDetail}
            className="md:whitespace-nowrap inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-gray-900 uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Xem Thêm
          </a>

          {active ? (
            <button
              type="button"
              className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
              onClick={handleClick}
            >
              Gây quỹ
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700 opacity-60 cursor-not-allowed pointer-events-none"
            >
              Gây quỹ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DefaultCharity({ toggleModal }: { toggleModal: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="overflow-hidden transition-all duration-100 transform bg-white border border-gray-100 rounded-lg hover:shadow-lg hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="object-cover w-5 h-5 rounded-full shrink-0"
              src="/images/author.png"
              alt=""
            />
            <a
              href={`https://goerli.etherscan.io/address/`}
              target="_blank"
              rel="noreferrer"
              title=""
              className="ml-2 text-sm font-medium text-gray-900"
            >
              {" "}
              0xdd...2e08{" "}
            </a>
          </div>

          <span className="px-2 py-1.5 text-xs font-medium text-white rounded bg-red-400">
            {" "}
            Không hoạt động{" "}
          </span>
        </div>

        <div
          title=""
          className="block mt-4 overflow-hidden rounded-lg aspect-w-3 aspect-h-2"
        >
          <img
            className="object-cover w-full h-full"
            src="https://cdn.pixabay.com/photo/2016/11/29/08/51/forest-1868529_960_720.jpg"
            alt=""
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-500">Defunct</p>
          </div>
          <div className="mt-2 text-base font-bold text-gray-900">
            <div className="flex items-center space-x-1">
              <a href="#" title="">
                {" "}
                Quỹ Khí Hậu Châu Phi{" "}
              </a>
              {isHovered ? (
                <img
                  className="w-5 h-5"
                  src="/images/verified-animated.gif"
                  alt="verified"
                />
              ) : (
                <img
                  className="w-5 h-5 "
                  src="/images/verified.png"
                  alt="verified"
                />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-green">
            Tổng số tiền quyên góp 1.903 ETH
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 space-x-4">
          <button
            type="button"
            className="md:whitespace-nowrap inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-gray-900 uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            See More
          </button>

          {/* <button
            type="button"
            className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
            onClick={toggleModal}
          >
            Donate
          </button> */}
          <button
            type="button"
            className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-green border border-transparent rounded md:px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700 opacity-60 cursor-not-allowed pointer-events-none"
          >
            Gây quỹ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Charity;
