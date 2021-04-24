import request from 'graphql-request';
import Head from 'next/head';
import React, { useState, useCallback, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import { calculatePrice } from '../../utils';

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
  FETCH_EVERY_OFFERS_TAKE,
} from '../../lib/consts';
import { GetStaticProps } from 'next';

enum OffereSortType {
  HIGH_PRICE = 'HIGH_PRICE',
  CHEAPEST = 'CHEAPEST',
  RECENTLY_LISTED = 'RECENTLY_LISTED',
  OLDEST = 'OLDEST',
}

enum NavigateType {
  PREV = 'NAVIGATE_PREV',
  NEXT = 'NAVIGATE_NEXT',
}

const sortTypes: Record<OffereSortType, string> = {
  [OffereSortType.HIGH_PRICE]: 'HIGH PRICE',
  [OffereSortType.CHEAPEST]: 'CHEAPEST',
  [OffereSortType.RECENTLY_LISTED]: 'RECENTLY LISTED',
  [OffereSortType.OLDEST]: 'OLDEST',
};

const getOrderByParam = (sortType: OffereSortType) =>
  sortType === OffereSortType.CHEAPEST || sortType === OffereSortType.HIGH_PRICE
    ? 'price'
    : 'timestamp';

const getOrderDirectionParam = (sortType: OffereSortType) =>
  sortType === OffereSortType.HIGH_PRICE ||
  sortType === OffereSortType.RECENTLY_LISTED
    ? 'desc'
    : 'asc';

const OfferedCats: React.FC<{ allOffers: AdoptionOffer[] }> = ({
  allOffers: ssrOffers,
}) => {
  // Context
  const { fetchAllOffers } = useContext(GraphContext);
  const { acceptOffer } = useContext(MooncatRescueContext);

  // State
  const [allOffers, setAllOffers] = useState<AdoptionOffer[]>(ssrOffers);
  const [currentSkipCount, setCurrentSkipCount] = useState<number>(0);
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
  const [disableNext, setDisableNext] = useState<boolean>(false);

  // Memoized values
  const filteredOffers = useMemo(() => {
    return disableNext ? allOffers : allOffers.slice(0, allOffers.length - 1);
  }, [disableNext, allOffers]);

  // Callbacks
  const handleFetchOffers = useCallback(
    async (navigateType: NavigateType) => {
      setIsLoading(true);
      const offers = await fetchAllOffers(
        FETCH_EVERY_OFFERS_TAKE + 1,
        currentSkipCount +
          (navigateType === NavigateType.NEXT ? 1 : -1) *
            FETCH_EVERY_OFFERS_TAKE,
        getOrderByParam(currentSortType),
        getOrderDirectionParam(currentSortType)
      );
      setCurrentSkipCount(
        (prevSkip) =>
          prevSkip +
          (navigateType === NavigateType.NEXT ? 1 : -1) *
            FETCH_EVERY_OFFERS_TAKE
      );
      setAllOffers(() => [...offers]);
      setIsLoading(false);
      if (offers.length !== FETCH_EVERY_OFFERS_TAKE + 1) setDisableNext(true);
      else setDisableNext(false);
    },
    [currentSkipCount, fetchAllOffers]
  );

  const handleSort = async (sortType: OffereSortType) => {
    setIsLoading(true);
    const offers = await fetchAllOffers(
      FETCH_EVERY_OFFERS_TAKE + 1,
      0,
      getOrderByParam(currentSortType),
      getOrderDirectionParam(currentSortType)
    );

    setCurrentSkipCount(0);
    setAllOffers(() => [...offers]);
    setIsLoading(false);
    setCurrentSortType(sortType);
  };

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
      {!isLoading && (
        <div className="content__row content__items">
          {filteredOffers.map((offer) => {
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
      )}
      {isCopiedSuccessfully && <CatNotifer />}
      {!isLoading ? (
        <div className="load-more">
          <button
            disabled={currentSkipCount === 0}
            className="nft__button"
            onClick={() => handleFetchOffers(NavigateType.PREV)}
          >
            Prev
          </button>
          <button
            disabled={disableNext}
            className="nft__button"
            onClick={() => handleFetchOffers(NavigateType.NEXT)}
          >
            Next
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

export const getStaticProps: GetStaticProps = async () => {
  const offeredQuery = queryAllOffers(
    FETCH_EVERY_OFFERS_TAKE + 1,
    0,
    'timestamp',
    'desc'
  );
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
};

export default React.memo(OfferedCats);
