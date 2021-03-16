import React, { useState, useCallback, useEffect } from "react";
import Layout from "./layout";
import MyCats from "../cat/my-cats";
import AllCats from "../cat/all-cats";
import ShowCatById from "../cat/show-cat-by-id";
import { TransactionNotifier } from "../ui/transaction-notifier";

enum Tabs {
  RENT,
  LEND,
  STATS,
  LEADER,
  GETNFT,
  HOW,
  DAI,
  All_CATS,
  MY_CATS,
  SHOW_CAT_BY_ID,
}

type TabProps = {
  setTab: (tab: Tabs) => void;
  isFocused: boolean;
  thisTab: Tabs;
  buttonName: string;
};

const Tab: React.FC<TabProps> = ({
  setTab,
  thisTab,
  isFocused,
  buttonName,
}) => {
  const handleClick = useCallback(() => {
    setTab(thisTab);
  }, [setTab, thisTab]);

  return (
    <button
      className={`menu__item ${isFocused ? "menu__item-active" : ""}`}
      onClick={handleClick}
    >
      {buttonName}
    </button>
  );
};

const OFFSET_TOP = 180;
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(Tabs.All_CATS);
  const [scrollY, setScrollY] = useState(0);

  const updateHeaderPosition = () => {
    setScrollY(window.pageYOffset);
  };

  useEffect(() => {
    const param = new URLSearchParams(window.location.search);
    if (param.get("catId")) {
      setActiveTab(Tabs.SHOW_CAT_BY_ID);
    }
  }, []);

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
      {/* MENU */}
      <div
        className={`content-wrapper mb-l ${
          scrollY > OFFSET_TOP ? "fixed-position" : ""
        }`}
      >
        <div className="menu">
          <Tab
            setTab={setActiveTab}
            isFocused={activeTab === Tabs.All_CATS}
            thisTab={Tabs.All_CATS}
            buttonName="All Cats"
          />
          <Tab
            setTab={setActiveTab}
            isFocused={activeTab === Tabs.MY_CATS}
            thisTab={Tabs.MY_CATS}
            buttonName="My Cats"
          />
          <Tab
            setTab={setActiveTab}
            isFocused={activeTab === Tabs.SHOW_CAT_BY_ID}
            thisTab={Tabs.SHOW_CAT_BY_ID}
            buttonName="Show Cat by Id"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">
        {activeTab === Tabs.MY_CATS && <MyCats />}
        {activeTab === Tabs.All_CATS && <AllCats />}
        {activeTab === Tabs.SHOW_CAT_BY_ID && <ShowCatById />}
      </div>
      {/* FOOTER */}
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
