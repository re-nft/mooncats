import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../contexts/graph/index";
import { Cat } from "../../contexts/graph/types";
import MooncatRescueContext from "../../contexts/mooncats/index";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import { WRAPPER, calculatePrice } from "../../utils";
import Modal from "../ui/modal";

enum Filters {
  IN_MY_WALLET,
  ON_THE_MOON,
}

enum WrappedFilters {
  ALL,
  WRAPPED,
}

const TAKE_COUNTER = 120;

export const AllCats: React.FC = () => {
  const { fetchAllMoonCats, catInfo } = useContext(GraphContext);
  const { acceptOffer } = useContext(MooncatRescueContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentCat, setCurrentCat] = useState<Cat>();
  const [error, setError] = useState<string>();
  const [currentPrice, setCurrentPrice] = useState<string>();
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );
  const [cats, setCats] = useState<Cat[]>([]);
  const [skipCount, setSkipCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<Filters>(
    Filters.IN_MY_WALLET
  );
  const [show, setShow] = useState<WrappedFilters>(WrappedFilters.ALL);

  const handleModalOpen = useCallback((cat: Cat) => {
    setError(undefined);
    setOpenModal(true);
    setCurrentCat(cat);
  }, []);

  const handleModalClose = useCallback(() => setOpenModal(false), []);

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

  const onShow = useCallback(() => {
    setShow(
      show === WrappedFilters.ALL ? WrappedFilters.WRAPPED : WrappedFilters.ALL
    );
  }, [setShow, show]);

  const onSwitch = useCallback(() => {
    setActiveFilter(
      activeFilter === Filters.IN_MY_WALLET
        ? Filters.ON_THE_MOON
        : Filters.IN_MY_WALLET
    );
  }, [activeFilter, setActiveFilter]);

  const handleOnPriceChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setCurrentPrice(value);
    },
    [setCurrentPrice]
  );

  const handleBuyNow = useCallback(async () => {
    if (currentCat && currentCat.activeAdoptionOffer) {
      try {
        await acceptOffer(currentCat.id, currentCat.activeAdoptionOffer.price);
      } catch (e) {
        console.warn(e);
        setError(e?.message);
      }
      setCurrentCat(undefined);
      handleModalClose();
    }
  }, [currentCat, handleModalClose, acceptOffer]);

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

  const showUnwrapped = ({ activeAdoptionOffer }: Cat) =>
    activeAdoptionOffer?.toAddress.toLowerCase() !== WRAPPER;
  // todo: what is this?
  const showAll = ({ activeAdoptionOffer }: Cat) => true;
  const inMyWallet = cats
    .filter(({ inWallet }) => inWallet)
    .filter((item) =>
      show === WrappedFilters.ALL ? showUnwrapped(item) : showAll(item)
    );
  const onTheMoon = cats.filter(({ inWallet }) => !inWallet);

  const toggleValue = activeFilter === Filters.IN_MY_WALLET;
  const toggleShowValue = show === WrappedFilters.ALL;

  const title =
    activeFilter === Filters.IN_MY_WALLET
      ? "Rescued (have been transferred)"
      : "Rescued (not transferred)";

  const showTitle = show === WrappedFilters.ALL ? "Original" : "Wrapped";

  return (
    <div className="content">
      <div className="content__row content__navigation">
        <div className="switch">
          <div className="switch__control" onClick={onShow}>
            <div
              className={`toggle ${!toggleShowValue ? "toggle__active" : ""}`}
            >
              <div className="toggle__pin"></div>
            </div>
          </div>
          <div style={{ width: "16px", position: "relative" }}></div>
          <div className="switch__title">{showTitle}</div>
        </div>
        <div className="switch">
          <div className="switch__title">{title}</div>
          <div className="switch__control" onClick={onSwitch}>
            <div className={`toggle ${!toggleValue ? "toggle__active" : ""}`}>
              <div className="toggle__pin"></div>
            </div>
          </div>
        </div>
      </div>
      {activeFilter === Filters.IN_MY_WALLET && inMyWallet.length !== 0 && (
        <>
          <div className="content__row content__items">
            {inMyWallet.map((cat) => (
              <CatItem
                key={cat.id}
                cat={cat}
                catInfo={catInfo && catInfo[cat.id]}
                hasRescuerIdx={true}
                onClick={onCopyToClipboard}
              >
                <div className="nft__control">
                  {cat.activeAdoptionOffer && (
                    <button
                      className="nft__button"
                      onClick={() => handleModalOpen(cat)}
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
        </>
      )}
      {activeFilter === Filters.ON_THE_MOON && onTheMoon.length !== 0 && (
        <>
          <div className="content__row content__items">
            {onTheMoon.map((cat) => (
              <CatItem
                key={cat.id}
                cat={cat}
                catInfo={catInfo && catInfo[cat.id]}
                hasRescuerIdx={true}
                onClick={onCopyToClipboard}
              >
                <div className="nft__control">
                  {cat.activeAdoptionOffer && (
                    <button
                      className="nft__button"
                      onClick={() => handleModalOpen(cat)}
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
        </>
      )}
      {isCopiedSuccessfully && <CatNotifer />}
      <Modal open={isOpenModal} handleClose={handleModalClose}>
        <div className="inline-form">
          <input
            className="cat-input"
            value={`${
              currentCat &&
              calculatePrice(currentCat.activeAdoptionOffer?.price || "")
            } ETH`}
            onChange={handleOnPriceChange}
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
