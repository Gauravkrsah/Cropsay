
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cropsay-dark p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cropsay-green mb-4">404</h1>
        <p className="text-xl text-cropsay-lightText mb-8">Oops! Page not found</p>
        <p className="text-cropsay-grayText mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="primary-button inline-flex">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
