import '../../App.css';
import Carousel from '../Carousel';
import Cards from '../Cards';
import React from 'react';
import Footer from '../Footer';

function Home() {
    return (
        <>
            <Carousel />
            <Cards />
            <Footer />
        </>
    );
}

export default Home;