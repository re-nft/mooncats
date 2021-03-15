import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../contexts/graph/index";
import { Cat } from "../../contexts/graph/types";
import MooncatRescueContext from "../../contexts/mooncats/index";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import { WRAPPER, calculatePrice } from "../../utils";
import Modal from "../ui/modal";
import { ethers } from "ethers";
import Loader from "../ui/loader";

enum SortTypes {
  ALL,
  HIGH_OFFER,
  CHEAPEST_OFFER,
  OFFER_DATE,
}

const priceField = (cat: Cat) =>
  cat.activeAdoptionOffer && cat.activeAdoptionOffer.price;

const compareSortingFn = {
  [SortTypes.ALL]: () => {
    return 0;
  },
  [SortTypes.HIGH_OFFER]: (catA: Cat, catB: Cat) => {
    if (
      catA.activeAdoptionOffer &&
      catA.activeAdoptionOffer.toAddress.toLowerCase() !== WRAPPER
    ) {
      return -1;
    }
    if (
      catB.activeAdoptionOffer &&
      catB.activeAdoptionOffer.toAddress.toLowerCase() !== WRAPPER
    ) {
      return -1;
    }
    return 0;
  },
  [SortTypes.CHEAPEST_OFFER]: (catA: Cat, catB: Cat) => {
    return 0;
  },
  [SortTypes.OFFER_DATE]: (catA: Cat, catB: Cat) => {
    return 0;
  },
};

const TAKE_COUNTER = 140;

