import React, { useState } from 'react';

const SubNavItems = () => {
    const [active, setActive] = useState(false);

    const handleToggle = () => {
        setActive(prev => !prev);
    };

    return (
        <>
        <div
            className={active ? 'NavBaritems' : 'change NavBaritems'}
            onClick={handleToggle}
        >
        </div>
        </>
    );
};

export default SubNavItems;