"use client";

import { useQuery } from '@tanstack/react-query';
import Wallet, { AddressPurpose } from 'sats-connect';
import { Button } from './ui/button';

export function GetAddresses() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['getAddresses'],
    queryFn: async () => {
      const res = await Wallet.request('getAddresses', {
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      });
      if (res.status === 'error') {
        throw new Error('Error getting wallet type', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  const handleGetAddressesClick = async () => {
    const res = await Wallet.request('getAddresses', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
    });
    if (res.status === 'error') {
      throw new Error('Error getting wallet type', { cause: res.error });
    }
    console.log(res.result);
  };

  return (
    <div>
      <h3>Get addresses</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get addresses
      </Button>

      {(() => {
        if (isFetching) {
          return <p>Loading...</p>;
        }

        if (isError) {
          console.error(error);
          console.error(error.cause);
          return <p>Error. Check console for details.</p>;
        }

        if (isSuccess) {
          console.log(data);
          return (
            <div>
              <p>Check console for data.</p>
            </div>
          );
        }
      })()}

      {isFetching && <p>Loading...</p>}

      {isError && (
        //   console.error(error);
        // console.error(error.cause);
        <p>Error. Check console for details.</p>
      )}

      {isSuccess && (
        // console.log(data);
        <div>
          <p>Check console for data.</p>
        </div>
      )}
    </div>
  );
}
