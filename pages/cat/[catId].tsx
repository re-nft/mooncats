import { useRouter } from 'next/router';

const CatById = () => {
  const { query } = useRouter();
  return <h1>Hi there</h1>;
};

export default CatById;
