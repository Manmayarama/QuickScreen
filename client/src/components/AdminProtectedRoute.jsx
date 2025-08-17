import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import Loading from './Loading'; // Optional: Use a loading component

const AdminProtectedRoute = () => {
    const { isSignedIn, isLoaded, user } = useUser();

    if (!isLoaded) {
        // Show a loading indicator while Clerk is checking the session.
        return <Loading />;
    }

    // If the user is signed in and their role is 'admin', allow access.
    if (isSignedIn && user?.publicMetadata?.role === 'admin') {
        return <Outlet />; // This renders the nested admin routes.
    }

    // If not an admin, redirect them to the home page.
    return <Navigate to="/" />;
};

export default AdminProtectedRoute;