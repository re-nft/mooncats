export type CatInfo = {
  catId: string;
  color: string;
  palette: string;
  pattern: number;
  statisticalRank: string;
  traitRarityRank: string;
};

export const fetchRarityData = async (): Promise<Record<string, CatInfo>> => {
  const response = await fetch("./data.json");
  const data = await response.text();
  const resolvedData = JSON.parse(data).reduce(
    (memo: Record<string, CatInfo>, item: CatInfo) => {
      memo[item.catId] = item;
      return memo;
    }
  );
  return resolvedData;
};
