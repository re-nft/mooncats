export type AdoptionRequest = {
  id: string;
  price: string;
  from: string;
  timestamp: string;
  active: boolean;
  filled: boolean;
};

export type AdoptionOffer = {
  id: string;
  price: string;
  to: string;
  timestamp: string;
  active: boolean;
  filled: boolean;
};

export type Cat = {
  id: string;
  name?: string;
  isWrapped: boolean;
  rescueTimestamp: string;
  activeRequest?: AdoptionRequest;
  activeOffer?: AdoptionOffer;
  provenance?: {
    requestPrices?: AdoptionRequest[];
    offerPrices?: AdoptionOffer[];
  };
};

export type CatInfo = {
  catId: string;
  color: string;
  palette: string;
  pattern: number;
  statisticalRank: string;
  traitRarityRank: string;
};
