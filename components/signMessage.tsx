import { useState } from "react";
import type { Capability } from "sats-connect";
import Wallet, {
  BitcoinNetworkType,
  RpcErrorCode,
  signMessage,
} from "sats-connect";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  network: BitcoinNetworkType;
  address: string;
  capabilities: Set<Capability>;
};

const SignMessage = ({ network, address, capabilities }: Props) => {
  const [message, setMessage] = useState("Hello World!");

  const onSignMessageClick = async () => {
    if (!address) return alert("Address is required");

    await signMessage({
      payload: {
        network: {
          type: network,
        },
        address,
        message,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled Message Signing Request"),
    });
  };

  const onSignMessageRpcClick = async () => {
    try {
      const response = await Wallet.request("signMessage", {
        address,
        message,
      });
      if (response.status === "success") {
        console.log(response);
        alert(response.result.signature);
      } else {
        const error = response;
        console.log(error);
        if (error.error.code === RpcErrorCode.USER_REJECTION) {
          alert("Canceled");
        } else {
          alert(error.error.message);
        }
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  if (!capabilities.has("signMessage")) {
    return (
      <div className="container">
        <h3>Sign message</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  const signingDisabled = message.length === 0;

  return (
    <div className="container">
      <h3>Sign message</h3>
      <p>
        <b>Address</b>
        <br />
        {address}
      </p>
      <b>Message</b>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-[400px] max-w-full bg-white"
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={onSignMessageClick} disabled={signingDisabled}>
          Sign message
        </Button>
        <Button onClick={onSignMessageRpcClick} disabled={signingDisabled}>
          Sign message RPC
        </Button>
      </div>
    </div>
  );
};

export default SignMessage;
