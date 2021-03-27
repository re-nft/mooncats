import React, { useState, useCallback, useContext, useEffect } from 'react';
import GraphContext from '../../contexts/graph/index';
import { Cat } from '../../contexts/graph/types';
import MooncatRescueContext from '../../contexts/mooncats/index';
import CatNotifer from './copy-notifer';
import CatItem from './cat-item';
import { calculatePrice } from '../../utils';
import Modal from '../ui/modal';
import Loader from '../ui/loader';

enum WrappedFilters {
  ALL,
  WRAPPED,
}

const TAKE_COUNTER = 120;
const isWrappedFilter = (cat: Cat) => cat.isWrapped;

export const AllCats: React.FC = () => {
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
  const [show, setShow] = useState<WrappedFilters>(WrappedFilters.ALL);

  const handleModalOpen = useCallback((cat: Cat) => {
    setError(undefined);
    setOpenModal(true);
    setCurrentCat(cat);
  }, []);

  const handleModalClose = useCallback(() => setOpenModal(false), []);

  const onCopyToClipboard = useCallback((cat: Cat) => {
    const textField = document.createElement('textarea');
    textField.innerText = cat.id;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setIsCopiedSuccessfully(true);
    window.setTimeout(() => setIsCopiedSuccessfully(false), 3000);
  }, []);

  const onShow = useCallback(() => {
    setShow(
      show === WrappedFilters.ALL ? WrappedFilters.WRAPPED : WrappedFilters.ALL
    );
  }, [setShow, show]);

  const handleOnPriceChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setCurrentPrice(value);
    },
    [setCurrentPrice]
  );

  const handleBuyNow = useCallback(async () => {
    if (currentCat && currentCat.activeOffer) {
      try {
        await acceptOffer(currentCat.id, currentCat.activeOffer.price);
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
    const last = window.pageYOffset;
    setIsLoading(true);
    fetchAllMoonCats(TAKE_COUNTER, skip).then((items: Cat[] | undefined) => {
      if (items) {
        setCats((prev) => prev.concat(...items));
        setSkipCount(skip);
        setIsLoading(false);
        window.scrollTo(0, last);
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

  const toggleShowValue = show === WrappedFilters.ALL;
  const showTitle = show === WrappedFilters.ALL ? 'Original' : 'Wrapped';

  if (!isDataLoading) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }

  const wrapped = cats.filter(({ isWrapped }: Cat) => isWrapped);
  const original = cats.filter(({ isWrapped }: Cat) => !isWrapped);

  return (
    <div className="content">
      <div className="content__row content__navigation">
        <div className="switch">
          <div className="switch__control" onClick={onShow}>
            <div
              className={`toggle ${!toggleShowValue ? 'toggle__active' : ''}`}
            >
              <div className="toggle__pin"></div>
            </div>
          </div>
          <div style={{ width: '16px', position: 'relative' }}></div>
          <div className="switch__title">{showTitle}</div>
        </div>
      </div>
      {show === WrappedFilters.ALL && (
        <div className="content__row content__items">
          {original.map((cat) => (
            <CatItem
              key={cat.id}
              cat={cat}
              catInfo={catInfo && catInfo[cat.id]}
              hasRescuerIdx={true}
              onClick={onCopyToClipboard}
            >
              <div className="nft__control">
                {cat.activeOffer && (
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
      )}
      {show === WrappedFilters.WRAPPED && (
        <div className="content__row content__items">
          {wrapped.map((cat) => (
            <CatItem
              key={cat.id}
              cat={cat}
              catInfo={catInfo && catInfo[cat.id]}
              hasRescuerIdx={true}
              onClick={onCopyToClipboard}
            >
              <div className="nft__control">
                {cat.activeOffer && (
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
      )}
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
              currentCat && calculatePrice(currentCat.activeOffer?.price || '')
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
