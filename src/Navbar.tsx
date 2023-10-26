import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Navbar() {
    const { isAuthenticated, loginWithRedirect, logout, user, isLoading} = useAuth0();

   // if (isLoading) return <div>Loading...</div>

    return (
        <div className="navbar">
            <div>
                <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span>Natjecanja</span>
                </a>
            </div>
            {!isAuthenticated ? (
                <button className="btn btn-primary" onClick={(e) => {
                    e.preventDefault();
                    loginWithRedirect();
                }}>Log in</button>
            ) : (
                <div>
                    <div>{user?.email}</div>
                    <button className="btn btn-primary" onClick={(e) => {
                        e.preventDefault();
                        logout();
                    }}>Log out</button>
                </div>
            )}
        </div>
    );
}

export default Navbar;