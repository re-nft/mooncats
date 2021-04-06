import { ethers } from 'ethers';

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = ethers.utils.parseEther('1');

export const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export const HOME_URL =
  typeof window !== 'undefined' ? window.location.origin : '';
export const FETCH_ALL_CATS_TAKE = 120;
export const FETCH_EVERY_OFFERS_TAKE = 120;
export const FETCH_ALL_OFFERS_TAKE = 720;
export const ENDPOINT_MOONCAT_PROD =
  'https://api.thegraph.com/subgraphs/name/re-nft/mooncat-rescue';

export const RENFT_SUBGRAPH_ID_SEPARATOR = '::';
