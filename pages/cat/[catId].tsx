import React, { useState, useEffect } from 'react';
import request from 'graphql-request';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { Cat, CatInfoData } from '../../contexts/graph/types';
import { queryAllCats, queryCatById } from '../../contexts/graph/queries';

import Loader from '../../components/ui/loader';
import SearchCatById from './default';
import {
  CatListItem,
  CatAdoptionDetail,
  CatAdoptionRequest,
} from '../../components/CatItem';

import { drawCat } from '../../utils';
import { ENDPOINT_MOONCAT_PROD, HOME_URL } from '../../lib/consts';
import catInfo from '../../public/data.json';

const CatOverview: React.FC<{ cat: Cat; catImage: string }> = ({
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

const ShowCatById: React.FC<{ cat: Cat }> = ({ cat }) => {
  const {
    query: { catId },
    isFallback,
  } = useRouter();

  const [catImage, setCatImage] = useState<string>(undefined);

  useEffect(() => {
    let isUnmounted = false;
    if (cat) {
      const image = drawCat(catId as string, 10);
      image && !isUnmounted && setCatImage(image);
    }
    return () => {
      isUnmounted = true;
    };
  }, [cat]);

  return (
    <div className="content">
      <Head>
        <title>reNFT - Cat {catId}</title>
        <meta property="og:url" content={`${HOME_URL}/cat/${catId}`} />
        {catImage && (
          <>
            <meta property="og:image" content={catImage} />
            <meta property="og:image_secure_url" content={catImage} />
            <meta property="twitter:image" content={catImage} />
          </>
        )}
      </Head>
      <div className="content center">
        {isFallback ? (
          <Loader />
        ) : (
          <CatOverview cat={cat} catImage={catImage} />
        )}
      </div>
      <SearchCatById buttonText="Show me another cat" />
    </div>
  );
};

export async function getStaticPaths() {
  const allCatsQuery = queryAllCats(500, 0);
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, allCatsQuery);
  const catIds = (cats as Cat[]).map((cat) => ({
    params: { catId: cat.id },
  }));

  return {
    paths: catIds,
    fallback: true,
  };
}

export async function getStaticProps({ params: { catId } }) {
  const catByIdQuery = queryCatById(catId);
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, catByIdQuery);
  return { props: { cat: cats[0] || {} } };
}

export default React.memo(ShowCatById);
