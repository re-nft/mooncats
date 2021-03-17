import React, { createContext, useContext, useState, useEffect } from "react";
import { request } from "graphql-request";

import { CurrentAddressContext } from "../../hardhat/SymfoniContext";
import { timeItAsync } from "../../utils";

import { queryMyMoonCats, queryAllCats, queryCatById } from "./queries";
import { Cat, CatInfo } from "./types";

const ENDPOINT_MOONCAT_PROD =
  "https://api.thegraph.com/subgraphs/id/QmcdqyoCZnM4teNKwScPRrpuUygUM6ckutJJcMrvESBGpY";

type GraphContextType = {
  usersMoonCats: Cat[];
  allMoonCats: Cat[];
  isDataLoading: boolean;
  catInfo: Record<string, CatInfo>;
  fetchCatById(catId: string): Promise<Cat | undefined>;
  fetchAllMoonCats(take: number, skip: number): Promise<Cat[] | undefined>;
};

const DefaultGraphContext: GraphContextType = {
  usersMoonCats: [],
  allMoonCats: [],
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
  const [catInfo, setCatInfo] = useState<Record<string, CatInfo>>({});

  const fetchMyMoonCats = async () => {
    if (!currentAddress) return;
    const query = queryMyMoonCats(currentAddress);
    const subgraphURI = ENDPOINT_MOONCAT_PROD;
    const response: {
      moonRescuers: { cats?: Cat[] }[];
    } = await timeItAsync(
      `Pulled My Moon Cat Nfts`,
      async () => await request(subgraphURI, query)
    );
    const [first] = response.moonRescuers;
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

  const fetchRarityData = async () => {
    const response = await fetch("./data.json");
    console.log("Pulled Rarity Cat");
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
    Promise.all([fetchMyMoonCats(), fetchRarityData()]).then(() => {
      setDataLoading(true);
    });
    /* eslint-disable-next-line */
  }, []);

  return (
    <GraphContext.Provider
      value={{
        usersMoonCats,
        allMoonCats,
        catInfo,
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
