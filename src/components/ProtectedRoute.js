
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkTokenValidity } from '../utils/auth'; // Adjust path as per your project structure

const ProtectedRoute = () => {
    const [isValidated, setIsValidated] = useState(false);
    const [loading, setLoading] = useState(true); // Track loading state

    useEffect(() => {
        const validateToken = async () => {
            try {
                const isValid = await checkTokenValidity();
                console.log('Token validity:', isValid); // Log validity for debugging
                setIsValidated(isValid);
            } catch (error) {
                console.error('Error validating token:', error);
                setIsValidated(false); // Set validation to false in case of error
            } finally {
                setLoading(false); // Set loading to false after validation attempt
            }
        };

        validateToken();
    }, []); // Run only once on component mount

    // Render based on token validity or loading state
    if (loading) {
        return <div>Loading...</div>; // Optional: Show loading indicator while validating token
    }

    return isValidated ? (
        <Outlet />
    ) : (
        <Navigate to="/login" />
    );
};

export default ProtectedRoute;
