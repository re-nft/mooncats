import React, { useState, useCallback, useContext, useEffect } from 'react';
import { calculatePrice, WRAPPER } from '../../utils';

import GraphContext from '../../contexts/graph/index';
import { Cat, AdoptionOffer } from '../../contexts/graph/types';
import MooncatRescueContext from '../../contexts/mooncats/index';

import CatNotifer from '../../components/CopyNotifier';
import CatItem from '../../components/CatItem';
import Modal from '../../components/ui/modal';
import Loader from '../../components/ui/loader';

import { queryAllOffers } from '../../contexts/graph/queries';
import { ENDPOINT_MOONCAT_PROD, FETCH_ALL_OFFERS_TAKE } from '../../lib/consts';
import request from 'graphql-request';

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
    // @ts-ignore
    return offerB.price - offerA.price;
  },
  [OffereSortType.CHEAPEST]: (offerA: AdoptionOffer, offerB: AdoptionOffer) => {
    // @ts-ignore
    return offerA.price - offerB.price;
  },
  [OffereSortType.RECENTLY_LISTED]: (
    offerA: AdoptionOffer,
    offerB: AdoptionOffer
  ) => {
    return (
      // @ts-ignore
      new Date(Number(offerB.timestamp) * 100) -
      // @ts-ignore
      new Date(Number(offerA.timestamp) * 100)
    );
  },
  [OffereSortType.OLDEST]: (offerA: AdoptionOffer, offerB: AdoptionOffer) => {
    return (
      // @ts-ignore
      new Date(Number(offerA.timestamp) * 100) -
      // @ts-ignore
      new Date(Number(offerB.timestamp) * 100)
    );
  },
};

const OfferedCats: React.FC<{ allOffers: AdoptionOffer[] }> = ({
  allOffers: ssrOffers,
}) => {
  // Context
  const { allOffers: csrOffers, fetchAllOffers } = useContext(GraphContext);
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

  // Callbacks
  const handleFetchOffers = useCallback(async () => {
    setIsLoading(true);
    const yOffset = window.pageYOffset;
    await fetchAllOffers(FETCH_ALL_OFFERS_TAKE - 700, currentSkipCount);
    setCurrentSkipCount((prevSkip) => prevSkip + 200);
    setIsLoading(false);
    window.scrollTo(0, yOffset);
  }, [currentSkipCount]);

  const handleSort = useCallback(
    (sortType: OffereSortType) => setCurrentSortType(sortType),
    []
  );
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

  useEffect(() => {
    !isLoading && setAllOffers((prevOffers) => [...prevOffers, ...csrOffers]);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }
  const sortedOffer = allOffers.slice(0).sort(sortFn[currentSortType]);
  return (
    <div className="content">
      <div className="content__row content__navigation">
        <div className="sort__control">
          <div className="sort__title">Sort by:</div>
          <div className="sort__buttons">
            {Object.entries(sortTypes).map(([type, title]) => (
              <button
                key={type}
                // @ts-ignore
                className={`nft__button ${
                  currentSortType === type && 'nft__button__active'
                }`}
                // @ts-ignore
                onClick={() => handleSort(type)}
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
      {!isLoading && (
        <div className="load-more">
          <button className="nft__button" onClick={handleFetchOffers}>
            Load more
          </button>
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
      allOffers,
    },
  };
}

export default React.memo(OfferedCats);
