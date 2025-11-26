import Head from "next/head";
import { GetServerSideProps } from "next";
import Hero from "@/components/Hero";
import CharitySpotlight from "@/components/CharitySpotlight";
import Mission from "@/components/Mission";
import HowItWorks from "@/components/HowItWorks";
import { CONTRACT_ADDRESS } from "utils/constants";

const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY;

export default function Home({
  latestDonationValue,
}: {
  latestDonationValue: number;
}) {
  return (
    <>
      <Head>
        <title>Chung tay vì cộng đồng Việt Nam</title>
        <meta
          name="description"
          content="The Green Charity Transparency Platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Hero latestDonationValue={latestDonationValue} />
        <CharitySpotlight />
        <HowItWorks />
        <Mission />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // NOTE: change API in production!
  let latestDonationValue: number = 0;
  const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHER_SCAN_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Etherscan can return an error object or string in `result` when something goes wrong.
    // Guard against calling .filter on a non-array.
    const results = Array.isArray(data?.result) ? data.result : [];
    if (results.length === 0) {
      // nothing to parse; leave latestDonationValue = 0
    } else {
      // prefer txs that look like donate calls, but fall back to the first tx
      const donations = results.filter((tx: any) => (tx?.functionName || "").startsWith("donate"));
      const latestDonation = (donations.length > 0 ? donations[0] : results[0]);
      latestDonationValue = latestDonation && latestDonation.value ? Number(latestDonation.value) : 0;
    }
  } catch (err) {
    console.log(err);
  }

  return {
    props: { latestDonationValue },
  };
};
