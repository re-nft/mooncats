import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../contexts/graph/index";
import MooncatRescueContext from "../../contexts/mooncats/index";
import { Cat } from "../../contexts/graph/types";
import CatNotifer from "./copy-notifer";
import CatItem from "./cat-item";
import Modal from "../ui/modal";
import { ethers } from "ethers";

export const MyCats: React.FC = () => {
  const { usersMoonCats, catInfo } = useContext(GraphContext);
  const [currentCat, setCurrentCat] = useState<Cat>();
  const [_salePrice, _setSalePrice] = useState<string>();
  const [isOpenSaleModal, setOpenSaleModal] = useState<boolean>(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [isCatLoaded, setIsCatLoaded] = useState<boolean>(false);
  const [isCopiedSuccessfully, setIsCopiedSuccessfully] = useState<boolean>(
    false
  );
  const { createOffer, cancelOffer } = useContext(MooncatRescueContext);

  const handleModalOpen = useCallback((cat: Cat) => {
    setOpenSaleModal(true);
    setCurrentCat(cat);
  }, []);
  const handleModalClose = useCallback(() => setOpenSaleModal(false), []);

  const handleOnSalePriceChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      _setSalePrice(value);
    },
    [_setSalePrice]
  );

  const handleOnSaleSubmit = useCallback(async () => {
    if (_salePrice && currentCat) {
      try {
        const resolvedPrice = ethers.utils.parseEther(_salePrice);
        await createOffer(currentCat.id, resolvedPrice.toString());
      } catch (e) {
        console.warn(e);
      }
      _setSalePrice("");
      setCurrentCat(undefined);
      handleModalClose();
    }
  }, [_salePrice, currentCat, handleModalClose, createOffer]);

  const handleOnCancelSubmit = async (cat: Cat) => {
    if (!cat) return;
    try {
      await cancelOffer(cat.id);
    } catch (e) {
      console.warn(e);
    }
  };

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

  const onClick = useCallback(() => {
    setCats(usersMoonCats);
    setIsCatLoaded(true);
  }, [setCats, usersMoonCats]);

  useEffect(() => {
    setCats(usersMoonCats);
  }, [usersMoonCats]);

  const inMyWallet = cats.filter(({ inWallet }) => inWallet);
  const onTheMoon = cats.filter(({ inWallet }) => !inWallet);

  return (
    <div className="content">
      {!isCatLoaded && (
        <div className="content-center">
          <button className="nft__button" onClick={onClick}>
            Show me my cats
          </button>
        </div>
      )}
      {isCatLoaded && cats.length === 0 && (
        <div className="no-cats">No cats here...</div>
      )}
      {isCatLoaded && inMyWallet.length !== 0 && (
        <>
          <h2 className="content-header">In My Wallet</h2>
          <div className="content__row content__items">
            {inMyWallet.map((cat) => (
              <CatItem
                key={cat.id}
                cat={cat}
                catInfo={catInfo && catInfo[cat.id]}
                onClick={onCopyToClipboard}
              >
                <div className="nft__control">
                  {!cat.activeAdoptionOffer && (
                    <button
                      className="nft__button"
                      onClick={() => handleModalOpen(cat)}
                    >
                      Sell
                    </button>
                  )}
                  {cat.activeAdoptionOffer && (
                    <button
                      className="nft__button"
                      onClick={() => handleOnCancelSubmit(cat)}
                    >
                      Cancel Sell
                    </button>
                  )}
                  {cat.activeAdoptionRequest && (
                    <button className="nft__button">Pending Bid</button>
                  )}
                </div>
              </CatItem>
            ))}
          </div>
        </>
      )}
      {isCatLoaded && onTheMoon.length !== 0 && (
        <>
          <h2 className="content-header">On The Moon</h2>
          <div className="content__row content__items">
            {onTheMoon.map((cat) => (
              <CatItem
                key={cat.id}
                cat={cat}
                catInfo={catInfo && catInfo[cat.id]}
                onClick={onCopyToClipboard}
              >
                <div className="nft__control">
                  <button
                    className="nft__button"
                    onClick={() => handleModalOpen(cat)}
                  >
                    Sell
                  </button>
                  {cat.activeAdoptionRequest && (
                    <button className="nft__button">Accept request</button>
                  )}
                </div>
              </CatItem>
            ))}
          </div>
        </>
      )}
      {isCopiedSuccessfully && <CatNotifer />}
      <Modal open={isOpenSaleModal} handleClose={handleModalClose}>
        <div className="cat-form">
          <input
            className="cat-input"
            placeholder="PRICE IN ETH"
            onChange={handleOnSalePriceChange}
          />
          <button className="nft__button" onClick={handleOnSaleSubmit}>
            Set Sale Price
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(MyCats);
