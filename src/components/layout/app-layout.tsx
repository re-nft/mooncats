import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Layout from "./layout";
import MyCats from "../cat/my-cats";
import AllCats from "../cat/all-cats";
import ShowCatById from "../cat/show-cat-by-id";
import OfferedCats from "../cat/offered-cats";
import { TransactionNotifier } from "../ui/transaction-notifier";

const OFFSET_TOP = 180;
const App: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  const updateHeaderPosition = () => {
    setScrollY(window.pageYOffset);
  };

  useEffect(() => {
    function watchScroll() {
      window.addEventListener("scroll", updateHeaderPosition);
    }
    watchScroll();
    return () => {
      window.removeEventListener("scroll", updateHeaderPosition);
    };
  });

  return (
    <Layout>
      <Router>
        {/* MENU */}
        <div
          className={`content-wrapper mb-l ${
            scrollY > OFFSET_TOP ? "fixed-position" : ""
          }`}
        >
          <div className="menu">
            <NavLink
              className="menu__item"
              to="/"
              isActive={(_, location) => {
                if (location.pathname === "/") return true;
                return false;
              }}
            >
              All Cats
            </NavLink>
            <NavLink
              className="menu__item"
              to="/offered"
              isActive={(_, location) => {
                if (location.pathname === "/offered") return true;
                return false;
              }}
            >
              Offered
            </NavLink>
            <NavLink
              className="menu__item"
              to="/my-cats"
              isActive={(_, location) => {
                if (location.pathname === "/my-cats") return true;
                return false;
              }}
            >
              My cats
            </NavLink>
            <NavLink className="menu__item" to="/cat/default">
              Show cat by id
            </NavLink>
          </div>
        </div>
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
            <Route path="/cat/:catId">
              <ShowCatById />
            </Route>
          </Switch>
        </div>
        {/* FOOTER */}
      </Router>
      <div className="content-wrapper rarity-info">
        <p>
          rarity information taken from&nbsp;&nbsp;
          <a
            href="https://rarity.studio/cats.html"
            target="_blank"
            rel="noreferrer"
          >
            https://rarity.studio/cats.html
          </a>
        </p>
      </div>
      <div className="content-wrapper footer-content">
        <div className="copy">2021 ReNFT</div>
      </div>
      <TransactionNotifier />
    </Layout>
  );
};

export default App;
