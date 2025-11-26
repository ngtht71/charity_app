"use client";
import React, { createContext, useState } from "react";
import { loadContractWithSigner, loadContract } from "../utils/interactions";
import { ethers } from "ethers";

export const DonationContext = createContext({
  charityInFocus: -1,
  setCurrentCharityInFocus: (charityInFocus: number) => { },
  donationInProgress: false,
  transactionHash: "",
  transactionConfirmed: false,
  setConfirmed: (transactionConfirmed: boolean) => { },
  isSuccessful: false,
  setIsSuccessfulFlag: (isSuccessful: boolean) => { },
  donationAmount: { amount: 0 },
  handleAmount: (e: React.ChangeEvent<HTMLInputElement>, name: string) => { },
  makeDonation: async (charityId: number) => { },
});

function DonationProvider({ children }: { children: React.ReactNode }) {
  const [charityInFocus, setCharityInFocus] = useState(-1);
  const setCurrentCharityInFocus = (charityInFocus: number) =>
    setCharityInFocus(charityInFocus);
  const [donationAmount, setDonationAmount] = useState({ amount: 0 });
  const [donationInProgress, setdonationInProgress] = useState(false);
  const [transactionHash, settransactionHash] = useState("");
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);
  const setConfirmed = (transactionConfirmed: boolean) =>
    setTransactionConfirmed(transactionConfirmed);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const setIsSuccessfulFlag = (isSuccessful: boolean) =>
    setIsSuccessful(isSuccessful);

  const handleAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setDonationAmount((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
    console.log(donationAmount);
  };

  const makeDonation = async (charityId: number) => {
    setCurrentCharityInFocus(charityId);
    settransactionHash("");
    setTransactionConfirmed(false);
    setdonationInProgress(true);
    // Pre-check that the charity exists and is active on-chain.
    try {
      const readContract = loadContract();
      if (!readContract) {
        alert("Unable to read contract. Make sure provider is available.");
        setdonationInProgress(false);
        return;
      }
      // @ts-ignore - tuple returned from solidity
      const onChainCharity: any = await readContract.charities(charityId);
      // Solidity struct mapping returns: (name, mission, website, totalDonation, active, wallet)
      const name = onChainCharity?.[0] || "";
      const active = !!onChainCharity?.[4];
      if (!name || name === "" || !active) {
        // Charity not found or inactive on-chain — attempt fallback using persisted record
        try {
          const resp = await fetch('/api/charities');
          if (resp.ok) {
            const all = await resp.json();
            const persisted = all[charityId];
            if (persisted && persisted.wallet) {
              const proceed = confirm('Charity not present on-chain. Do you want to send a direct transfer to the saved wallet instead? This will not call the contract.');
              if (proceed) {
                // perform direct transfer using signer
                const signerContract = loadContractWithSigner();
                if (!signerContract) {
                  alert('No signer available. Connect your wallet to perform direct transfer.');
                  setdonationInProgress(false);
                  return;
                }
                const signer = (signerContract as any).signer;
                const tx = await signer.sendTransaction({ to: persisted.wallet, value: value });
                settransactionHash(tx.hash);
                const receipt = await tx.wait();
                setTransactionConfirmed(true);
                setIsSuccessful(true);

                // Persist donation locally similar to on-chain flow
                try {
                  const donationRecord = {
                    donor: receipt.from || tx.from || null,
                    amount: value.toString(),
                    txHash: tx.hash,
                    blockNumber: receipt.blockNumber || 0,
                    timestamp: undefined,
                  };
                  // try to fetch block timestamp
                  try {
                    const provider = signer.provider;
                    const block = await provider.getBlock(receipt.blockNumber);
                    if (block) donationRecord.timestamp = block.timestamp;
                  } catch (e) {
                    // ignore
                  }
                  await fetch('/api/donations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ charityId, donation: donationRecord }),
                  });

                  // Update persisted charities totalDonation
                  try {
                    const recResp = await fetch('/api/charities');
                    if (recResp.ok) {
                      const allRec = await recResp.json();
                      const existing = allRec[charityId];
                      if (existing) {
                        const prev = BigInt(existing.totalDonation || '0');
                        const add = BigInt(value.toString());
                        const updated = { ...existing, totalDonation: (prev + add).toString() };
                        await fetch('/api/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: charityId, record: updated }) });
                      }
                    }
                  } catch (e) {
                    // non-fatal
                  }
                } catch (err) {
                  console.error('Error persisting direct-transfer donation:', err);
                }
                setdonationInProgress(false);
                return;
              }
            }
          }
        } catch (e) {
          // ignore and fallthrough to alert
        }

        alert('This charity is not available on-chain or is not active. Cannot donate via contract.');
        setdonationInProgress(false);
        return;
      }
    } catch (preCheckErr: any) {
      console.warn("Pre-check failed when reading charity from chain", preCheckErr);
      const msg = preCheckErr?.message || String(preCheckErr);
      // If provider/connection issue, guide the developer to run a local node and deploy
      if (msg.includes('could not detect provider') || msg.includes('connection') || msg.includes('Invalid JSON RPC response')) {
        alert('Cannot connect to local chain. Start Hardhat node and deploy contracts. See console for details.');
      } else {
        alert('Unable to confirm charity on-chain: ' + msg);
      }
      setdonationInProgress(false);
      return;
    }
    const { amount } = donationAmount;
    const value = ethers.utils.parseUnits(amount.toString(), "ether");
    const contract = loadContractWithSigner();
    console.log(`donating to ${charityId}`);
    console.log(`donating...${amount}`);
    console.log(`donating...${value}`);
    try {
      const tx = await contract?.donate(charityId, {
        value: ethers.utils.parseUnits(amount.toString(), "ether"),
      });
      settransactionHash(tx.hash);
      const receipt = await tx.wait();
      setTransactionConfirmed(true);
      setIsSuccessful(true);

      // Enrich donation record with block and timestamp if available
      let blockNumber = receipt.blockNumber || 0;
      let timestamp: number | undefined = undefined;
      try {
        const provider = contract.provider;
        const block = await provider.getBlock(blockNumber);
        if (block) timestamp = block.timestamp;
      } catch (e) {
        console.warn('Could not fetch block timestamp', e);
      }

      // Persist donation to server-side store
      try {
        const donationRecord = {
          donor: receipt.from || tx.from || null,
          amount: value.toString(),
          txHash: tx.hash,
          blockNumber,
          timestamp,
        };
        await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ charityId, donation: donationRecord }),
        });

        // Update persisted charities totalDonation if persisted record exists
        try {
          const recResp = await fetch('/api/charities');
          if (recResp.ok) {
            const all = await recResp.json();
            const existing = all[charityId];
            if (existing) {
              const prev = BigInt(existing.totalDonation || '0');
              const add = BigInt(value.toString());
              const updated = { ...existing, totalDonation: (prev + add).toString() };
              await fetch('/api/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: charityId, record: updated }) });
            }
          }
        } catch (e) {
          // non-fatal
        }
      } catch (err) {
        console.error('Error persisting donation:', err);
      }
    } catch (err: any) {
      console.log(err.message);
    }
    setdonationInProgress(false);
  };

  return (
    <DonationContext.Provider
      value={{
        charityInFocus,
        setCurrentCharityInFocus,
        transactionConfirmed,
        setConfirmed,
        transactionHash,
        donationInProgress,
        isSuccessful,
        setIsSuccessfulFlag,
        donationAmount,
        handleAmount,
        makeDonation,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export default DonationProvider;
