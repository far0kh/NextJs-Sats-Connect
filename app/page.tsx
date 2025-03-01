"use client";

import type { Capability } from "sats-connect";
import Wallet, {
  AddressPurpose,
  BitcoinNetworkType,
  getCapabilities,
  getProviders,
} from "sats-connect";

import CreateFileInscription from "@/components/createFileInscription";
import CreateTextInscription from "@/components/createTextInscription";
import SendBitcoin from "@/components/sendBitcoin";
import SignMessage from "@/components/signMessage";
import SignTransaction from "@/components/signTransaction";

// Stacks
import StxCallContract from "@/components/stacks/callContract";
import StxDeployContract from "@/components/stacks/deployContract";
import StxGetAccounts from "@/components/stacks/getAccounts";
import StxGetAddresses from "@/components/stacks/getAddresses";
import StxSignMessage from "@/components/stacks/signMessage";
import StxSignStructuredMessage from "@/components/stacks/signStructuredMessage";
import StxSignTransaction from "@/components/stacks/signTransaction";
import StxTransferStx from "@/components/stacks/transferStx";

import { useLocalStorage } from "@/hooks/useLocalStorage";

import { useEffect, useMemo, useState } from "react";
import CreateRepeatInscriptions from "@/components/createRepeatInscriptions";
import SignBulkTransaction from "@/components/signBulkTransaction";
import GetInscriptions from "@/components/getInscriptions";
import GetRunesBalance from "@/components/getRuneBalance";
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/hooks/use-toast"
import { GetAddresses } from "@/components/getAddresses";

