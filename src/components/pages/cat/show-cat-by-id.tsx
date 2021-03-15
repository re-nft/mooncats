import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph/index";
import { Cat } from "../../../contexts/graph/types";
import { WRAPPER, calculatePrice, drawCat } from "./utils";
import { fetchRarityData, CatInfo } from "./cat-data";
import moment from "moment";
import { ethers } from "ethers";

export const ShowCatById: React.FC = () => {
  const { fetchCatById } = useContext(GraphContext);
  const [catId, setCatId] = useState<string>("");
  const [catInfo, setCatInfo] = useState<Record<string, CatInfo>>();
  const [catImg, setCatImg] = useState<string>();
  const [isValid, setIsValid] = useState<boolean>(true);
  const [cat, setCat] = useState<Cat>();

  const handleOnChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      if (value !== "" && value.trim() !== "") {
        setCatId(value);
      }
    },
    [setCatId]
  );

  const handleOnClick = useCallback(() => {
    if (catId) {
      const img = drawCat(catId, 10);
      if (img) {
        setCatImg(img);
        fetchCatById(catId).then((data) => setCat(data));
      }
    }

    // @ts-ignore
    setCat({});
  }, [setCat, catId, fetchCatById]);

  useEffect(() => {
    fetchRarityData().then((data) => setCatInfo(data));
    /* eslint-disable-next-line */
  }, []);

  const info: CatInfo | undefined = catInfo && catInfo[catId];
  return (
    <div className="content">
      <div className="cat-overview">
        <div className="item pic">
          {catImg && (
            <div className="cat-preview nft">
              <div className="nft__image">
                <img loading="lazy" src={catImg} />
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Cat id</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catId}</div>
              </div>
              {info && (
                <>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Color</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">{info.color}</div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Palette</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">{info.palette}</div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Pattern</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">{info.pattern}</div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Statistical Rank</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">
                      {info.statisticalRank}
                    </div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Trait Rarity Rank</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">
                      {info.traitRarityRank}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="item adoption">
          {cat && (
            <div className="adoption">
              {cat.offerPrices && cat.offerPrices.length !== 0 && (
                <div className="adoption__item">
                  <h3>Historical Offer Prices</h3>
                  <ul className="adoption__item_table">
                    {/* @ts-ignore */}
                    {cat.offerPrices
                      .sort(
                        (a, b) =>
                          //@ts-ignore
                          new Date(Number(a.timestamp) * 100) -
                          //@ts-ignore
                          new Date(Number(b.timestamp) * 100)
                      )
                      .map((item) => (
                        <li className="table-row" key={item.timestamp}>
                          <span className="table-row-column">
                            {moment(Number(item.timestamp) * 1000).format(
                              "MMMM D YYYY h:mm"
                            )}
                          </span>
                          <span className="table-row-column">
                            {calculatePrice(item.price)}&nbsp;ETH
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {cat.requestPrices && cat.requestPrices.length !== 0 && (
                <div className="adoption__item">
                  <h3>Historical Request Prices</h3>
                  <ul className="adoption__item_table">
                    {/* @ts-ignore */}
                    {cat.requestPrices
                      .sort(
                        (a, b) =>
                          //@ts-ignore
                          new Date(Number(a.timestamp) * 100) -
                          //@ts-ignore
                          new Date(Number(b.timestamp) * 100)
                      )
                      .map((item) => (
                        <li className="table-row" key={item.timestamp}>
                          <span className="table-row-column">
                            {moment(Number(item.timestamp) * 1000).format(
                              "MMMM D YYYY h:mm"
                            )}
                          </span>
                          <span className="table-row-column">
                            {calculatePrice(item.price)}&nbsp;ETH
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="item adoption">
          {cat && (
            <div
              className={`adoption ${cat.activeAdoptionOffer && "offer"} ${
                cat.activeAdoptionRequest && "request"
              }`}
            >
              {cat.activeAdoptionOffer?.toAddress.toLowerCase() == WRAPPER && (
                <div className="adoption__item">
                  <h3>Wrapped</h3>
                  <p>Too bad...</p>
                </div>
              )}
              {cat.activeAdoptionOffer?.toAddress.toLowerCase() != WRAPPER &&
                cat.activeAdoptionOffer && (
                  <div className="adoption__item">
                    <h3>Offer</h3>
                    <p>
                      Owner of this cat is offering &nbsp;
                      {cat.activeAdoptionOffer.toAddress !=
                      ethers.constants.AddressZero ? (
                        <a
                          target="blank"
                          rel="noreferrer"
                          href={`https://etherscan.io/address/${cat.activeAdoptionOffer.toAddress}`}
                        >
                          {cat.activeAdoptionOffer.toAddress}
                        </a>
                      ) : (
                        "everyone"
                      )}
                      , to buy it from them for{" "}
                      {calculatePrice(cat.activeAdoptionOffer.price)} ETH
                    </p>
                  </div>
                )}
              {cat.activeAdoptionRequest && (
                <div className="adoption__item">
                  <h3>Request</h3>
                  <p>
                    <a
                      target="blank"
                      rel="noreferrer"
                      href={`https://etherscan.io/address/${cat.activeAdoptionRequest.from}`}
                    >
                      {cat.activeAdoptionRequest.from}
                    </a>{" "}
                    likes this cat, and they want to buy it for&nbsp;
                    {calculatePrice(cat.activeAdoptionRequest.price)} ETH
                    {cat.activeAdoptionOffer?.toAddress.toLowerCase() ==
                      WRAPPER && "... shame it is wrapped :("}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="cat-form">
        <input
          name="cat-id"
          className="cat-input"
          placeholder="CAT ID"
          onChange={handleOnChange}
        />
        <button className="nft__button" onClick={handleOnClick}>
          {catImg ? "Show me another cat" : "Show me my cat"}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ShowCatById);
