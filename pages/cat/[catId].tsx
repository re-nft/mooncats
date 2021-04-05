import fs from 'fs-extra';
import path from 'path';
import { GetStaticProps } from 'next';
import { memo, useMemo } from 'react';
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

import { ENDPOINT_MOONCAT_PROD, HOME_URL } from '../../lib/consts';
import catInfo from '../../public/data.json';
import { drawCat } from '../../utils';

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

const ShowCatById: React.FC<{ cat: Cat; catImage: string | null }> = ({
  cat,
  catImage,
}) => {
  const {
    query: { catId },
    isFallback,
  } = useRouter();

  const catImageURL = useMemo(
    () =>
      typeof window !== undefined && catImage ? `${HOME_URL}${catImage}` : null,
    [catImage]
  );

  return (
    <>
      <Head>
        <title>reNFT - Cat {catId}</title>
        <meta property="og:title" />
        <meta property="og:url" content={`${HOME_URL}/cat/${catId}`} />
        {catImageURL && (
          <>
            <meta property="og:image" content={catImageURL} />
            <meta property="og:image_secure_url" content={catImageURL} />
            <meta property="twitter:image" content={catImageURL} />
          </>
        )}
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

export const getStaticProps: GetStaticProps<
  {
    cat: Cat;
    catImage: string | null;
  },
  { catId: string }
> = async ({ params: { catId } }) => {
  const catByIdQuery = queryCatById(catId);
  const image = drawCat(catId, true);
  const catImagePath = path.resolve(`./public`, `cats`, `${catId}.png`);
  const catDirPath = path.resolve(`./public`, `cats`);
  const [_, base64Data] = image.split(',');
  await fs.mkdirp(catDirPath);
  if (!(await fs.pathExists(catImagePath))) {
    console.log('CAT ID IMAGE STORED');
    await fs.writeFile(catImagePath, base64Data, 'base64');
  }
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, catByIdQuery);
  return { props: { cat: cats[0] || {}, catImage: `/cats/${catId}.png` } };
};

export default memo(ShowCatById);
