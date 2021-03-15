export type AdoptionRequest = {
  id: string;
  price: string;
  from: string;
};

export type AdoptionOffer = {
  id: string;
  price: string;
  toAddress: string;
};

export type Cat = {
  id: string;
  name?: string;
  inWallet: boolean;
  rescueTimestamp: string;
  activeAdoptionRequest?: AdoptionRequest;
  activeAdoptionOffer?: AdoptionOffer;
  requestPrices: {
    price: string;
    timestamp: string;
  }[];
  offerPrices: {
    price: string;
    timestamp: string;
  }[];
};
