import React, { useContext } from "react";
import Head from "next/head";
import DashboardHighlight from "@/components/DashboardHighlight";
import DashboardDonations from "@/components/DashboardDonations";
import { CONTRACT_ADDRESS } from "utils/constants";
import { GetServerSideProps } from "next";
import { AppContext } from "@/context/AppContext";
import sleep from "sleep-promise";
import fs from "fs";
import path from "path";
import { loadContract } from "@/utils/interactions";
import { Charity } from "@/typings";

const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY;

function Dashboard({
  donations,
  txinternal,
  charities,
}: {
  donations: any[];
  txinternal: any[];
  charities: Charity[];
}) {
  // debug prop may be injected in props; ignore if absent
  // @ts-ignore
  const debug = (arguments[0] && arguments[0].debug) || null;
  const { connected, account } = useContext(AppContext);

  return (
    <>
      <Head>
        <title>VietTrust - Dashboard</title>
        <meta
          name="description"
          content="The Green Charity Transparency Platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="py-12 bg-white sm:py-16 lg:py-20">
        <div className="py-6">
          <div className="px-4 mx-auto sm:px-6 md:px-8">
            <div className="md:items-center md:flex">
              <p className="text-base font-bold text-gray-800">Xin chào, Bạn -</p>
              <p className="mt-1 text-base font-medium text-gray-500 md:mt-0 md:ml-2">
                đây là những gì đang diễn ra trên VietTrust
              </p>
            </div>
          </div>

          <div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
            <div className="space-y-5 sm:space-y-6">
              <DashboardHighlight donations={donations} />
              <DashboardDonations
                donations={donations}
                txinternal={txinternal}
                charities={charities}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Always read persisted charities and donations first so history survives node restarts
  let donations: any[] = [];
  let txinternal: any[] = [];
  let charities: Charity[] = [];

  // load persisted charities
  try {
    const charitiesPath = path.join(process.cwd(), "frontend-next", "data", "charities.json");
    if (fs.existsSync(charitiesPath)) {
      const raw = fs.readFileSync(charitiesPath, "utf8");
      const persistedCharities = JSON.parse(raw || "{}");
      for (const k of Object.keys(persistedCharities)) {
        const c = persistedCharities[k];
        charities.push({
          id: Number(c.id ?? k),
          name: c.name,
          mission: c.mission,
          website: c.website,
          totalDonation: c.totalDonation?.toString ? c.totalDonation.toString() : String(c.totalDonation || "0"),
          active: c.active,
          wallet: (c.wallet || "").toLowerCase(),
        });
      }
    }
  } catch (e) {
    console.log("failed reading persisted charities", e);
  }

  // load persisted donations (as fallback)
  const persistedDonations: any[] = [];
  try {
    const donationsPath = path.join(process.cwd(), "data", "donations.json");
    if (fs.existsSync(donationsPath)) {
      const raw = fs.readFileSync(donationsPath, "utf8");
      const persisted = JSON.parse(raw || "{}");
      for (const charityIdKey of Object.keys(persisted)) {
        const charityId = Number(charityIdKey);
        const entries = persisted[charityIdKey] || [];
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          const txHash = (e.txHash || e.hash || "").toString();
          const hashKey = txHash ? txHash.toLowerCase() : `local-${charityId}-${i}-${e.timestamp || Date.now()}`;
          const recipient = (charities.find((c) => c.id === charityId)?.wallet) || "";
          const donation = {
            hash: txHash || hashKey,
            value: e.amount || e.value || "0",
            timeStamp: e.timestamp || e.timeStamp || Math.floor(Date.now() / 1000),
            charityId,
            from: e.donor || e.from || "",
            fromAddress: e.donor || e.from || "",
            fromAddressRaw: e.donor || e.from || "",
            to: recipient,
          } as any;
          persistedDonations.push(donation);
          txinternal.push({ hash: donation.hash, to: donation.to });
        }
      }
    }
  } catch (e) {
    console.log("failed reading persisted donations", e);
  }

  // Try to load on-chain data and merge with persisted
  try {
    const contract = loadContract();
    if (!contract) throw new Error("Could not load contract");

    // If on-chain charities exist, prefer on-chain data but merge metadata from persisted
    const countBN = await contract.charityIdCounter();
    const count = Number(countBN.toString());
    const onChainCharities: Charity[] = [];
    for (let i = 0; i < count; i++) {
      const charity = await contract.charities(i);
      onChainCharities.push({
        id: i,
        name: charity.name,
        mission: charity.mission,
        website: charity.website,
        totalDonation: charity.totalDonation.toString(),
        active: charity.active,
        wallet: charity.wallet.toLowerCase(),
      });
    }

    // replace charities with on-chain list but preserve any extra persisted metadata by id
    if (onChainCharities.length > 0) {
      const persistedMap: Record<string, any> = {};
      try {
        const charitiesPath = path.join(process.cwd(), "frontend-next", "data", "charities.json");
        if (fs.existsSync(charitiesPath)) {
          const raw = fs.readFileSync(charitiesPath, "utf8");
          Object.assign(persistedMap, JSON.parse(raw || "{}"));
        }
      } catch (e) {
        // ignore
      }
      charities = onChainCharities.map((c) => {
        const p = persistedMap[c.id]?.["id"] !== undefined ? persistedMap[c.id] : persistedMap[String(c.id)];
        return {
          ...c,
          ...(p || {}),
          wallet: (p?.wallet || c.wallet || "").toLowerCase(),
        } as Charity;
      });
    }

    // Query DonationMade events
    const filter = contract.filters.DonationMade();
    const events = await contract.queryFilter(filter, 0, "latest");

    const onChainDonations: any[] = [];
    const onChainTxInternal: any[] = [];
    for (const ev of events.reverse()) {
      try {
        const args: any = ev.args;
        const charityId = Number(args.charityId.toString());
        const donor = args.donor;
        const amount = args.amount;
        const block = await contract.provider.getBlock(ev.blockNumber);
        const recipient = charities[charityId]?.wallet || "";

        const donation = {
          hash: ev.transactionHash,
          value: amount.toString(),
          timeStamp: block ? block.timestamp : Math.floor(Date.now() / 1000),
          charityId,
          from: donor,
          fromAddress: donor,
          fromAddressRaw: donor,
          to: recipient,
        } as any;

        onChainDonations.push(donation);
        onChainTxInternal.push({ hash: ev.transactionHash, to: recipient });
      } catch (e) {
        console.log("error mapping event", e);
      }
    }

    // Merge: prefer on-chain donations, then append persisted that are not in on-chain
    const seen = new Set(onChainDonations.map((d) => (d.hash || "").toLowerCase()));
    const remainingPersisted = persistedDonations.filter((d) => !seen.has((d.hash || "").toLowerCase()));

    donations = [...onChainDonations, ...remainingPersisted];
    // sort donations by timestamp descending (newest first)
    donations.sort((a, b) =>
      Number(b.timeStamp || b.timestamp || 0) - Number(a.timeStamp || a.timestamp || 0)
    );
    txinternal = [...onChainTxInternal, ...txinternal];

    // debug info
    const debug = {
      onChainCount: onChainDonations.length,
      persistedCount: persistedDonations.length,
      mergedCount: donations.length,
      source: "on-chain+persisted",
    };
    // persist merged donations back to data/donations.json so history is preserved across node restarts
    try {
      const out: Record<string, any[]> = {};
      for (const d of donations) {
        const id = String(typeof d.charityId !== "undefined" ? d.charityId : "0");
        if (!out[id]) out[id] = [];
        out[id].push({
          donor: d.from || d.fromAddress || "",
          amount: d.value || d.amount || "0",
          txHash: d.hash || "",
          blockNumber: d.blockNumber || null,
          timestamp: d.timeStamp || d.timestamp || Math.floor(Date.now() / 1000),
        });
      }
      const donationsPath = path.join(process.cwd(), "data", "donations.json");
      try {
        fs.writeFileSync(donationsPath, JSON.stringify(out, null, 2), "utf8");
      } catch (e) {
        console.log("failed writing merged donations", String(e));
      }
    } catch (e) {
      console.log("failed to persist merged donations", String(e));
    }

    return {
      props: { donations, txinternal, charities, debug },
    } as any;
  } catch (err) {
    // If on-chain unavailable, use persisted donations/charities already loaded
    donations = [...persistedDonations];
    // sort persisted-only donations by timestamp descending (newest first)
    donations.sort((a, b) =>
      Number(b.timeStamp || b.timestamp || 0) - Number(a.timeStamp || a.timestamp || 0)
    );
    // txinternal already populated from persistedDonations above
    console.log("on-chain unavailable, using persisted data", String(err));
  }

  // debug info when falling back to persisted only
  const debug = {
    onChainCount: 0,
    persistedCount: persistedDonations.length,
    mergedCount: donations.length,
    source: "persisted-only",
  };

  return {
    props: { donations, txinternal, charities, debug },
  };
};

export default Dashboard;
