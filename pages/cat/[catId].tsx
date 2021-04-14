import Head from 'next/head';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import moment from 'moment';
import request from 'graphql-request';
import { memo } from 'react';
import { useRouter } from 'next/router';

import { Cat, CatInfoData } from '../../contexts/graph/types';
import { queryCatById, queryAllCats } from '../../contexts/graph/queries';

import Loader from '../../components/ui/loader';
import SearchCatById from './default';
import {
  CatListItem,
  CatAdoptionDetail,
  CatAdoptionRequest,
} from '../../components/CatItem';

import { ENDPOINT_MOONCAT_PROD, HOME_URL } from '../../lib/consts';
import catInfo from '../../public/data.json';
import { storage } from '../../lib/firebase';
import { drawCat } from '../../utils';

type IndividualCatProps = {
  cat: Cat;
  catImage: string | null;
  catImageURL: string;
};

const CatOverview: React.FC<Omit<IndividualCatProps, 'catImageURL'>> = ({
  cat,
  catImage,
}) => {
  const info = (catInfo as CatInfoData)['data'].find(
    (cIn) => cIn.catId === cat.id
  );
  return (
    <div className="cat-overview">
      <div className="item pic">
        {cat && catImage && (
          <div className="cat-preview nft">
            <div className="nft__image">
              <img loading="lazy" src={catImage} />
            </div>
            <CatListItem title="Cat id" value={cat.id} />
            {info && (
              <>
                <CatListItem title="Color" value={info.color} />
                <CatListItem title="Palette" value={info.palette} />
                <CatListItem title="Pattern" value={info.pattern} />
                <CatListItem
                  title="Rescued on"
                  value={moment(Number(cat.rescueTimestamp) * 1000).format(
                    'MM/D/YY hh:mm'
                  )}
                />
                <CatListItem
                  title="Statistical Rank"
                  value={info.statisticalRank}
                />
                <CatListItem
                  title="Trait Rarity Rank"
                  value={info.traitRarityRank}
                />
              </>
            )}
          </div>
        )}
      </div>
      {cat && (
        <>
          <div className="item adoption">
            <CatAdoptionDetail cat={cat} />
          </div>
          <div className="item adoption">
            <CatAdoptionRequest cat={cat} />
          </div>
        </>
      )}
    </div>
  );
};

const ShowCatById: React.FC<IndividualCatProps> = ({ cat, catImage }) => {
  const {
    query: { catId },
    isFallback,
  } = useRouter();

  return (
    <>
      <Head>
        <title>reNFT - Cat {catId}</title>
        <meta property="og:description" content="reNFTs Cat ID" />
        <meta property="og:title" content="MoonCat Rescue Shop" />
        <meta name="og:url" content={`${HOME_URL}/cat/${catId}`} />
      </Head>
      <div className="content">
        <div className="content center">
          {isFallback ? (
            <Loader />
          ) : (
            <CatOverview cat={cat} catImage={catImage} />
          )}
        </div>
        <SearchCatById buttonText="Show me another cat" />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  IndividualCatProps,
  { catId: string }
> = async ({ params: { catId } }) => {
  const catByIdQuery = queryCatById(catId);
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, catByIdQuery);
  const downloadURL = await storage
    .ref()
    .child(`cats/${catId}.png`)
    .getDownloadURL();
  const catImage = drawCat(catId, true);
  return { props: { cat: cats[0] || {}, catImageURL: downloadURL, catImage } };
};

export default memo(ShowCatById);
