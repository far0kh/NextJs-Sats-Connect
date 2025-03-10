import { useState } from "react";
import type { Capability } from "sats-connect";
import Wallet, {
  BitcoinNetworkType,
  RpcErrorCode,
  request,
  sendBtcTransaction,
} from "sats-connect";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type Props = {
  network: BitcoinNetworkType;
  address: string;
  capabilities: Set<Capability>;
};

const SendBitcoin = ({ network, address, capabilities }: Props) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0n);

  const onSendBtcClick = async () => {
    await sendBtcTransaction({
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: recipient,
            amountSats: amount,
          },
          // you can add more recipients here
        ],
        senderAddress: address!,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  const onSendBtcRpc = async () => {
    try {
      const response = await Wallet.request("sendTransfer", {
        recipients: [
          {
            address: recipient,
            amount: Number(amount),
          },
        ],
      });
      if (response.status === "success") {
        console.log(response);
        alert(response.result.txid);
      } else {
        const error = response;
        console.log(error);
        if (error.error.code === RpcErrorCode.USER_REJECTION) {
          alert("Canceled");
        } else {
          alert(error.error.message);
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  if (network !== BitcoinNetworkType.Testnet4)
    return (
      <div className="container">
        <h3>Send Bitcoin</h3>
        <div>Only available on testnet</div>
      </div>
    );

  if (!capabilities.has("sendBtcTransaction")) {
    return (
      <div className="container">
        <h3>Send Bitcoin</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  const sendDisabled = recipient.length === 0;

  return (
    <div className="container">
      <h3>Send Bitcoin</h3>
      <p>
        <b>From address</b>
        <br />
        {address}
      </p>
      <p>
        <b>Recipient address</b>
        <br />
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-[600px] max-w-full bg-white"
        />
      </p>
      <p>
        <b>Send amount</b>
        <br />
        <Input
          type="number"
          value={amount.toString()}
          onChange={(e) => setAmount(BigInt(e.target.value))}
          className="w-[100px] max-w-full bg-white"
        />
      </p>
      <div className="flex gap-2">
        <Button onClick={onSendBtcClick} disabled={sendDisabled}>
          Send BTC Transaction
        </Button>
        <Button onClick={onSendBtcRpc} disabled={sendDisabled}>
          Send BTC RPC
        </Button>
      </div>
    </div>
  );
};

export default SendBitcoin;
