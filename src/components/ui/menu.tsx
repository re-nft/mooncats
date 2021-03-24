import React from "react";
import { NavLink } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <div className="content-wrapper mb-l">
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
        <NavLink
          className="menu__item"
          to="/my-requests"
          isActive={(_, location) => {
            if (location.pathname === "/my-requests") return true;
            return false;
          }}
        >
          My Requests
        </NavLink>
        <NavLink className="menu__item" to="/cat/default">
          Show cat by id
        </NavLink>
      </div>
    </div>
  );
};

export default React.memo(Menu);
