import React, { createContext, useContext, useState } from 'react';
import { request } from 'graphql-request';
import { CurrentAddressContext } from '../../hardhat/SymfoniContext';
import { timeItAsync } from '../../utils';

import {
  queryMyMoonCats,
  queryAllCats,
  queryCatById,
  queryAllRequests,
  queryAllOffers,
} from './queries';
import { Cat, AdoptionRequest, AdoptionOffer } from './types';
import { ENDPOINT_MOONCAT_PROD } from '../../lib/consts';

type GraphContextType = {
  usersMoonCats: Cat[];
  allMoonCats: Cat[];
  allRequests: AdoptionRequest[];
  allOffers: AdoptionOffer[];
  isDataLoading: boolean;
  fetchCatById(catId: string): Promise<Cat | undefined>;
  fetchAllMoonCats(take: number, skip: number): Promise<Cat[] | undefined>;
  fetchMyMoonCats(): Promise<void>;
  fetchAllOffers(
    take: number,
    skip: number
  ): Promise<AdoptionOffer[] | undefined>;
};

const DefaultGraphContext: GraphContextType = {
  usersMoonCats: [],
  allMoonCats: [],
  allRequests: [],
  allOffers: [],
  isDataLoading: false,
  fetchAllMoonCats: async (take: number, skip: number): Promise<Cat[]> => {
    return [];
  },
  fetchMyMoonCats: async () => {},
  fetchCatById: async (catId: string): Promise<Cat | undefined> => {
    return undefined;
  },
  fetchAllOffers: async () => [],
};

const GraphContext = createContext<GraphContextType>(DefaultGraphContext);

export const GraphProvider: React.FC = ({ children }) => {
  const [isDataLoading, setDataLoading] = useState<boolean>(Boolean);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [usersMoonCats, setUsersMoonCats] = useState<Cat[]>([]);
  const [allMoonCats, _] = useState<Cat[]>([]);
  const [allRequests, setAllRequests] = useState<AdoptionRequest[]>([]);
  const [allOffers, setAllOffers] = useState<AdoptionOffer[]>([]);

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
    setDataLoading(true);
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
    setDataLoading(true);
  };

  const fetchAllOffers = async (
    take: number,
    skip: number
  ): Promise<AdoptionOffer[] | undefined> => {
    setDataLoading(false);
    if (!currentAddress) return;
    const query = queryAllOffers(take, skip);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      offerPrices: AdoptionOffer[];
    } = await timeItAsync(
      `Pulled All Offers Cat Nfts`,
      async () => await request(subgraphURI, query)
    );
    setAllOffers(response.offerPrices ?? []);
    setDataLoading(true);
    return response?.offerPrices ?? [];
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

  return (
    <GraphContext.Provider
      value={{
        usersMoonCats,
        allMoonCats,
        allRequests,
        allOffers,
        isDataLoading,
        fetchAllMoonCats,
        fetchMyMoonCats,
        fetchCatById,
        fetchAllOffers,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
