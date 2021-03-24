import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Menu from "../ui/menu";
import Layout from "./layout";
import MyCats from "../cat/my-cats";
import AllCats from "../cat/all-cats";
import ShowCatById from "../cat/show-cat-by-id";
import OfferedCats from "../cat/offered-cats";
import MyCatsRequests from "../cat/my-requests";
import { TransactionNotifier } from "../ui/transaction-notifier";
import Footer from "../ui/footer";

const App: React.FC = () => {
  return (
    <Layout>
      {/* MENU */}
      <Menu />
      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">
        <Switch>
          <Route exact path="/">
            <AllCats />
          </Route>
          <Route exact path="/offered">
            <OfferedCats />
          </Route>
          <Route exact path="/my-cats">
            <MyCats />
          </Route>
          <Route exact path="/my-requests">
            <MyCatsRequests />
          </Route>
          <Route path="/cat/:catId">
            <ShowCatById />
          </Route>
        </Switch>
      </div>
      {/* FOOTER */}
      <Footer />
      <TransactionNotifier />
    </Layout>
  );
};

export default App;
