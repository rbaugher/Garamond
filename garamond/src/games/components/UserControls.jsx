import React, { useState } from 'react';
import Settings from "./Settings";
import Difficulty from "./subcomponents/difficultySlider";

function UserControls() {
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState(1); // 0: easy, 1: medium, 2: hard

  return (
    <>
      <Settings
        selected={selected}
        setSelected={setSelected}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <section className="UserControls">
        {selected === 'difficulty' && (
          <Difficulty level={difficulty} onChange={setDifficulty} />
        )}
      </section>
    </>
  );
}
export default UserControls;
