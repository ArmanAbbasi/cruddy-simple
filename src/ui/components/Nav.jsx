import React from 'react';

const Nav = ({ title, endpoint }) => {
  return (
    <nav className="navbar navbar-inverse">
      <div className="container">
        <div className="navbar-header">
          <h2>{title}</h2>
        </div>
        {endpoint && <a className="btn btn-default navbar-right" href={endpoint}>New</a>}
      </div>
    </nav>
  )
};

export default Nav;