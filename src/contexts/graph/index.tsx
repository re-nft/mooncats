import React, { createContext, useContext, useState, useEffect } from "react";
import { request } from "graphql-request";
import { ethers } from "ethers";
import { CurrentAddressContext } from "../../hardhat/SymfoniContext";
import { timeItAsync } from "../../utils";

import {
  queryMyMoonCats,
  queryAllCats,
  queryCatById,
  queryAllRequests,
  queryAllOffers,
} from "./queries";
import { Cat, CatInfo, AdoptionRequest, AdoptionOffer } from "./types";

const ENDPOINT_MOONCAT_PROD =
  "https://api.thegraph.com/subgraphs/id/QmNTtZFaRTiqX3ZLuE86crx75nAYPydMsTyee95SUMyE9J";

type GraphContextType = {
  usersMoonCats: Cat[];
  allMoonCats: Cat[];
  allRequests: AdoptionRequest[];
  allOffers: AdoptionOffer[];
  isDataLoading: boolean;
  catInfo: Record<string, CatInfo>;
  fetchCatById(catId: string): Promise<Cat | undefined>;
  fetchAllMoonCats(take: number, skip: number): Promise<Cat[] | undefined>;
};

const DefaultGraphContext: GraphContextType = {
  usersMoonCats: [],
  allMoonCats: [],
  allRequests: [],
  allOffers: [],
  catInfo: {},
  isDataLoading: false,
  // @ts-ignore
  fetchAllMoonCats: () => {
    return [];
  },
  // @ts-ignore
  fetchCatById: () => {
    return [];
  },
  // @ts-ignore
  fetchAllAdoptionAsks: () => {
    return [];
  },
  // @ts-ignore
  fetchAllAdoptionBids: () => {
    return [];
  },
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const [isDataLoading, setDataLoading] = useState<boolean>(Boolean);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [usersMoonCats, setUsersMoonCats] = useState<Cat[]>([]);
  const [allMoonCats, _] = useState<Cat[]>([]);
  const [allRequests, setAllRequests] = useState<AdoptionRequest[]>([]);
  const [allOffers, setAllOffers] = useState<AdoptionOffer[]>([]);
  const [catInfo, setCatInfo] = useState<Record<string, CatInfo>>({});

  const fetchMyMoonCats = async () => {
    if (!currentAddress) return;
    const query = queryMyMoonCats(currentAddress);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      owners: { cats?: Cat[] }[];
    } = await timeItAsync(
      `Pulled My Moon Cat Nfts`,
      async () => await request(subgraphURI, query)
    );
    const [first] = response.owners;
    if (first) {
      setUsersMoonCats(first?.cats ?? []);
    }
  };

  const fetchAllMoonCats = async (
    take: number,
    skip: number
  ): Promise<Cat[] | undefined> => {
    if (!currentAddress) return;
    const query = queryAllCats(take, skip);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      cats: Cat[];
    } = await timeItAsync(
      `Pulled All Moon Cat Nfts`,
      async () => await request(subgraphURI, query)
    );
    return response?.cats ?? [];
  };

  const fetchAllRequests = async () => {
    if (!currentAddress) return;
    const query = queryAllRequests();
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      requestPrices: AdoptionRequest[];
    } = await timeItAsync(
      `Pulled All Requests`,
      async () => await request(subgraphURI, query)
    );
    setAllRequests(response.requestPrices ?? []);
  };

  const _fetchAllOffers = async (
    take: number,
    skip: number
  ): Promise<AdoptionOffer[] | undefined> => {
    if (!currentAddress) return;
    const query = queryAllOffers(take, skip);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      offerPrices: AdoptionOffer[];
    } = await timeItAsync(
      `Pulled All Offers Cat Nfts`,
      async () => await request(subgraphURI, query)
    );
    return response?.offerPrices ?? [];
  };

  const fetchAllOffers = () => {
    const result: AdoptionOffer[] = [];
    const takeCount = 900;
    let skipCount = 0;

    // @ts-ignore
    function getOffers(take: number, skip: number) {
      return _fetchAllOffers(take, skip).then(
        (items: AdoptionOffer[] | undefined) => {
          if (items) {
            if (items.length === 0) {
              return result;
            } else {
              result.push(...items);
              skipCount = skipCount + take;
              return getOffers(takeCount, skipCount);
            }
          }
        }
      );
    }

    getOffers(takeCount, skipCount).then((adoptionOffers: AdoptionOffer[]) => {
      if (adoptionOffers) {
        const offers = adoptionOffers.filter(
          (offer: AdoptionOffer) =>
            offer.to.toLowerCase() == ethers.constants.AddressZero
        );
        setAllOffers(offers);
      }
    });
  };

  const fetchCatById = async (catId: string): Promise<Cat | undefined> => {
    if (!currentAddress) return;
    const query = queryCatById(catId);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      cats: Cat[];
    } = await timeItAsync(
      `Pulled Cat By id`,
      async () => await request(subgraphURI, query)
    );
    return response?.cats[0];
  };

  const fetchRarityData = async (acSignal: AbortSignal) => {
    const response = await fetch(`${window.location.origin}/data.json`, {
      signal: acSignal,
    });
    const data = await response.text();
    const resolvedData = JSON.parse(data).reduce(
      (memo: Record<string, CatInfo>, item: CatInfo) => {
        memo[item.catId] = item;
        return memo;
      }
    );
    setCatInfo(resolvedData);
  };

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetchMyMoonCats(),
      fetchRarityData(ac.signal),
      fetchAllRequests(),
      fetchAllOffers(),
    ])
      .then(() => {
        setDataLoading(true);
      })
      .catch(() => setDataLoading(false));
    /* eslint-disable-next-line */
    return () => ac.abort();
  }, []);

  return (
    <GraphContext.Provider
      value={{
        usersMoonCats,
        allMoonCats,
        allRequests,
        catInfo,
        allOffers,
        isDataLoading,
        fetchAllMoonCats,
        fetchCatById,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
