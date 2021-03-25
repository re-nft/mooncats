import request from "graphql-request";
import React, { useContext, useEffect, useState } from "react";
import { AdoptionOffer } from "../contexts/graph/types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { ENDPOINT_MOONCAT_PROD, ALL_OFFERED_CATS_TAKE_COUNT } from "../consts";
import { queryAllOffers } from "../contexts/graph/queries";

const useOffers = (): {
  offers: AdoptionOffer[];
  error: Error | null;
  isOffersFetching: boolean;
  setLastOfferId: React.Dispatch<React.SetStateAction<string>>;
} => {
  const [offers, setOffers] = useState<AdoptionOffer[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isOffersFetching, setIsOffersFetching] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [lastOfferId, setLastOfferId] = useState("");

  useEffect(() => {
    setOffers([]);
  }, []);

  useEffect(() => {
    const fetchAllOffers = async () => {
      setIsOffersFetching(true);
      try {
        if (!currentAddress) new Error("Address undefined");
        const offersQuery = queryAllOffers(
          ALL_OFFERED_CATS_TAKE_COUNT,
          lastOfferId
        );
        const { offerPrices } = await request(
          ENDPOINT_MOONCAT_PROD,
          offersQuery
        );

        setOffers((prevOffers) => [...prevOffers, ...offerPrices]);
      } catch (err) {
        setError(err);
        console.error({ fetchAllOffersError: err });
      }
      setIsOffersFetching(false);
    };

    fetchAllOffers();
  }, [currentAddress, lastOfferId]);

  return { offers, error, isOffersFetching, setLastOfferId };
};

export default useOffers;
