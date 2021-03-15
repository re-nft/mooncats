import React, { createContext, useContext } from "react";
import { ethers } from "ethers";

import MooncatsAbi from "./mooncats.json";
import { SignerContext } from "../../hardhat/SymfoniContext";
import { Address } from "../../types/index";

// mapping(bytes5 => AdoptionOffer) public adoptionOffers;
// mapping(bytes5 => AdoptionRequest) public adoptionRequests;
// mapping(bytes5 => bytes32) public catNames;
// mapping(bytes5 => address) public catOwners;
// mapping(address => uint256) public balanceOf; //number of cats owned by a given address
// mapping(address => uint256) public pendingWithdrawals;

export type CatId = string;

export type Cat = {
  id: CatId;
  // can be unnamed, expect these to be worth more
  name: string;
  inWallet: boolean;
  currentOwner: Address;
  // the ones that are wrapped, are clearly worth less
  wasWrapped?: boolean;
};

type MooncatContextType = {
  getContract: () => ethers.Contract | undefined;
  nameCat: (catId: string, catName: string) => Promise<void>;
  giveCat: (catId: string, toAddress: string) => Promise<void>;
  createOffer: (
    catId: string,
    price: string,
    toAddress?: string
  ) => Promise<void>;
  cancelOffer: (catId: string) => Promise<void>;
  acceptOffer: (catId: string, offerPrice: string) => Promise<void>;
  createRequest: (catId: string, offerPrice: string) => Promise<void>;
  cancelRequest: (catId: string) => Promise<void>;
  acceptRequest: (catId: string) => Promise<void>;
};

const DefaultMooncatContext: MooncatContextType = {
  getContract: () => {
    return undefined;
  },
  nameCat: async () => {
    true;
  },
  giveCat: async () => {
    true;
  },
  createOffer: async () => {
    true;
  },
  cancelOffer: async () => {
    true;
  },
  acceptOffer: async () => {
    true;
  },
  createRequest: async () => {
    true;
  },
  cancelRequest: async () => {
    true;
  },
  acceptRequest: async () => {
    true;
  },
};

const MooncatsContext = createContext<MooncatContextType>(
  DefaultMooncatContext
);

export const MooncatsProvider: React.FC = ({ children }) => {
  const [signer] = useContext(SignerContext);

  const getContract = () => {
    if (!signer) return undefined;
    return new ethers.Contract(
      "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6",
      MooncatsAbi,
      signer
    );
  };

  // you can only do this once
  const nameCat = async (catId: string, catName: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    //@ts-ignore
    (await _contract.nameCat(catId, catName)).catch((e) => {
      console.error(e);
      return;
    });
  };

  const giveCat = async (catId: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    //@ts-ignore
    (await _contract.giveCat(catId)).catch((e) => {
      console.error(e);
      return;
    });
  };

  // this is my cat, and I will sell it immediately to you if you
  // give me the price
  const createOffer = async (
    catId: string,
    price: string,
    toAddress?: string
  ) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    if (!toAddress) {
      //@ts-ignore
      (await _contract.makeAdoptionOffer(catId, price)).catch((e) => {
        console.error(e);
        return;
      });
    } else {
      (await _contract.makeAdoptionOfferToAddress(catId, price, toAddress))
        //@ts-ignore
        .catch((e) => {
          console.error(e);
          return;
        });
    }
  };

  // owner changed their mind, they no longer wish to offer the cat to anyone
  const cancelOffer = async (catId: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    //@ts-ignore
    (await _contract.cancelAdoptionOffer(catId)).catch((e) => {
      console.error(e);
      return;
    });
  };

  /**
   * Non-owner likes owner's offer, and accepts it, they must send offerPrice along to the contract
   * @param catId
   * @param offerPrice - must be in wei
   * @returns
   */
  const acceptOffer = async (catId: string, offerPrice: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    (await _contract.acceptAdoptionOffer(catId, { value: offerPrice })).catch(
      //@ts-ignore
      (e) => {
        console.error(e);
        return;
      }
    );
  };

  // non-owner likes some cat, they say what id they like, and they send offer price to contract
  const createRequest = async (catId: string, offerPrice: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    (await _contract.makeAdoptionRequest(catId, { value: offerPrice })).catch(
      //@ts-ignore
      (e) => {
        console.error(e);
        return;
      }
    );
  };

  const cancelRequest = async (catId: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    //@ts-ignore
    (await _contract.cancelAdoptionRequest(catId)).catch((e) => {
      console.error(e);
      return;
    });
  };

  const acceptRequest = async (catId: string) => {
    const _contract = getContract();
    if (!_contract) {
      console.warn("you must connect a metamask wallet first");
      return;
    }
    //@ts-ignore
    (await _contract.acceptAdoptionRequest(catId)).catch((e) => {
      console.error(e);
      return;
    });
  };

  return (
    <MooncatsContext.Provider
      value={{
        getContract,
        nameCat,
        giveCat,
        createRequest,
        cancelRequest,
        acceptRequest,
        createOffer,
        cancelOffer,
        acceptOffer,
      }}
    >
      {children}
    </MooncatsContext.Provider>
  );
};

export default MooncatsContext;
