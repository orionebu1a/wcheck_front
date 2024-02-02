import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const storedToken = localStorage.getItem('token');
    return storedToken ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;