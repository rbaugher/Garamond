import React, { useState } from 'react';

const SubSettings = ({ active, setActive }) => {
    const handleToggle = () => {
        setActive(prev => !prev);
    };

    return (
        <>
            <div
                className={active ? 'menuicon change' : 'menuicon'}
                onClick={handleToggle}
            >
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
            </div>
        </>
    );
};

export default SubSettings;