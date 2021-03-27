import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Cat, CatInfo } from '../../contexts/graph/types';
import { WRAPPER, hexToAscii, calculatePrice, drawCat } from '../../utils';
import Modal from '../ui/modal';
import moment from 'moment';

const CatItem: React.FC<{
  hasRescuerIdx?: boolean;
  rescuerId?: number;
  cat: Cat;
  catInfo?: CatInfo;
  onClick(cat: Cat): void;
  children: React.ReactChild;
}> = ({
  cat,
  onClick,
  hasRescuerIdx: hasRescueIdx = false,
  catInfo,
  children,
}) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const { id, name, activeOffer, activeRequest, provenance } = cat;
  const img = drawCat(id, 10);

  const handleModalOpen = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);

  const handleHistoryModalOpen = useCallback(
    () => setHistoryModalOpen(true),
    []
  );
  const handleHistoryModalClose = useCallback(
    () => setHistoryModalOpen(false),
    []
  );

  const onClickHandler = useCallback(() => {
    onClick(cat);
  }, [cat, onClick]);

  return (
    <>
      <div className="nft" key={id} data-item-id={id}>
        <div className="nft__adoption" onClick={handleModalOpen}>
          {cat.isWrapped && <div className="nft__adoption_offered">W</div>}
          {activeRequest && <div className="nft__adoption_requested">R</div>}
        </div>
        {provenance?.offerPrices && provenance?.offerPrices?.length > 1 && (
          <div className="nft__history" onClick={handleHistoryModalOpen}>
            H
          </div>
        )}
        <Link className="pseudo-link" to={`/cat/${id}`}>
          <div className="nft__image">
            {img ? (
              <img loading="lazy" src={img} />
            ) : (
              <div className="no-img">NO CAT</div>
            )}
          </div>
        </Link>
        <div
          className="nft__meta"
          onClick={onClickHandler}
          title="Click to Copy Cat ID"
        >
          {activeOffer?.price && (
            <div className="nft__meta_row">
              <div className="nft__meta_title">
                <b style={{ fontSize: '24px' }}>Sell Price</b>
              </div>
              <div className="nft__meta_dot"></div>
              <div className="nft__meta_value">
                <b style={{ fontSize: '24px' }}>
                  {calculatePrice(activeOffer.price)}&nbsp;ETH
                </b>
              </div>
            </div>
          )}
          {activeRequest?.price && (
            <div className="nft__meta_row">
              <div className="nft__meta_title">
                <b style={{ fontSize: '24px' }}>Best Buy Price</b>
              </div>
              <div className="nft__meta_dot"></div>
              <div className="nft__meta_value">
                <b style={{ fontSize: '24px' }}>
                  {calculatePrice(activeRequest.price)}&nbsp;ETH
                </b>
              </div>
            </div>
          )}
          <div className="nft__meta_row">
            <div className="nft__meta_title">Cat id</div>
            <div className="nft__meta_dot"></div>
            <div className="nft__meta_value">{id}</div>
          </div>
          {name && (
            <div className="nft__meta_row">
              <div className="nft__meta_title">Name</div>
              <div className="nft__meta_dot"></div>
              <div className="nft__meta_value">{hexToAscii(name)}</div>
            </div>
          )}
          <div className="nft__meta_row">
            <div className="nft__meta_title">Rescued on</div>
            <div className="nft__meta_dot"></div>
            <div className="nft__meta_value">
              {moment(Number(cat.rescueTimestamp) * 1000).format(
                'MM/D/YY hh:mm'
              )}
            </div>
          </div>
          {catInfo && (
            <>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Color</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catInfo.color}</div>
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Palette</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catInfo.palette}</div>
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Pattern</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catInfo.pattern}</div>
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Statistical Rank</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catInfo.statisticalRank}</div>
              </div>
              <div className="nft__meta_row">
                <div className="nft__meta_title">Trait Rarity Rank</div>
                <div className="nft__meta_dot"></div>
                <div className="nft__meta_value">{catInfo.traitRarityRank}</div>
              </div>
            </>
          )}
        </div>
        {children}
      </div>
      <Modal open={isHistoryModalOpen} handleClose={handleHistoryModalClose}>
        <div className="adoption">
          {provenance?.offerPrices && provenance?.offerPrices.length !== 0 && (
            <div className="adoption__item">
              <h3>Historical Offer Prices</h3>
              <ul className="adoption__item_table">
                {/* @ts-ignore */}
                {provenance.offerPrices
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
                          'MMMM D YYYY h:mm'
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
          {provenance?.requestPrices && provenance?.requestPrices.length !== 0 && (
            <div className="adoption__item">
              <h3>Historical Request Prices</h3>
              <ul className="adoption__item_table">
                {/* @ts-ignore */}
                {provenance.requestPrices
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
                          'MMMM D YYYY h:mm'
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
      </Modal>
      <Modal open={isModalOpen} handleClose={handleModalClose}>
        <div
          className={`adoption ${activeOffer && 'offer'} ${
            activeRequest && 'request'
          }`}
        >
          {cat.isWrapped && (
            <div className="adoption__item">
              <h3>Wrapped</h3>
              <p>Too bad...</p>
            </div>
          )}
          {cat.isWrapped && activeOffer && (
            <div className="adoption__item">
              <h3>Offer</h3>
              <p>
                Owner of this cat is offering &nbsp;
                {activeOffer.to != ethers.constants.AddressZero ? (
                  <a
                    target="blank"
                    rel="noreferrer"
                    href={`https://etherscan.io/address/${activeOffer.to}`}
                  >
                    {activeOffer.to}
                  </a>
                ) : (
                  'everyone'
                )}
                , to buy it from them for {calculatePrice(activeOffer.price)}{' '}
                ETH
              </p>
            </div>
          )}
          {activeRequest && (
            <div className="adoption__item">
              <h3>Request</h3>
              <p>
                <a
                  target="blank"
                  rel="noreferrer"
                  href={`https://etherscan.io/address/${activeRequest.from}`}
                >
                  {activeRequest.from}
                </a>{' '}
                likes this cat, and they want to buy it for&nbsp;
                {calculatePrice(activeRequest.price)} ETH
                {activeOffer?.to.toLowerCase() == WRAPPER &&
                  '... shame it is wrapped :('}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default React.memo(CatItem);
