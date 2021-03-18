import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../contexts/graph/index";
import { Cat, AdoptionOffer } from "../../contexts/graph/types";
import MooncatRescueContext from "../../contexts/mooncats/index";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import { calculatePrice, WRAPPER } from "../../utils";
import Modal from "../ui/modal";
import Loader from "../ui/loader";
import { ethers } from "ethers";

const TAKE_COUNTER = 150;
const offeredFilter = (cat: AdoptionOffer) =>
  cat.to.toLowerCase() == ethers.constants.AddressZero;

export const OfferedCats: React.FC = () => {
  const { fetchAllOffers, catInfo, isDataLoading } = useContext(GraphContext);
  const { acceptOffer } = useContext(MooncatRescueContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentOffer, setCurrentOffer] = useState<AdoptionOffer>();
  const [error, setError] = useState<string>();
  const [currentPrice, setCurrentPrice] = useState<string>();
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );
  const [offers, setOffers] = useState<AdoptionOffer[]>([]);
  const [skipCount, setSkipCount] = useState<number>(0);

  const handleModalOpen = useCallback((offer: AdoptionOffer) => {
    setError(undefined);
    setOpenModal(true);
    setCurrentOffer(offer);
  }, []);

  const handleModalClose = useCallback(() => setOpenModal(false), []);

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

  const handleOnPriceChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setCurrentPrice(value);
    },
    [setCurrentPrice]
  );

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

  const loadMore = useCallback(() => {
    const skip = skipCount + TAKE_COUNTER;
    const last = window.pageYOffset;
    setIsLoading(true);
    fetchAllOffers(TAKE_COUNTER, skip).then(
      (items: AdoptionOffer[] | undefined) => {
        if (items) {
          const fItems = items.filter(offeredFilter);
          setOffers((prev) => prev.concat(...fItems));
          setSkipCount(skip);
          setIsLoading(false);
          window.scrollTo(0, last);
        }
      }
    );
  }, [skipCount, fetchAllOffers]);

  useEffect(() => {
    fetchAllOffers(TAKE_COUNTER, 0).then(
      (items: AdoptionOffer[] | undefined) => {
        if (items) {
          const fItems = items.filter(offeredFilter);
          setOffers(fItems);
          setIsLoading(false);
        }
      }
    );
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
        {offers
          .sort(
            (a, b) =>
              //@ts-ignore
              new Date(Number(a.timestamp) * 100) -
              //@ts-ignore
              new Date(Number(b.timestamp) * 100)
          )
          .map((offer) => {
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
            value={`${currentOffer && calculatePrice(currentOffer.price)} ETH`}
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
