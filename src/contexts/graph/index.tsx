import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
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
import { ENDPOINT_MOONCAT_PROD } from "../../consts";

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
  const unmounted = useRef<boolean>(
    (sessionStorage.getItem("is-app-unmounted") || false) === false
  );
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

  const fetchRarityData = async (signal?: AbortSignal) => {
    const response = await fetch(`${window.location.origin}/data.json`, {
      signal,
    });
    const data = await response.text();
    const resolvedData = JSON.parse(data).reduce(
      (memo: Record<string, CatInfo>, item: CatInfo) => {
        memo[item.catId] = item;
        return memo;
      }
    );
    !unmounted.current && setCatInfo(resolvedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      sessionStorage.setItem("is-app-unmounted", "false");
      await Promise.all([
        fetchMyMoonCats(),
        fetchRarityData(),
        fetchAllRequests(),
      ]);
      setDataLoading(true);
    };

    unmounted.current && fetchData();
    return () => sessionStorage.removeItem("is-app-unmounted");
    /* eslint-disable-next-line */
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