export const AllCats: React.FC = () => {
  const { fetchAllMoonCats, catInfo, isLoadingCatsData } = useContext(
    GraphContext
  );
  const { acceptOffer } = useContext(MooncatRescueContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentCat, setCurrentCat] = useState<Cat>();
  const [error, setError] = useState<string>();
  const [currentBidPrice, setCurrentBidPrice] = useState<string>();
  const [isOpenBidModal, setOpenBidModal] = useState<boolean>(false);
  const [isOpenBuyModal, setOpenBuyModal] = useState<boolean>(false);
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );
  const [cats, setCats] = useState<Cat[]>([]);
  const [skipCount, setSkipCount] = useState<number>(0);
  const [currentSort, setCurrentSort] = useState<SortTypes>(SortTypes.ALL);

  const handleSort = useCallback(
    (sortType: SortTypes) => {
      const compareFn = compareSortingFn[sortType];
      const catsSorted = cats.slice(0).sort(compareFn);
      setCats(catsSorted);
      setCurrentSort(sortType);
    },
    [cats]
  );

  const handleModalOpen = useCallback((cat: Cat) => {
    setOpenBidModal(true);
    setCurrentCat(cat);
  }, []);
  const handleBuyModalOpen = useCallback((cat: Cat) => {
    setOpenBuyModal(true);
    setCurrentCat(cat);
  }, []);
  const handleModalClose = useCallback(() => setOpenBidModal(false), []);
  const handleBuyModalClose = useCallback(() => setOpenBuyModal(false), []);

  const handleRefresh = useCallback(() => {
    const skip = skipCount === 0 ? TAKE_COUNTER : skipCount;
    fetchAllMoonCats(skip, 0).then((items: Cat[] | undefined) => {
      if (items) {
        setCats(items);
      }
    });
    // todo: fetchAllMoonCats missing from deps warning
  }, [skipCount]);

  const onCopyToClipboard = useCallback((cat: Cat) => {
    const textField = document.createElement("textarea");
    textField.innerText = cat.id;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    setIsCopiedSuccessfully(true);
    window.setTimeout(() => setIsCopiedSuccessfully(false), 3000);
  }, []);

  const handleOnBidPriceChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setCurrentBidPrice(value);
    },
    [setCurrentBidPrice]
  );

  const handleBuyNow = useCallback(async () => {
    if (currentCat && currentCat.activeAdoptionOffer) {
      console.log(currentCat, currentCat.activeAdoptionOffer);
      try {
        const resolvedPrice = ethers.utils.parseEther(
          currentCat.activeAdoptionOffer.price
        );
        await acceptOffer(currentCat.id, resolvedPrice.toString());
      } catch (e) {
        console.warn(e);
        // TODO: add description for all errors code
        setError(`insufficient funds for transfer`);
      }
      setCurrentCat(undefined);
      handleModalClose();
    }
  }, [currentCat]);

  const handleOnBidSubmit = useCallback(() => {
    if (currentBidPrice && currentCat) {
      setCurrentBidPrice("");
      setCurrentCat(undefined);
      handleModalClose();
      handleRefresh();
    }
    // todo: handleRefresh missing from deps here
  }, [currentBidPrice, currentCat, handleModalClose]);

  const loadMore = useCallback(() => {
    const skip = skipCount + TAKE_COUNTER;
    setIsLoading(true);
    fetchAllMoonCats(TAKE_COUNTER, skip).then((items: Cat[] | undefined) => {
      if (items) {
        setCats((prev) => prev.concat(...items));
        setSkipCount(skip);
        setIsLoading(false);
      }
    });
  }, [skipCount, fetchAllMoonCats]);

  useEffect(() => {
    fetchAllMoonCats(TAKE_COUNTER, 0).then((items: Cat[] | undefined) => {
      if (items) {
        setCats(items);
        setIsLoading(false);
      }
    });
    /* eslint-disable-next-line */
  }, []);

  if (!isLoadingCatsData) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="content">
      <div className="sort">
        <div className="sort__title">Sort by:</div>
        <div className="sort__control">
          <button
            className={`nft__button active-${currentSort === SortTypes.ALL}`}
            onClick={() => handleSort(SortTypes.ALL)}
          >
            Number
          </button>
          <button
            className={`nft__button active-${
              currentSort === SortTypes.HIGH_OFFER
            }`}
            onClick={() => handleSort(SortTypes.HIGH_OFFER)}
          >
            High Offer
          </button>
          <button
            className={`nft__button active-${
              currentSort === SortTypes.CHEAPEST_OFFER
            }`}
            onClick={() => handleSort(SortTypes.CHEAPEST_OFFER)}
          >
            Cheapest Offer
          </button>
          <button
            className={`nft__button active-${
              currentSort === SortTypes.OFFER_DATE
            }`}
            onClick={() => handleSort(SortTypes.OFFER_DATE)}
          >
            Offer Date
          </button>
        </div>
      </div>
      <div className="content__row content__items">
        {cats.map((cat) => (
          <CatItem
            key={cat.id}
            cat={cat}
            catInfo={catInfo && catInfo[cat.id]}
            hasRescuerIdx={true}
            onClick={onCopyToClipboard}
          >
            <div className="nft__control">
              <button
                className="nft__button"
                onClick={() => handleModalOpen(cat)}
              >
                Bid
              </button>
              {cat.activeAdoptionOffer && (
                <button
                  className="nft__button"
                  onClick={() => handleBuyModalOpen(cat)}
                >
                  Buy now
                </button>
              )}
            </div>
          </CatItem>
        ))}
      </div>
      {!isLoading && (
        <div className="load-more">
          <button className="nft__button" onClick={loadMore}>
            Load more
          </button>
        </div>
      )}
      {isCopiedSuccessfully && <CatNotifer />}
      <Modal open={isOpenBidModal} handleClose={handleModalClose}>
        <div className="cat-form">
          <input
            className="cat-input"
            placeholder="PRICE IN ETH"
            onChange={handleOnBidPriceChange}
          />
          <button className="nft__button" onClick={handleOnBidSubmit}>
            Place Bid
          </button>
        </div>
      </Modal>
      <Modal open={isOpenBuyModal} handleClose={handleBuyModalClose}>
        <div className="inline-form">
          <input
            className="cat-input"
            value={`${
              currentCat &&
              calculatePrice(currentCat.activeAdoptionOffer?.price || "")
            } ETH`}
            onChange={handleOnBidPriceChange}
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

export default React.memo(AllCats);
