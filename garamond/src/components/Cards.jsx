import React from "react";
import "./Cards.css";
import CardItem from "./CardItem";


function Cards() {
    return (
        <div className="cards">
            <h1>Bucket List Items for 2026!</h1>
            <div className="cards__container">
                <div className="cards__wrapper">
                    <ul className="cards__items">
                        <CardItem 
                            src="images/Rainier.jpg"
                            text="The first of 7 summits!"
                            label="Adventure"
                            path="/Summit_Adventure"
                        />
                        <CardItem 
                            src="images/shuttle_launch.jpg"
                            text="Travel through the Islands of Bali in a Private Cruise"
                            label="Luxury"
                            path="/services"
                        />
                    </ul>
                    <ul className="cards__items">
                        <CardItem 
                            src="images/hiker.jpg"
                            text="Explore the hidden waterfall deep inside the Amazon Jungle"
                            label="Adventure"
                            path="/services"
                        />
                        <CardItem 
                            src="images/heavens.jpg"
                            text="Travel through the Islands of Bali in a Private Cruise"
                            label="Luxury"
                            path="/services"
                        />
                        <CardItem 
                            src="images/Everest.jpg"
                            text="Travel through the Islands of Bali in a Private Cruise"
                            label="Luxury"
                            path="/services"
                        />
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Cards;