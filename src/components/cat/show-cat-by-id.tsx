import React, { useState, useCallback, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import GraphContext from "../../contexts/graph/index";
import { Cat, CatInfo } from "../../contexts/graph/types";
import { WRAPPER, calculatePrice, drawCat } from "../../utils";
import moment from "moment";
import { ethers } from "ethers";

export const ShowCatById: React.FC = () => {
  const { catId } = useParams<{ catId: string }>();
  const { fetchCatById, catInfo } = useContext(GraphContext);
  const [originCatId, setCatId] = useState<string>("");
  const [catImg, setCatImg] = useState<string>();
  const [cat, setCat] = useState<Cat>();

  const handleOnChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      if (value !== "" && value.trim() !== "") {
        setCatId(value);
        // @ts-ignore
        setCat({});
        setCatImg(undefined);
      }
    },
    [setCatId]
  );

  const prepareDataForCat = (catId: string) => {
    if (catId) {
      const img = drawCat(catId, 10);
      if (img) {
        setCatImg(img);
        fetchCatById(catId).then((data) => setCat(data));
      }
    }
  };

  const handleOnClick = useCallback(() => {
    if (originCatId) {
      window.location.pathname = `/cat/${originCatId}`;
    }
    // @ts-ignore
    setCat({});
  }, [setCat, originCatId, fetchCatById]);

  useEffect(() => {
    if (catId !== "default") {
      prepareDataForCat(catId);
    }
  }, [catId]);

  const info: CatInfo | undefined = catInfo && catInfo[catId || originCatId];
  return (
    <div className="content">
      <div className="cat-overview">
        <div className="item pic">
          {cat && catImg && (
            <div className="cat-preview nft">
              <div className="nft__image">
                <img loading="lazy" src={catImg} />
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Cat id</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{originCatId}</div>
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
              {cat.provenance?.offerPrices &&
                cat.provenance?.offerPrices.length !== 0 && (
                  <div className="adoption__item">
                    <h3>Historical Offer Prices</h3>
                    <ul className="adoption__item_table">
                      {/* @ts-ignore */}
                      {cat.provenance?.offerPrices
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
              {cat.provenance?.requestPrices &&
                cat.provenance?.requestPrices.length !== 0 && (
                  <div className="adoption__item">
                    <h3>Historical Request Prices</h3>
                    <ul className="adoption__item_table">
                      {/* @ts-ignore */}
                      {cat.provenance?.requestPrices
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
              className={`adoption ${cat.activeOffer && "offer"} ${
                cat.activeRequest && "request"
              }`}
            >
              {cat.activeOffer?.to.toLowerCase() == WRAPPER && (
                <div className="adoption__item">
                  <h3>Wrapped</h3>
                  <p>Too bad...</p>
                </div>
              )}
              {cat.activeOffer?.to.toLowerCase() != WRAPPER && cat.activeOffer && (
                <div className="adoption__item">
                  <h3>Offer</h3>
                  <p>
                    Owner of this cat is offering &nbsp;
                    {cat.activeOffer.to != ethers.constants.AddressZero ? (
                      <a
                        target="blank"
                        rel="noreferrer"
                        href={`https://etherscan.io/address/${cat.activeOffer.to}`}
                      >
                        {cat.activeOffer.to}
                      </a>
                    ) : (
                      "everyone"
                    )}
                    , to buy it from them for{" "}
                    {calculatePrice(cat.activeOffer.price)} ETH
                  </p>
                </div>
              )}
              {cat.activeRequest && (
                <div className="adoption__item">
                  <h3>Request</h3>
                  <p>
                    <a
                      target="blank"
                      rel="noreferrer"
                      href={`https://etherscan.io/address/${cat.activeRequest.from}`}
                    >
                      {cat.activeRequest.from}
                    </a>{" "}
                    likes this cat, and they want to buy it for&nbsp;
                    {calculatePrice(cat.activeRequest.price)} ETH
                    {cat.activeOffer?.to.toLowerCase() == WRAPPER &&
                      "... shame it is wrapped :("}
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
