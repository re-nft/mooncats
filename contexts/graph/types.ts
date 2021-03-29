export type AdoptionRequest = {
  id: string;
  price: string;
  from: string;
  timestamp: string;
  active: boolean;
  filled: boolean;
  rescueTimestamp: string;
};

export type AdoptionOffer = {
  id: string;
  price: string;
  to: string;
  timestamp: string;
  active: boolean;
  filled: boolean;
  catRescueTimestamp: string;
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

export type CatInfoData = {
  created_at: string;
  data: CatInfo[];
};

export type CatInfo = {
  row: string;
  catId: string;
  color: string;
  palette: string;
  pattern: string;
  statisticalRank: string;
  traitRarityRank: string;
};
