import { Bytes, BigInt, Address, store } from "@graphprotocol/graph-ts";

import {
  CatRescued,
  AdoptionOffered,
  AdoptionRequested,
} from "../generated/MoonCatRescue/MoonCatRescue";

import {
  Cat,
  Owner,
  RequestPrice,
  OfferPrice,
  Provenance,
} from "../generated/schema";

export const createOwner = (ownerId: string): Owner => {
  let owner = new Owner(ownerId);
  return <Owner>owner;
}

export const getOwner = (ownerId: string): Owner => {
  let owner = Owner.load(ownerId);
  return <Owner>owner;
};

export const fetchOwner = (ownerId: string): Owner => {
  let owner = getOwner(ownerId);
  if (owner == null) {
    owner = createOwner(ownerId);
  }
  return <Owner>owner;
}

export const createCat = (catId: string, ownerId: string, rescueTimestamp: BigInt): Cat => {
  let cat = new Cat(catId);
  let owner = fetchOwner(ownerId);
  owner.save();
  cat.owner = owner.id;
  cat.rescueTimestamp = rescueTimestamp;
  cat.isWrapped = false;
  return <Cat>cat;
}

export const getCat = (catId: string): Cat => {
  let cat = Cat.load(catId);
  return <Cat>cat;
};

export const createProvenance = (provenanceId: string): Provenance => {
  let provenance = new Provenance(provenanceId);
  return <Provenance>provenance;
}

export const getProvenance = (provenanceId: string): Provenance => {
  let provenance = Provenance.load(provenanceId);
  return <Provenance>provenance;
}

export const fetchProvenance = (provenanceId: string): Provenance => {
  let provenance = getProvenance(provenanceId);
  if (provenance == null) {
    provenance = createProvenance(provenanceId);
  }
  return <Provenance>provenance;
}

export const createRequestPrice = (requestId: string, provenanceId: string, price: BigInt, from: Address, timestamp: BigInt): RequestPrice => {
  let requestPrice = new RequestPrice(requestId);
  let provenance = fetchProvenance(provenanceId);
  provenance.save();
  requestPrice.provenance = provenance.id;
  requestPrice.price = price;
  requestPrice.from = from;
  requestPrice.timestamp = timestamp;
  requestPrice.filled = false;
  requestPrice.active = true;
  return <RequestPrice>requestPrice;
}

export const getRequestPrice = (requestId: string): RequestPrice => {
  let requestPrice = RequestPrice.load(requestId);
  return <RequestPrice>requestPrice;
}

export const createOfferPrice = (offerId: string, provenanceId: string, price: BigInt, to: Address, timestamp: BigInt, catRescueTimestamp: BigInt): OfferPrice => {
  let offerPrice = new OfferPrice(offerId);
  let provenance = fetchProvenance(provenanceId);
  provenance.save();
  offerPrice.provenance = provenance.id;
  offerPrice.price = price;
  offerPrice.to = to;
  offerPrice.timestamp = timestamp;
  offerPrice.catRescueTimestamp = catRescueTimestamp;
  offerPrice.filled = false;
  offerPrice.active = true;
  return <OfferPrice>offerPrice;
}

export const getOfferPrice = (offerId: string): OfferPrice => {
  let offerPrice = OfferPrice.load(offerId);
  return <OfferPrice>offerPrice;
}
