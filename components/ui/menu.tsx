import NextLink from 'next/link';

const Menu: React.FC = () => {
  return (
    <div className="content-wrapper mb-l">
      <div className="menu">
        <NextLink href="/">
          <a className="menu__item">All Cats</a>
        </NextLink>
        <NextLink href="/offered">
          <a className="menu__item">Offered</a>
        </NextLink>
        <NextLink href="/my-cats">
          <a className="menu__item">My cats</a>
        </NextLink>
        <NextLink href="/my-requests">
          <a className="menu__item">My requests</a>
        </NextLink>
        <NextLink href="/cat/default">
          <a className="menu__item">Show cat by id</a>
        </NextLink>
      </div>
    </div>
  );
};

export default Menu;
