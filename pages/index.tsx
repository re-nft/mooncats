import React, { useCallback, useContext, useMemo, useState } from 'react';
import { request } from 'graphql-request';
import { queryAllCats } from '../contexts/graph/queries';
import {
  ENDPOINT_MOONCAT_PROD,
  FETCH_ALL_CATS_TAKE,
  HOME_URL,
} from '../lib/consts';

import GraphContext from '../contexts/graph';
import MooncatsContext from '../contexts/mooncats';
import { Cat } from '../contexts/graph/types';
import { CurrentAddressContext } from '../hardhat/SymfoniContext';

import CatItem from '../components/CatItem';
import CatCopyNotifier from '../components/CopyNotifier';
import Loader from '../components/ui/loader';
import Modal from '../components/ui/modal';
import { calculatePrice } from '../utils';
import Head from 'next/head';
import { GetStaticProps } from 'next';

type IndexPageProps = {
  cats: Cat[];
};

enum WrappedFilters {
  ALL,
  WRAPPED,
}

const Index: React.FC<IndexPageProps> = ({ cats: ssrCats }) => {
  const [currentAddress] = useContext(CurrentAddressContext);
  // Contexts
  const { fetchAllMoonCats } = useContext(GraphContext);
  const { acceptOffer } = useContext(MooncatsContext);

  // Local state
  const [cats, setCats] = useState(ssrCats);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentCat, setCurrentCat] = useState<Cat>(undefined);
  const [error, setError] = useState<string>(undefined);
  const [_, setCurrentCatPrice] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [skipCount, setSkipCount] = useState<number>(120);
  const [showFilters, setShowFilters] = useState<WrappedFilters>(
    WrappedFilters.ALL
  );

  // Memoized variables
  const wrappedCats = useMemo(() => cats.filter((c) => c.isWrapped), [cats]);
  const originalCats = useMemo(() => cats.filter((c) => !c.isWrapped), [cats]);
  const modalFormValue = useMemo(
    () =>
      currentCat &&
      calculatePrice(currentCat?.activeOffer?.price || '' + ' ETH'),
    [currentCat]
  );

  // Instance variables
  const toggleShowValue = showFilters === WrappedFilters.ALL;
  const titleText = showFilters === WrappedFilters.ALL ? 'Original' : 'Wrapped';

  // Callbacks
  const handleSwitchControl = useCallback(() => {
    setShowFilters((s) =>
      s === WrappedFilters.ALL ? WrappedFilters.WRAPPED : WrappedFilters.ALL
    );
  }, [setShowFilters]);

  const handleModalOpen = useCallback((cat: Cat) => {
    setIsModalOpen(true);
    setCurrentCat(cat);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCopyToClipboard = useCallback((cat: Cat) => {
    const textField = document.createElement('textarea');
    textField.innerText = cat.id;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setIsCopied(true);
    typeof window !== undefined &&
      window.setTimeout(() => setIsCopied(false), 3000);
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCurrentCatPrice(e.target.value);

  const handleCatBuy = useCallback(async () => {
    try {
      if (currentCat?.activeOffer) {
        await acceptOffer(currentCat.id, currentCat.activeOffer.price);
      }
    } catch (err) {
      setError(err?.message);
    }
    handleModalClose();
    setCurrentCat(undefined);
  }, [currentCat, handleModalClose, acceptOffer]);

  const loadCats = useCallback(async () => {
    setLoading(true);
    const newSkip = skipCount + FETCH_ALL_CATS_TAKE;
    const last = window.pageYOffset;
    const newCats = await fetchAllMoonCats(FETCH_ALL_CATS_TAKE, newSkip);
    if (newCats) {
      setCats((olCats) => [...olCats, ...newCats]);
      setSkipCount(newSkip);
      typeof window !== undefined && window.scrollTo(0, last);
    }
    setLoading(false);
  }, [skipCount, fetchAllMoonCats]);

  // Helper methods
  const renderCats = (cats: Cat[]): JSX.Element => {
    return (
      <div className="content__row content__items">
        {cats.map((c) => (
          <CatItem
            key={c.id}
            cat={c}
            hasRescuerIdx={true}
            onClick={handleCopyToClipboard}
          >
            <div className="nft__control">
              {c.activeOffer && (
                <button
                  className="nft__button"
                  onClick={() => handleModalOpen(c)}
                >
                  Buy now
                </button>
              )}
            </div>
          </CatItem>
        ))}
      </div>
    );
  };

  if (!currentAddress) return <h1>Fetching address ...</h1>;
  if (isLoading)
    return (
      <div className="content center">
        <Loader />
      </div>
    );

  return (
    <div className="content">
      <Head>
        <title>reNFT - All cats</title>
        <meta property="og:url" content={HOME_URL} />
      </Head>
      <div className="content__row content__navigation">
        <div className="switch">
          <div className="switch__control" onClick={handleSwitchControl}>
            <div
              className={`toggle ${!toggleShowValue ? 'toggle__active' : ''}`}
            >
              <div className="toggle__pin"></div>
            </div>
          </div>
          <div style={{ width: '16px', position: 'relative' }}></div>
          <div className="switch__title">{titleText}</div>
        </div>
      </div>
      {renderCats(
        showFilters === WrappedFilters.ALL ? originalCats : wrappedCats
      )}
      {!isLoading && (
        <div className="load-more">
          <button className="nft__button" onClick={loadCats}>
            Load more
          </button>
        </div>
      )}
      {isCopied && <CatCopyNotifier />}
      <Modal open={isModalOpen} handleClose={handleModalClose}>
        <div className="inline-form">
          <input
            className="cat-input"
            value={modalFormValue}
            onChange={handlePriceChange}
          />
          <button className="nft__button" onClick={handleCatBuy}>
            BUY NOW
          </button>
        </div>
        {error && <div className="form-error">{error}</div>}
      </Modal>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const fetchCatsQuery = queryAllCats(FETCH_ALL_CATS_TAKE * 1, 0);
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, fetchCatsQuery);
  return {
    props: { cats },
  };
};

export default React.memo(Index);
