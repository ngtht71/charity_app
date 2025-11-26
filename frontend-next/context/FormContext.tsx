"use client";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CHARITY_REGISTRY_CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "../utils/constants";
import { loadContractWithSigner } from "../utils/interactions";
import { AppContext } from "./AppContext";
// import React, { useState, useContext } from 'react';
// import { useEffect } from 'react';
// import { EthersProvider, useEthers } from '@ethers-react/core';
// import { Contract } from 'ethers';
// import { Form } from './AddCharityForm';

export const FormContext = createContext({
  formData: {
    name: "",
    mission: "",
    website: "",
    active: false,
    wallet: "",
    image: "",
    description: "",
  },
  // @ts-expect-error For some reason Dispatch' does not exist on React
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      mission: string;
      website: string;
      active: boolean;
      wallet: string;
      image: string;
      description: string;
    }>
  >,
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => { },
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { },
  addCharity: async (
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
  ) => { },
  updateCharity: async (
    charityId: number,
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
  ) => { },
  updateCharityAllowInactive: async (
    charityId: number,
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
  ) => { },
});

function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState({
    name: "",
    mission: "",
    website: "",
    active: false,
    wallet: "",
    image: "",
    description: "",
    goalEth: '' as number | string,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.type == "checkbox") {
      console.log(target.checked);
    }
    const valueRaw: any = target.type !== 'checkbox' ? target.value : target.checked;
    let value: any = valueRaw;
    // parse numeric input for goalEth into a number (or empty string)
    if (name === 'goalEth') {
      if (valueRaw === '') value = '';
      else {
        const n = Number(valueRaw);
        value = Number.isNaN(n) ? '' : n;
      }
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(formData);
  };

  const normalizeGoalEth = (val: any) => {
    if (val === undefined || val === null || val === "") return '';
    const n = Number(val);
    if (Number.isNaN(n)) return '';
    // round to 2 decimals
    const fixed = Math.round(n * 100) / 100;
    return fixed;
  };

  // Upload image data URL to IPFS via server API and return stored URI (ipfs://<cid>)
  const uploadImageIfNeeded = async (image: string) => {
    if (!image) return '';
    try {
      if (image.startsWith('ipfs://') || image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      if (image.startsWith('data:')) {
        const r = await fetch('/api/ipfs-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: image }) });
        if (r.ok) {
          const j = await r.json();
          return j?.uri || image;
        } else {
          console.warn('IPFS upload failed', await r.text());
          return image;
        }
      }
      return image;
    } catch (e) {
      console.warn('uploadImageIfNeeded error', e);
      return image;
    }
  };

  const addCharity = async (
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
    // image and description are saved to localStorage after tx
  ) => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const contract = loadContractWithSigner();
      console.log(contract);
      const tx = await contract?.addCharity(
        name,
        mission,
        website,
        active,
        wallet
      );
      await tx.wait();
      console.log("-------------------------");
      const counter = await contract?.charityIdCounter();
      console.log(counter);
      // store metadata and full record for the new charity id
      try {
        const newId = Number(counter) - 1;
        const imageUri = await uploadImageIfNeeded(formData.image || '');
        // prepare a record to persist (both on-chain canonical fields and metadata)
        const record: any = {
          id: newId,
          name,
          mission,
          website,
          active,
          wallet,
          totalDonation: '0',
          image: imageUri || "",
          description: formData.description || "",
          goalEth: normalizeGoalEth(formData.goalEth || ''),
        };
        try {
          await fetch('/api/charities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, record }),
          });
          // also save meta separately for backwards compatibility
          try {
            await fetch('/api/charity-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newId, meta: { image: record.image, description: record.description } }) });
          } catch (e) {
            // ignore
          }
        } catch (e) {
          console.error('Error saving charity record to API:', e);
        }
      } catch (err) {
        console.error("Error saving charity metadata:", err);
      }
    } else {
      console.error("Please install MetaMask!");
      alert("Please install MetaMask!");
    }
  };

  const updateCharity = async (
    charityId: number,
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
  ) => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const contract = loadContractWithSigner();
      try {
        const tx = await contract?.updateCharity(
          charityId,
          name,
          mission,
          website,
          active,
          wallet
        );
        await tx.wait();
        // update local metadata store (upload to IPFS if needed)
        try {
          let metaImage = formData.image || '';
          try { metaImage = await uploadImageIfNeeded(metaImage); } catch (e) { console.warn('ipfs upload failed (updateCharity)', e); }
          const meta = { image: metaImage, description: formData.description || "" };
          // update persisted metadata
          await fetch('/api/charity-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: charityId, meta }),
          });
          // update persisted full record (if exists)
          try {
            const recResp = await fetch('/api/charities');
            if (recResp.ok) {
              const all = await recResp.json();
              const existing = all[charityId];
              if (existing) {
                const updated = { ...existing, name, mission, website, active, wallet, image: meta.image, description: meta.description, goalEth: normalizeGoalEth(formData.goalEth || existing.goalEth || '') };
                await fetch('/api/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: charityId, record: updated }) });
              }
            }
          } catch (e) {
            // non-fatal
          }
          // notify other parts of the app that a charity was updated
          try { window.dispatchEvent(new CustomEvent('charityUpdated', { detail: { id: charityId } })); } catch (e) { console.warn('could not dispatch charityUpdated event', e); }
        } catch (err) {
          console.error('Error saving charity metadata to API:', err);
        }
      } catch (err) {
        console.error("updateCharity error:", err);
      }
    } else {
      console.error("Please install MetaMask!");
      alert("Please install MetaMask!");
    }
  };

  // Allow updating charity even if it's currently inactive on-chain by calling
  // the new contract method `updateCharityAllowInactive` (requires redeploy).
  const updateCharityAllowInactive = async (
    charityId: number,
    name: string,
    mission: string,
    website: string,
    active: boolean,
    wallet: string
  ) => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const contract = loadContractWithSigner();
      try {
        const tx = await contract?.updateCharityAllowInactive(
          charityId,
          name,
          mission,
          website,
          active,
          wallet
        );
        await tx.wait();
        try {
          let metaImage = formData.image || '';
          try { metaImage = await uploadImageIfNeeded(metaImage); } catch (e) { console.warn('ipfs upload failed (updateCharityAllowInactive)', e); }
          const meta = { image: metaImage, description: formData.description || "" };
          await fetch('/api/charity-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: charityId, meta }) });
          try {
            const recResp = await fetch('/api/charities');
            if (recResp.ok) {
              const all = await recResp.json();
              const existing = all[charityId];
              if (existing) {
                const updated = { ...existing, name, mission, website, active, wallet, image: meta.image, description: meta.description, goalEth: normalizeGoalEth(formData.goalEth || existing.goalEth || '') };
                await fetch('/api/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: charityId, record: updated }) });
              }
            }
          } catch (e) {
            // non-fatal
          }
          try { window.dispatchEvent(new CustomEvent('charityUpdated', { detail: { id: charityId } })); } catch (e) { console.warn('could not dispatch charityUpdated event', e); }
        } catch (err) {
          console.error('Error saving charity metadata to API:', err);
        }
      } catch (err) {
        console.error("updateCharityAllowInactive error:", err);
        throw err;
      }
    } else {
      console.error("Please install MetaMask!");
      alert("Please install MetaMask!");
    }
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    console.log("Submitting");
    console.log(formData);
    try {
      // Call the addCharity function of the smart contract
      // and pass in the formData as the function arguments
      await addCharity(
        formData.name,
        formData.mission,
        formData.website,
        formData.active,
        formData.wallet
        // image/description persisted client-side
      );

      console.log("Charity added successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormContext.Provider
      value={{ formData, setFormData, handleChange, handleSubmit, addCharity, updateCharity, updateCharityAllowInactive }}
    >
      {children}
    </FormContext.Provider>
  );
}

export default FormProvider;
