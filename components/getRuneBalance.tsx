import Wallet from "sats-connect";
import { Button } from "./ui/button";

const GetRunesBalance = () => {
  const getBalance = async () => {
    try {
      const response = await Wallet.request("runes_getBalance", null);
      if (response.status === "success") {
        alert("Success. Check console for response");
        console.log(response.result);
      } else {
        alert("Error getting runes balance. Check console for error logs");
        console.error(response.error);
      }
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="container">
      <Button onClick={getBalance}>Get Runes Balance</Button>
    </div>
  );
};

export default GetRunesBalance;