"use client";
import detectEthereumProvider from "@metamask/detect-provider";
import React, { createContext, useEffect, useState } from "react";
import { loadContractWithSigner } from "../utils/interactions";
import { ethers } from "ethers";

interface Charity {
  id: number;
  name: string;
  mission: string;
  website: string;
  totalDonation: number;
  active: boolean;
  wallet: string;
  image?: string;
  description?: string;
}

interface CharityContextType {
  charities: Charity[];
  setCharitiesData: (charities: Charity[]) => void;
  getCharities: () => Promise<Charity[]>;
}

export const CharityContext = createContext<CharityContextType>({
  charities: [],
  setCharitiesData: (charities: Charity[]) => { },
  getCharities: async () => {
    return [];
  },
});

function CharityProvider({ children }: { children: React.ReactNode }) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const setCharitiesData = (charities: Charity[]) => {
    setCharities(charities);
  };

  useEffect(() => {
    const initContract = () => {
      // This code runs only on the client side
      const contractInstance = loadContractWithSigner();
      setContract(contractInstance);
    };
    initContract();
  }, []);

  const _getCharities = async () => {
    if (!contract) {
      console.log("Contract not loaded yet");
      return [];
    }
    try {
      const count = await contract.charityIdCounter();
      console.log(`Charity count: ${count}`);
      // Fetch all charities
      const charities: Charity[] = [];
      for (let i = 0; i < count; i++) {
        // Fetch charity by ID since ID is the same as index
        const charity = await contract.charities(i);

        // attempt to read metadata (image/description) from localStorage
        let meta: { image?: string; description?: string } = {};
        try {
          if (typeof window !== "undefined") {
            const raw = localStorage.getItem(`charity_meta_${i}`);
            if (raw) meta = JSON.parse(raw);
          }
        } catch (err) {
          console.error("Error reading charity meta from localStorage", err);
        }
        // Parse charity data
        charities.push({
          id: i,
          name: charity.name,
          mission: charity.mission,
          website: charity.website,
          totalDonation: charity.totalDonation,
          active: charity.active,
          wallet: charity.wallet.toLowerCase(),
          image: meta.image || "",
          description: meta.description || "",
        });
      }
      return charities;
    } catch (error) {
      console.error("Error fetching charities (_getCharities):", error);
      // The CALL_EXCEPTION originates here if the contract is still not found.
      return [];
    }
  };

  // Due to bugs in Nextjs 13 and the wakeable.then errors, I will implement the charities list without using state for now
  // by passing the function as a prop to the charitylist function to be called

  const getCharities = async () => {
    const charities = await _getCharities();
    return charities;
  };

  // const getCharities = async () => {
  //   return [];
  // };

  useEffect(() => {
    const handleCharities = async () => {
      console.log("debugging charity context");
      // contract?.on(
      //   "CharityAdded",
      //   async (charityId, name, mission, website, active, wallet) => {}
      // );
      // const charities = await _getCharities();
      // console.log(`charities: ${charities}`);
      // setCharities(charities); //Giving errors due to buggy nextjs 13 appdir
    };

    handleCharities();
  }, []);

  return (
    <CharityContext.Provider
      value={{ getCharities, charities, setCharitiesData }}
    >
      {children}
    </CharityContext.Provider>
  );
}

export default CharityProvider;
