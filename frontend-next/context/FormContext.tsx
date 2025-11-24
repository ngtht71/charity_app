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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.type == "checkbox") {
      console.log(target.checked);
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: target.type != "checkbox" ? (target.value as any) : (target.checked as any),
    }));
    console.log(formData);
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
      // store metadata (image/description) in localStorage for the new charity id
      try {
        const newId = Number(counter) - 1;
        if (typeof window !== "undefined") {
          const meta = {
            image: formData.image || "",
            description: formData.description || "",
          };
          localStorage.setItem(`charity_meta_${newId}`, JSON.stringify(meta));
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
        // update local metadata store
        try {
          if (typeof window !== "undefined") {
            const meta = {
              image: formData.image || "",
              description: formData.description || "",
            };
            localStorage.setItem(`charity_meta_${charityId}`, JSON.stringify(meta));
          }
        } catch (err) {
          console.error("Error saving charity metadata:", err);
        }
      } catch (err) {
        console.error("updateCharity error:", err);
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
      value={{ formData, setFormData, handleChange, handleSubmit, addCharity, updateCharity }}
    >
      {children}
    </FormContext.Provider>
  );
}

export default FormProvider;
