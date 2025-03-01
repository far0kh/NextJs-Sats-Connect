import Wallet from "sats-connect";
import { Button } from "./ui/button";

const GetInscriptions = () => {
  const getInscriptions = async () => {
    try {
      const response = await Wallet.request("ord_getInscriptions", { offset: 0, limit: 10 });
      if (response.status === "success") {
        alert("Success. Check console for response");
        console.log(response.result);
      } else {
        alert("Error getting Inscriptions. Check console for error logs");
        console.error(response.error);
      }
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="container">
      <Button onClick={getInscriptions}>Get Inscriptions</Button>
    </div>
  );
};

export default GetInscriptions;