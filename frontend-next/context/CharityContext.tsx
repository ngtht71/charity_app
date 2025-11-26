"use client";
import detectEthereumProvider from "@metamask/detect-provider";
import React, { createContext, useEffect, useState } from "react";
import { loadContractWithSigner, loadContract } from "../utils/interactions";
import { ethers } from "ethers";

interface Charity {
  id: number;
  name: string;
  mission: string;
  website: string;
  totalDonation: string;
  // totalDonation stored as wei string for consistency with persisted data
  // (use ethers.utils.formatEther to convert)
  active: boolean;
  wallet: string;
  image?: string;
  description?: string;
  goalEth?: number;
}

interface CharityContextType {
  charities: Charity[];
  setCharitiesData: (charities: Charity[]) => void;
  getCharities: () => Promise<Charity[]>;
  getDonations: (charityId: number) => Promise<{
    donor: string;
    amount: string;
    txHash: string;
    blockNumber: number;
    timestamp?: number;
  }[]>;
}

export const CharityContext = createContext<CharityContextType>({
  charities: [],
  setCharitiesData: (charities: Charity[]) => { },
  getCharities: async () => {
    return [];
  },
  getDonations: async (charityId: number) => {
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
      // fetch metadata map from API
      let metaMap: Record<string, { image?: string; description?: string }> = {};
      try {
        const resp = await fetch('/api/charity-meta');
        if (resp && resp.ok) metaMap = await resp.json();
      } catch (e) {
        console.warn('Could not fetch charity metadata API', e);
      }

      for (let i = 0; i < count; i++) {
        // Fetch charity by ID since ID is the same as index
        const charity = await contract.charities(i);

        // attempt to read metadata (image/description) from server-side JSON store
        let meta: { image?: string; description?: string } = {};
        try {
          if (metaMap && metaMap[i]) meta = metaMap[i];
        } catch (err) {
          console.error('Error reading charity meta from API', err);
        }
        // Parse charity data
        // map IPFS URIs to gateway URLs for rendering
        let imageUrl = meta.image || "";
        try {
          if (imageUrl && imageUrl.startsWith('ipfs://')) {
            const cid = imageUrl.replace('ipfs://', '');
            imageUrl = `https://nftstorage.link/ipfs/${cid}`;
          }
        } catch (e) {
          // ignore
        }
        charities.push({
          id: i,
          name: charity.name,
          mission: charity.mission,
          website: charity.website,
          // store as string (wei) for consistency with persisted records
          totalDonation: (charity.totalDonation ? charity.totalDonation.toString() : '0'),
          active: charity.active,
          wallet: (charity.wallet || '').toLowerCase(),
          image: imageUrl,
          description: meta.description || "",
          goalEth: 0,
        });
      }
      // merge any persisted records for ids beyond on-chain count or to fill missing data
      try {
        const recResp = await fetch('/api/charities');
        if (recResp.ok) {
          const saved = await recResp.json();
          for (const key of Object.keys(saved)) {
            const idNum = Number(key);
            const exists = charities.find((c) => Number(c.id) === idNum);
            const rec = saved[key];
            if (exists) {
              // fill missing fields
              exists.image = exists.image || (rec.image && (rec.image.startsWith('ipfs://') ? `https://nftstorage.link/ipfs/${rec.image.replace('ipfs://', '')}` : rec.image)) || '';
              exists.description = exists.description || rec.description || '';
              exists.name = exists.name || rec.name || '';
              exists.mission = exists.mission || rec.mission || '';
              exists.website = exists.website || rec.website || '';
              // Prefer persisted non-zero totalDonation when available (rec.totalDonation stored as wei string)
              const recTotal = rec?.totalDonation ?? '0';
              if (recTotal && recTotal !== '0') {
                exists.totalDonation = recTotal;
              } else {
                exists.totalDonation = exists.totalDonation ?? '0';
              }
              exists.wallet = exists.wallet || (rec.wallet || '').toLowerCase();
              // copy persisted goal if present (coerce to number)
              if (typeof rec?.goalEth !== 'undefined' && rec.goalEth !== '') {
                exists.goalEth = Number(rec.goalEth);
              } else if (typeof rec?.targetEth !== 'undefined' && rec.targetEth !== '') {
                exists.goalEth = Number(rec.targetEth);
              } else {
                exists.goalEth = exists.goalEth ?? 0;
              }
            } else {
              // add persisted record (useful when chain reset)
              const imageFromRec = rec.image && rec.image.startsWith('ipfs://') ? `https://nftstorage.link/ipfs/${rec.image.replace('ipfs://', '')}` : (rec.image || '');
              charities.push({
                id: idNum,
                name: rec.name || '',
                mission: rec.mission || '',
                website: rec.website || '',
                totalDonation: rec.totalDonation || '0',
                active: rec.active || false,
                wallet: (rec.wallet || '').toLowerCase(),
                image: imageFromRec,
                description: rec.description || '',
                goalEth: typeof rec?.goalEth !== 'undefined' && rec.goalEth !== '' ? Number(rec.goalEth) : (typeof rec?.targetEth !== 'undefined' && rec.targetEth !== '' ? Number(rec.targetEth) : 0),
              });
            }
          }
        }
      } catch (e) {
        // ignore
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

  const getDonations = async (charityId: number) => {
    try {
      // use provider-based contract to query events
      const providerContract = loadContractWithSigner();
      // loadContractWithSigner returns contract with signer; for queryFilter, provider contract is fine
      const readContract = loadContract();
      const contract = readContract || providerContract;
      if (!contract) return [];

      const filter = contract.filters.DonationMade(charityId);
      const events = await contract.queryFilter(filter, 0, "latest");
      const results: any[] = [];
      for (const ev of events) {
        const donor = ev.args?.donor;
        const amount = ev.args?.amount;
        const txHash = ev.transactionHash;
        const blockNumber = ev.blockNumber || 0;
        let timestamp: number | undefined = undefined;
        try {
          const provider = contract.provider;
          const block = await provider.getBlock(blockNumber);
          if (block) timestamp = block.timestamp;
        } catch (e) {
          // ignore
        }
        results.push({ donor, amount: amount?.toString(), txHash, blockNumber, timestamp });
      }
      // Convert on-chain results to normalized shape
      const onChain = results.map((r) => ({
        donor: (r.donor || '').toLowerCase(),
        amount: r.amount?.toString() || '0',
        txHash: r.txHash,
        blockNumber: r.blockNumber || 0,
        timestamp: r.timestamp,
      }));

      // Fetch persisted donations from server-side store and merge
      let persisted: any[] = [];
      try {
        const resp = await fetch(`/api/donations?id=${charityId}`);
        if (resp.ok) persisted = await resp.json();
      } catch (e) {
        // ignore
      }

      // Normalize persisted entries (ensure donor, amount, txHash, blockNumber, timestamp)
      const persistedNorm = (persisted || []).map((p: any, idx: number) => ({
        donor: (p.donor || '').toLowerCase(),
        amount: (p.amount || p.value || '0').toString(),
        txHash: p.txHash || p.tx || `persisted-${charityId}-${idx}-${Date.now()}`,
        blockNumber: p.blockNumber || 0,
        timestamp: p.timestamp,
      }));

      // Merge by txHash to avoid duplicates
      const map: Record<string, any> = {};
      for (const o of onChain) map[o.txHash] = o;
      for (const p of persistedNorm) map[p.txHash] = { ...(map[p.txHash] || {}), ...p };

      const merged = Object.values(map) as any[];
      // sort by timestamp desc (fall back to blockNumber)
      merged.sort((a, b) => {
        const ta = a.timestamp || 0;
        const tb = b.timestamp || 0;
        if (ta !== tb) return tb - ta;
        return (b.blockNumber || 0) - (a.blockNumber || 0);
      });

      return merged;
    } catch (err) {
      console.error("getDonations error:", err);
      return [];
    }
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
      value={{ getCharities, charities, setCharitiesData, getDonations }}
    >
      {children}
    </CharityContext.Provider>
  );
}

export default CharityProvider;
