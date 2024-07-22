import React, { useEffect, useState } from 'react';
import { Navigate, Outlet  } from 'react-router-dom';
import {userService} from "../Services/authentication.service";
const ProtectedRoute = () => {
    const [isValidated, setIsValidated] = useState(null);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const isValid = await userService.loggedIn();
                console.log(isValid);
                setIsValidated(isValid);
            } catch (error) {
                console.error('Error validating token:', error);
                setIsValidated(false);
            }
        };

        validateToken();
    }, []);

    if (isValidated === null) {
        return <div>Loading...</div>;
    }


    return isValidated ? (
        <Outlet />
    ) : (
        <Navigate to="/login" />
    );
};

export default ProtectedRoute;

