import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../contexts/graph/index";
import { Cat } from "../../contexts/graph/types";
import MooncatRescueContext from "../../contexts/mooncats/index";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import { calculatePrice, WRAPPER } from "../../utils";
import Modal from "../ui/modal";
import Loader from "../ui/loader";

const TAKE_COUNTER = 950;
const offeredFilter = (cat: Cat) =>
  cat.activeAdoptionOffer &&
  cat.activeAdoptionOffer?.toAddress.toLowerCase() != WRAPPER;

export const OfferedCats: React.FC = () => {
  const { fetchAllMoonCats, catInfo, isDataLoading } = useContext(GraphContext);
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
        const fItems = items.filter(offeredFilter);
        setCats((prev) => prev.concat(...fItems));
        setSkipCount(skip);
        setIsLoading(false);
      }
    });
  }, [skipCount, fetchAllMoonCats]);

  useEffect(() => {
    fetchAllMoonCats(TAKE_COUNTER, 0).then((items: Cat[] | undefined) => {
      if (items) {
        const fItems = items.filter(offeredFilter);
        setCats(fItems);
        setIsLoading(false);
      }
    });
    /* eslint-disable-next-line */
  }, []);

  if (!isDataLoading) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="content">
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

export default React.memo(OfferedCats);
