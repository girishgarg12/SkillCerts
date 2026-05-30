import { useState } from "react";
import clsx from "clsx";

const Meteor = ({ index }) => {
  // useState initializer runs once and is not considered a render — safe for Math.random()
  const [left] = useState(() => Math.floor(Math.random() * (400 - -400) + -400) + "px");
  const [animationDelay] = useState(() => Math.random() * (0.8 - 0.2) + 0.2 + "s");
  const [animationDuration] = useState(() => Math.floor(Math.random() * (10 - 2) + 2) + "s");

  return (
    <span
      key={"meteor" + index}
      className={clsx(
        "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
        "pointer-events-none"
      )}
      style={{
        top: 0,
        left,
        animationDelay,
        animationDuration,
      }}
    ></span>
  );
};

export const Meteors = ({ number = 20 }) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <>
      {meteors.map((_el, idx) => (
        <Meteor key={"meteor" + idx} index={idx} />
      ))}
    </>
  );
};
