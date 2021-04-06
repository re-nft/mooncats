import fs from 'fs-extra';
import path from 'path';
import absoluteURL from 'next-absolute-url';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import { memo } from 'react';
import request from 'graphql-request';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { Cat, CatInfoData } from '../../contexts/graph/types';
import { queryCatById } from '../../contexts/graph/queries';

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

const ShowCatById: React.FC<{ cat: Cat; catImage: string | null }> = ({
  cat,
  catImage,
}) => {
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
  {
    cat: Cat;
    catImage: string | null;
  },
  { catId: string }
> = async ({ req, params: { catId } }) => {
  const catByIdQuery = queryCatById(catId);
  const image = drawCat(catId, true);
  console.log('DRAWN CAT');
  const { origin, host } = absoluteURL(req);
  const catsPath =
    host.includes('localhost') || host.includes('ngrok')
      ? './public/cats'
      : './cats';
  console.log('CATS PATH', catsPath);
  await fs.mkdirp(catsPath);
  const catImagePath = path.resolve(__dirname, catsPath, `${catId}.png`);

  const [_, base64Data] = image.split(',');
  !(await fs.pathExists(catImagePath)) &&
    (await fs.writeFile(catImagePath, base64Data, 'base64'));
  const { cats } = await request(ENDPOINT_MOONCAT_PROD, catByIdQuery);

  return {
    props: {
      cat: cats[0] || {},
      catImage: `${origin}/cats/${catId}.png`,
    },
  };
};

export default memo(ShowCatById);
