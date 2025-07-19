// client/src/components/Footer.jsx
import React from 'react';
const Footer = () => {
  return (
    <footer className="bg-gradient-to-br  from-purple-100 to-indigo-100 text-center text-md border-none text-violet-400">
        © {new Date().getFullYear()} FixMate. All rights reserved.
    </footer>
  );
};

export default Footer;
