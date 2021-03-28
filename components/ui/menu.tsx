import NextLink from 'next/link';
import { useRouter } from 'next/router';

const routes = [
  {
    pathname: '/',
    routeName: 'all-cats',
    value: 'All Cats',
  },
  {
    pathname: '/offered',
    routeName: 'offered',
    value: 'Offered',
  },
  {
    pathname: '/my-cats',
    routeName: 'my-cats',
    value: 'My Cats',
  },
  {
    pathname: '/my-requests',
    routeName: 'my-requests',
    value: 'My requests',
  },
  {
    pathname: '/cat/default',
    routeName: 'default-cat',
    value: 'show cat by id',
  },
];

const Menu: React.FC = () => {
  const router = useRouter();
  return (
    <div className="content-wrapper mb-l">
      <div className="menu">
        {routes.map((r) => (
          <NextLink key={r.routeName} href={r.pathname}>
            <a
              title={r.routeName}
              className={`menu__item ${
                r.pathname === router.pathname ? 'active' : ''
              }`}
            >
              {r.value}
            </a>
          </NextLink>
        ))}
      </div>
    </div>
  );
};

export default Menu;