export default function Home() {
  const [paymentAddress, setPaymentAddress] = useLocalStorage("paymentAddress");
  const [paymentPublicKey, setPaymentPublicKey] = useLocalStorage("paymentPublicKey");
  const [ordinalsAddress, setOrdinalsAddress] = useLocalStorage("ordinalsAddress");
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useLocalStorage("ordinalsPublicKey");
  const [stacksAddress, setStacksAddress] = useLocalStorage("stacksAddress");
  const [stacksPublicKey, setStacksPublicKey] = useLocalStorage("stacksPublicKey");
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType.Mainnet | BitcoinNetworkType.Signet | BitcoinNetworkType.Testnet4>(
    "network",
    BitcoinNetworkType.Testnet4
  );
  const [capabilityState, setCapabilityState] = useState<
    "loading" | "loaded" | "missing" | "cancelled"
  >("loading");
  const [capabilities, setCapabilities] = useState<Set<Capability>>();
  const providers = useMemo(() => getProviders(), []);

  useEffect(() => {
    const runCapabilityCheck = async () => {
      let runs = 0;
      const MAX_RUNS = 20;
      setCapabilityState("loading");

      // the wallet's in-page script may not be loaded yet, so we'll try a few times
      while (runs < MAX_RUNS) {
        try {
          await getCapabilities({
            onFinish(response) {
              setCapabilities(new Set(response));
              setCapabilityState("loaded");
            },
            onCancel() {
              setCapabilityState("cancelled");
            },
            payload: {
              network: {
                type: network,
              },
            },
          });
        } catch (e) {
          runs++;
          if (runs === MAX_RUNS) {
            setCapabilityState("missing");
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    runCapabilityCheck();
  }, [network]);

  const isReady =
    !!capabilities &&
    !!paymentAddress &&
    !!paymentPublicKey &&
    !!ordinalsAddress &&
    !!ordinalsPublicKey;

  const onWalletDisconnect = async () => {
    await Wallet.disconnect();
    setPaymentAddress(undefined);
    setPaymentPublicKey(undefined);
    setOrdinalsAddress(undefined);
    setOrdinalsPublicKey(undefined);
    setStacksAddress(undefined);
  };

  const handleGetInfo = async () => {
    try {
      const response = await Wallet.request("getInfo", null);

      if (response.status === "success") {
        toast({ title: "Success", description: "Check console for response." });
        console.log(response.result);
      } else {
        toast({ description: "Error getting info. Check console for error logs" });
        console.error(response.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleNetwork = () => {
    setNetwork(
      // network === BitcoinNetworkType.Testnet4
      //   ? BitcoinNetworkType.Signet
      //   : network === BitcoinNetworkType.Signet ? BitcoinNetworkType.Mainnet
      //     : BitcoinNetworkType.Testnet4
      network === BitcoinNetworkType.Testnet4
        ? BitcoinNetworkType.Mainnet
        : BitcoinNetworkType.Testnet4
    );
  };

  const onConnectAccountClick = async () => {
    const res1 = await Wallet.request('wallet_requestPermissions', undefined);
    if (res1.status === 'error') {
      console.error('Error connecting to wallet, details in terminal.');
      console.error(res1);
      return;
    }

    const res2 = await Wallet.request('getAddresses', {
      purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
    });
    if (res2.status === "success" && Array.isArray(res2.result.addresses)) {
      const paymentAddressItem = res2.result.addresses.find(
        (address) => address.purpose === AddressPurpose.Payment
      );
      setPaymentAddress(paymentAddressItem?.address);
      setPaymentPublicKey(paymentAddressItem?.publicKey);

      const ordinalsAddressItem = res2.result.addresses.find(
        (address) => address.purpose === AddressPurpose.Ordinals
      );
      setOrdinalsAddress(ordinalsAddressItem?.address);
      setOrdinalsPublicKey(ordinalsAddressItem?.publicKey);
    } else {
      toast({ description: "Error retrieving bitcoin addresses after having requested permissions." });
      console.error(res2);
      return;
    }

    const res3 = await Wallet.request('stx_getAddresses', null);
    if (res3.status === "success" && Array.isArray(res3.result.addresses)) {
      const stacksAddressItem = res3.result.addresses.find(
        (address) => address.purpose === AddressPurpose.Stacks
      );
      setStacksAddress(stacksAddressItem?.address);
      setStacksPublicKey(stacksAddressItem?.publicKey);
    } else {
      toast({ description: "Error retrieving stacks addresses after having requested permissions. Details in terminal." });
      console.error(res3);
      return;
    }
  };

  const onConnectLegacyClick = async () => {
    const response = await Wallet.request("getAccounts", {
      purposes: [
        AddressPurpose.Ordinals,
        AddressPurpose.Payment,
        AddressPurpose.Stacks,
      ],
      message: "SATS Connect Demo",
    });
    if (response.status === "success") {
      const paymentAddressItem = response.result.find(
        (address) => address.purpose === AddressPurpose.Payment
      );
      setPaymentAddress(paymentAddressItem?.address);
      setPaymentPublicKey(paymentAddressItem?.publicKey);

      const ordinalsAddressItem = response.result.find(
        (address) => address.purpose === AddressPurpose.Ordinals
      );
      setOrdinalsAddress(ordinalsAddressItem?.address);
      setOrdinalsPublicKey(ordinalsAddressItem?.publicKey);

      const stacksAddressItem = response.result.find(
        (address) => address.purpose === AddressPurpose.Stacks
      );
      setStacksAddress(stacksAddressItem?.address);
      setStacksPublicKey(stacksAddressItem?.publicKey);
    } else {
      if (response.error) {
        toast({ description: "Error getting accounts. Check console for error logs" });
        console.error(response.error);
      }
    }
  };

  const capabilityMessage =
    capabilityState === "loading"
      ? "Checking capabilities..."
      : capabilityState === "cancelled"
        ? "Capability check cancelled by wallet. Please refresh the page and try again."
        : capabilityState === "missing"
          ? "Could not find an installed Sats Connect capable wallet. Please install a wallet and try again."
          : !capabilities
            ? "Something went wrong with getting capabilities"
            : undefined;

  // if (capabilityMessage) {
  //   return (
  //     <div style={{ padding: 30 }}>
  //       <h1>Sats Connect - {network}</h1>
  //       <div>{capabilityMessage}</div>
  //     </div>
  //   );
  // }

  const header = (
    <div className="w-full bg-black rounded-lg">
      <img src="/logo-dark.webp" alt="Beyonds Logo" className="w-48 px-4 py-2" />
    </div>
  )

  if (!isReady) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {header}
        <div className="flex flex-col gap-4 justify-start items-start">
          <h4>Network: <span className="text-orange-500">{network}</span></h4>
          <Button onClick={toggleNetwork}>
            Switch Network
          </Button>
        </div>
        <div className="mt-4"><h4>Please connect your wallet to continue:</h4></div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button onClick={onConnectAccountClick}>
              Connect Account
            </Button>
            <Button onClick={onConnectLegacyClick}>
              Connect Legacy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-6">
      {header}
      <h4>Connected Addresses - ({network})</h4>
      <div>
        <div className="flex flex-col gap-4">
          <div>
            <h4>Payment</h4>
            <p><b>Address:</b> {paymentAddress}</p>
            <p><b>Public Key:</b> {paymentPublicKey}</p>
          </div>
          <div className="mt-4">
            <h4>Ordinals</h4>
            <p><b>Address:</b> {ordinalsAddress}</p>
            <p><b>Public Key:</b> {ordinalsPublicKey}</p>
          </div>
          {/* <div className="mt-4">
            <h4>Stacks</h4>
            <p><b>Address:</b> {stacksAddress}</p>
            <p><b>Public Key:</b> {stacksPublicKey}</p>
          </div> */}
          <Button onClick={onWalletDisconnect}>Disconnect</Button>
        </div>

        <div className="container">
          <GetAddresses />
          <h3>Get Wallet Info</h3>
          <Button onClick={handleGetInfo}>Request Info</Button>
        </div>

        <SignTransaction
          paymentAddress={paymentAddress}
          paymentPublicKey={paymentPublicKey}
          ordinalsAddress={ordinalsAddress}
          ordinalsPublicKey={ordinalsPublicKey}
          network={network}
          capabilities={capabilities!}
        />

        <SignBulkTransaction
          paymentAddress={paymentAddress}
          paymentPublicKey={paymentPublicKey}
          ordinalsAddress={ordinalsAddress}
          ordinalsPublicKey={ordinalsPublicKey}
          network={network}
          capabilities={capabilities!}
        />

        <SignMessage
          address={ordinalsAddress}
          network={network}
          capabilities={capabilities!}
        />

        <SendBitcoin
          address={paymentAddress}
          network={network}
          capabilities={capabilities!}
        />

        <GetInscriptions />
        <GetRunesBalance />

        <CreateTextInscription network={network} capabilities={capabilities!} />

        <CreateRepeatInscriptions
          network={network}
          capabilities={capabilities!}
        />

        <CreateFileInscription network={network} capabilities={capabilities!} />
      </div>
      {false && stacksAddress && (
        <>
          <h2>Stacks</h2>
          <div>
            <p>Stacks Address: {stacksAddress}</p>
            <p>Stacks PubKey: {stacksPublicKey}</p>
            <br />

            <StxGetAccounts />

            <StxGetAddresses />

            <StxTransferStx address={stacksAddress!} />

            <StxSignTransaction
              network={network}
              publicKey={stacksPublicKey || ""}
            />

            <StxCallContract network={network} />

            <StxSignMessage network={network} />

            <StxSignStructuredMessage network={network} />

            <StxDeployContract network={network} />
          </div>
        </>
      )}
    </div>
  );
}
