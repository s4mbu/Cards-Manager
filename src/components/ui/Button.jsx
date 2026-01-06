import React from 'react';

export const Button = ({ children, variant = '', className = '', ...props }) => {
    const variantClass = variant ? `btn-${variant}` : '';
    return (
        <button className={`btn ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};