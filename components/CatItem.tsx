import React, { useState, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import { ethers } from 'ethers';
import { Cat, CatInfoData } from '../contexts/graph/types';
import { WRAPPER, hexToAscii, calculatePrice, drawCat } from '../utils';
import Modal from './ui/modal';
import moment from 'moment';
import catInfo from '../public/data.json';

interface CatItemProps {
  hasRescuerIdx?: boolean;
  rescuerId?: number;
  cat: Cat;
  onClick(cat: Cat): void;
  children: React.ReactChild;
}

export const CatListItem = ({
  title,
  value,
}: {
  title: string | React.ReactChild;
  value: string | React.ReactChild;
}) => {
  return (
    <div className="nft__meta_row">
      <div className="nft__meta_title">{title}</div>
      <div className="nft__meta_dot"></div>
      <div className="nft__meta_value">{value}</div>
    </div>
  );
};

export const CatAdoptionDetail: React.FC<{ cat: Cat }> = ({ cat }) => {
  const { provenance } = cat;
  return (
    <div className="adoption">
      {provenance?.offerPrices && provenance?.offerPrices.length !== 0 && (
        <div className="adoption__item">
          <h3>Historical Offer Prices</h3>
          <ul className="adoption__item_table">
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
      {provenance?.requestPrices && provenance?.requestPrices?.length !== 0 && (
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
  );
};

export const CatAdoptionRequest: React.FC<{ cat: Cat }> = ({ cat }) => {
  const { activeOffer, activeRequest } = cat;
  return (
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
            , to buy it from them for {calculatePrice(activeOffer.price)} ETH
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
  );
};

const CatItem: React.FC<CatItemProps> = ({ cat, onClick, children }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const { id, name, activeOffer, activeRequest, provenance } = cat;
  const img = drawCat(id);

  const handleModalOpen = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);

  const onClickHandler = useCallback(() => {
    onClick(cat);
  }, [cat, onClick]);

  const catInfoInd = useMemo(
    () =>
      (catInfo as CatInfoData)['data'].find((cInd) => cInd.catId === cat.id),
    [catInfo.data, cat.id]
  );

  return (
    <>
      <div className="nft" key={id} data-item-id={id}>
        <div className="nft__adoption" onClick={handleModalOpen}>
          {cat.isWrapped && <div className="nft__adoption_offered">W</div>}
          {activeRequest && <div className="nft__adoption_requested">R</div>}
        </div>
        {provenance?.offerPrices && provenance?.offerPrices?.length > 1 && (
          <div
            className="nft__history"
            onClick={() => setHistoryModalOpen(true)}
          >
            H
          </div>
        )}
        <NextLink href={`/cat/${cat.id}`}>
          <a className="pseudo-link">
            <div className="nft__image">
              {img ? (
                <img loading="lazy" src={img} />
              ) : (
                <div className="no-img">NO CAT</div>
              )}
            </div>
          </a>
        </NextLink>
        <div
          className="nft__meta"
          onClick={onClickHandler}
          title="Click to Copy Cat ID"
        >
          {activeOffer?.price && (
            <CatListItem
              title={<b style={{ fontSize: '24px' }}>Best Buy Price</b>}
              value={
                <b style={{ fontSize: '24px' }}>
                  {calculatePrice(activeOffer.price)}&nbsp;ETH
                </b>
              }
            />
          )}
          {activeRequest?.price && (
            <CatListItem
              title={<b style={{ fontSize: '24px' }}>Best Buy Price</b>}
              value={
                <b style={{ fontSize: '24px' }}>
                  {calculatePrice(activeRequest.price)}&nbsp;ETH
                </b>
              }
            />
          )}
          <CatListItem title="Cat id" value={id} />
          {name && <CatListItem title="Name" value={hexToAscii(name)} />}
          <CatListItem
            title="Rescued on"
            value={moment(Number(cat.rescueTimestamp) * 1000).format(
              'MM/D/YY hh:mm'
            )}
          />
          {catInfoInd && (
            <>
              <CatListItem title="Color" value={catInfoInd.color} />
              <CatListItem title="Palette" value={catInfoInd.palette} />
              <CatListItem title="Pattern" value={catInfoInd.pattern} />
              <CatListItem
                title="Statistical Rank"
                value={catInfoInd.statisticalRank}
              />
              <CatListItem
                title="Trait Rarity Rank"
                value={catInfoInd.traitRarityRank}
              />
            </>
          )}
        </div>
        {children}
      </div>
      <Modal
        open={isHistoryModalOpen}
        handleClose={() => setHistoryModalOpen(false)}
      >
        <CatAdoptionDetail cat={cat} />
      </Modal>
      <Modal open={isModalOpen} handleClose={handleModalClose}>
        <CatAdoptionRequest cat={cat} />
      </Modal>
    </>
  );
};

export default React.memo(CatItem);
