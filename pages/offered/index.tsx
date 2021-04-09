import request from 'graphql-request';
import Head from 'next/head';
import React, { useState, useCallback, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import { calculatePrice, getDateTime } from '../../utils';

import GraphContext from '../../contexts/graph/index';
import { Cat, AdoptionOffer } from '../../contexts/graph/types';
import MooncatRescueContext from '../../contexts/mooncats/index';

import CatNotifer from '../../components/CopyNotifier';
import CatItem from '../../components/CatItem';
import Modal from '../../components/ui/modal';
import Loader from '../../components/ui/loader';

import { queryAllOffers } from '../../contexts/graph/queries';
import {
  ENDPOINT_MOONCAT_PROD,
  FETCH_ALL_OFFERS_TAKE,
  FETCH_EVERY_OFFERS_TAKE,
} from '../../lib/consts';

enum OffereSortType {
  HIGH_PRICE = 'HIGH_PRICE',
  CHEAPEST = 'CHEAPEST',
  RECENTLY_LISTED = 'RECENTLY_LISTED',
  OLDEST = 'OLDEST',
}

const sortTypes: Record<OffereSortType, string> = {
  [OffereSortType.HIGH_PRICE]: 'HIGH PRICE',
  [OffereSortType.CHEAPEST]: 'CHEAPEST',
  [OffereSortType.RECENTLY_LISTED]: 'RECENTLY LISTED',
  [OffereSortType.OLDEST]: 'OLDEST',
};

const sortFn: Record<
  OffereSortType,
  (offerA: AdoptionOffer, offerB: AdoptionOffer) => number
> = {
  [OffereSortType.HIGH_PRICE]: (
    offerA: AdoptionOffer,
    offerB: AdoptionOffer
  ) => {
    return parseInt(offerB.price, 10) - parseInt(offerA.price, 10);
  },
  [OffereSortType.CHEAPEST]: (offerA: AdoptionOffer, offerB: AdoptionOffer) => {
    return parseInt(offerA.price, 10) - parseInt(offerB.price, 10);
  },
  [OffereSortType.RECENTLY_LISTED]: (
    offerA: AdoptionOffer,
    offerB: AdoptionOffer
  ) => {
    return getDateTime(offerB.timestamp) - getDateTime(offerA.timestamp);
  },
  [OffereSortType.OLDEST]: (offerA: AdoptionOffer, offerB: AdoptionOffer) =>
    getDateTime(offerA.timestamp) - getDateTime(offerB.timestamp),
};

const OfferedCats: React.FC<{ allOffers: AdoptionOffer[] }> = ({
  allOffers: ssrOffers,
}) => {
  // Context
  const { fetchAllOffers } = useContext(GraphContext);
  const { acceptOffer } = useContext(MooncatRescueContext);

  // State
  const [allOffers, setAllOffers] = useState<AdoptionOffer[]>(ssrOffers);
  const [currentSkipCount, setCurrentSkipCount] = useState<number>(
    FETCH_ALL_OFFERS_TAKE
  );
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [currentOffer, setCurrentOffer] = useState<AdoptionOffer>();
  const [currentSortType, setCurrentSortType] = useState<OffereSortType>(
    OffereSortType.RECENTLY_LISTED
  );
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );

  // Memoized values
  const sortedOffer = useMemo(() => {
    return allOffers.sort(sortFn[currentSortType]);
  }, [currentSortType, allOffers]);

  // Callbacks
  const handleFetchOffers = useCallback(async () => {
    setIsLoading(true);
    const yOffset = window.pageYOffset + 100;
    const offers = await fetchAllOffers(
      FETCH_EVERY_OFFERS_TAKE,
      currentSkipCount
    );
    setCurrentSkipCount((prevSkip) => prevSkip + FETCH_EVERY_OFFERS_TAKE);
    setAllOffers((prevOffers) => [...prevOffers, ...offers]);
    setIsLoading(false);
    window.scrollTo(0, yOffset);
  }, [currentSkipCount]);

  const handleSort = (sortType: OffereSortType) => setCurrentSortType(sortType);
  const handleModalClose = useCallback(() => setOpenModal(false), []);
  const handleModalOpen = useCallback((offer: AdoptionOffer) => {
    setError(undefined);
    setOpenModal(true);
    setCurrentOffer(offer);
  }, []);

  const onCopyToClipboard = useCallback((offer: Cat) => {
    const textField = document.createElement('textarea');
    textField.innerText = offer.id;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setIsCopiedSuccessfully(true);
    window.setTimeout(() => setIsCopiedSuccessfully(false), 3000);
  }, []);

  const handleBuyNow = useCallback(async () => {
    if (currentOffer) {
      try {
        await acceptOffer(currentOffer.id.split('::')[0], currentOffer.price);
      } catch (e) {
        console.warn(e);
        setError(e?.message);
      }
      setCurrentOffer(undefined);
      handleModalClose();
    }
  }, [currentOffer, handleModalClose, acceptOffer]);

  return (
    <div className="content">
      <Head>
        <title>reNFT - Offered cats</title>
      </Head>
      <div className="content__row content__navigation">
        <div className="sort__control">
          <div className="sort__title">Sort by:</div>
          <div className="sort__buttons">
            {Object.entries(sortTypes).map(([type, title]) => (
              <button
                key={type}
                className={`nft__button ${
                  currentSortType === type && 'nft__button__active'
                }`}
                onClick={() => handleSort(type as OffereSortType)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="content__row content__items">
        {sortedOffer.map((offer) => {
          const catId = offer.id.split('::')[0];
          return (
            <CatItem
              key={offer.id}
              cat={{
                isWrapped: false,
                rescueTimestamp: offer.catRescueTimestamp,
                id: catId,
                activeOffer: offer,
              }}
              hasRescuerIdx={true}
              onClick={onCopyToClipboard}
            >
              <div className="nft__control">
                <button
                  className="nft__button"
                  onClick={() => handleModalOpen(offer)}
                >
                  Buy now
                </button>
              </div>
            </CatItem>
          );
        })}
      </div>
      {isCopiedSuccessfully && <CatNotifer />}
      {!isLoading ? (
        <div className="load-more">
          <button className="nft__button" onClick={handleFetchOffers}>
            Load more
          </button>
        </div>
      ) : (
        <div className="content center">
          <Loader />
        </div>
      )}
      <Modal open={isOpenModal} handleClose={handleModalClose}>
        <div className="inline-form">
          <input
            className="cat-input"
            disabled
            value={`${currentOffer && calculatePrice(currentOffer.price)} ETH`}
          />
          <button className="nft__button" onClick={handleBuyNow}>
            BUY NOW
          </button>
        </div>
        {error && <div className="form-error">{error}</div>}
      </Modal>
    </div>
  );
};

export async function getStaticProps() {
  const offeredQuery = queryAllOffers(FETCH_ALL_OFFERS_TAKE, 0);
  const { offerPrices: allOffers } = await request(
    ENDPOINT_MOONCAT_PROD,
    offeredQuery
  );

  return {
    props: {
      allOffers: allOffers.filter(
        (offer: AdoptionOffer) =>
          offer.to.toLowerCase() == ethers.constants.AddressZero
      ),
    },
  };
}

export default React.memo(OfferedCats);
