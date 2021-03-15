import React, { createContext, useContext, useState, useEffect } from "react";
import { request } from "graphql-request";

import { CurrentAddressContext } from "../../hardhat/SymfoniContext";
import { timeItAsync } from "../../utils";

import { queryMyMoonCats, queryAllCats, queryCatById } from "./queries";
import { Cat } from "./types";

const ENDPOINT_MOONCAT_PROD =
  "https://api.thegraph.com/subgraphs/name/rentft/moon-cat-rescue";

type GraphContextType = {
  usersMoonCats: Cat[];
  allMoonCats: Cat[];
  fetchCatById(catId: string): Promise<Cat | undefined>;
  fetchAllMoonCats(take: number, skip: number): Promise<Cat[] | undefined>;
};

const DefaultGraphContext: GraphContextType = {
  usersMoonCats: [],
  allMoonCats: [],
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
  const [currentAddress] = useContext(CurrentAddressContext);
  const [usersMoonCats, setUsersMoonCats] = useState<Cat[]>([]);
  const [allMoonCats, _] = useState<Cat[]>([]);

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

  useEffect(() => {
    fetchMyMoonCats();
    /* eslint-disable-next-line */
  }, []);

  return (
    <GraphContext.Provider
      value={{
        usersMoonCats,
        allMoonCats,
        fetchAllMoonCats,
        fetchCatById,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContext;
