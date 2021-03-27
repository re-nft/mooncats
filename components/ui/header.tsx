import { useContext } from 'react';
import { CurrentAddressContext } from '../../hardhat/SymfoniContext';
import { short } from '../../utils';

const Header = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  return (
    <div className="content-wrapper mb-l">
      <div className="header">
        <div className="header__logo"></div>
        <div className="soc">
          <a
            href="https://discord.gg/ka2u9n5sWs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="discord"></span>
          </a>
          <a
            href="https://twitter.com/renftlabs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="twitter"></span>
          </a>
        </div>
        <div className="header__user">{short(currentAddress)}</div>
      </div>
    </div>
  );
};

export default Header;
