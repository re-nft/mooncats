import React, { useContext } from "react";
import { Switch, Route } from "react-router-dom";
import Menu from "../ui/menu";
import Layout from "./layout";
import MyCats from "../cat/my-cats";
import AllCats from "../cat/all-cats";
import ShowCatById from "../cat/show-cat-by-id";
import OfferedCats from "../cat/offered-cats";
import MyCatsRequests from "../cat/my-requests";
import { TransactionNotifier } from "../ui/transaction-notifier";
import Footer from "../ui/footer";
import GraphContext from "../../contexts/graph";
import Loader from "../ui/loader";

const App: React.FC = () => {
  const { isDataLoading } = useContext(GraphContext);

  if (!isDataLoading) {
    return (
      <div className="content center">
        <Loader />
      </div>
    );
  }

  return (
    <Layout>
      {/* MENU */}
      <Menu />
      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">
        <Switch>
          <Route exact path="/" component={AllCats} />
          <Route exact path="/offered" component={OfferedCats} />
          <Route exact path="/my-cats" component={MyCats} />
          <Route exact path="/my-requests" component={MyCatsRequests} />
          <Route path="/cat/:catId" component={ShowCatById} />
        </Switch>
      </div>
      {/* FOOTER */}
      <Footer />
      <TransactionNotifier />
    </Layout>
  );
};

export default React.memo(App);
