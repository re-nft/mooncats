import React from "react";

const Footer: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default React.memo(Footer);
