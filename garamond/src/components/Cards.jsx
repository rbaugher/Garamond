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
                            src="images/wood working.jpg"
                            text="Learning new crafts!"
                            label="Hobbies"
                            path="/hobbies"
                        />
                    </ul>
                    <ul className="cards__items">
                        <CardItem 
                            src="images/hiker.jpg"
                            text="Exploring the world one step at a time!"
                            label="Hiking"
                            path="/outdoors"
                        />
                        
                        <CardItem 
                            src="images/games.jpg"
                            text="Games are Life"
                            label="Games"
                            path="/game"
                        />
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Cards;