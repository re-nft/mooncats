import { FC } from 'react';
import Menu from './ui/menu';
import Footer from './ui/footer';
import Header from './ui/header';
import TransactionNotifier from './ui/transaction-notifier';

const Layout: FC = ({ children }) => {
  return (
    <div className="app">
      <div className="app__container">
        <div className="main">
          <Header />
          <Menu />
          <div className="content-wrapper main-content mb-l">{children}</div>
          <Footer />
          <TransactionNotifier />
        </div>
      </div>
    </div>
  );
};

export default Layout;
