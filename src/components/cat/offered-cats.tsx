import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import GraphContext from "../../contexts/graph/index";
import { Cat, AdoptionOffer } from "../../contexts/graph/types";
import MooncatRescueContext from "../../contexts/mooncats/index";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import { calculatePrice } from "../../utils";
import Modal from "../ui/modal";
import Loader from "../ui/loader";
import useOffers from "../../hooks/useOffers";

enum OffereSortType {
  HIGH_PRICE = "HIGH_PRICE",
  CHEAPEST = "CHEAPEST",
  RECENTLY_LISTED = "RECENTLY_LISTED",
  OLDEST = "OLDEST",
}

const sortTypes: Record<OffereSortType, string> = {
  [OffereSortType.HIGH_PRICE]: "HIGH PRICE",
  [OffereSortType.CHEAPEST]: "CHEAPEST",
  [OffereSortType.RECENTLY_LISTED]: "RECENTLY LISTED",
  [OffereSortType.OLDEST]: "OLDEST",
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

export const OfferedCats: React.FC = () => {
  const { catInfo } = useContext(GraphContext);
  const yOffset = useRef<number>(window.pageYOffset);
  const { setLastOfferId, offers, isOffersFetching } = useOffers();
  const { acceptOffer } = useContext(MooncatRescueContext);
  const [currentOffer, setCurrentOffer] = useState<AdoptionOffer>();
  const [error, setError] = useState<string>();
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [currentSortType, setCurrentSortType] = useState<OffereSortType>(
    OffereSortType.RECENTLY_LISTED
  );
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );

  const handleClick = () => {
    yOffset.current = window.pageYOffset;
    setLastOfferId(offers[offers.length - 1].id);
  };

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
    const textField = document.createElement("textarea");
    textField.innerText = offer.id;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    setIsCopiedSuccessfully(true);
    window.setTimeout(() => setIsCopiedSuccessfully(false), 3000);
  }, []);

  const handleBuyNow = useCallback(async () => {
    if (currentOffer) {
      try {
        await acceptOffer(currentOffer.id.split("::")[0], currentOffer.price);
      } catch (e) {
        console.warn(e);
        setError(e?.message);
      }
      setCurrentOffer(undefined);
      handleModalClose();
    }
  }, [currentOffer, handleModalClose, acceptOffer]);

  useEffect(() => {
    if (!isOffersFetching) {
      window.scrollTo(0, yOffset.current);
    }
  }, [isOffersFetching]);

  if (isOffersFetching) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }

  const sortedOffer = offers.slice(0).sort(sortFn[currentSortType]);
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
                  currentSortType === type && "nft__button__active"
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
        {sortedOffer.map((offer, index) => {
          const catId = offer.id.split("::")[0];
          return (
            <CatItem
              key={offer.id}
              cat={{
                isWrapped: false,
                rescueTimestamp: offer.catRescueTimestamp,
                id: catId,
                activeOffer: offer,
              }}
              catInfo={catInfo && catInfo[catId]}
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
      {!isOffersFetching && (
        <div className="load-more">
          <button className="nft__button" onClick={handleClick}>
            Load more
          </button>
        </div>
      )}
      {isCopiedSuccessfully && <CatNotifer />}
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

export default React.memo(OfferedCats);
