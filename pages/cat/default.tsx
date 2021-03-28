import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const SearchCatById: React.FC<{ buttonText: string }> = ({
  buttonText = 'Show me my cat',
}) => {
  const router = useRouter();
  const [catId, setCatId] = useState<string>('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCatId(event.target.value.trim() || '');
  };

  const searchCat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    catId && router.push(`/cat/${catId}`);
  };

  const isDefault = useMemo(() => router.asPath.split(/\//g)[2] === 'default', [
    router.asPath,
  ]);

  return (
    <div className="content center">
      {isDefault && (
        <Head>
          <title>reNFT - Search Cat by ID</title>
        </Head>
      )}
      <form className="cat-form" onSubmit={searchCat}>
        <input
          name="cat-id"
          className="cat-input"
          placeholder="CAT ID"
          value={catId}
          onChange={handleChange}
        />
        <input
          disabled={!catId.length}
          type="submit"
          className="nft__button"
          value={buttonText}
        />
      </form>
    </div>
  );
};

export default SearchCatById;
