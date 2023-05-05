import React, { useState, useEffect } from "react";
import classNames from "classnames";

export default function LoadingOverlay({ content, show = false }) {
  const [isHidden, setIsHidden] = useState(show);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const onTransitionEnd = () => {
    if (fadeIn) {
      setIsHidden(false);
    } else {
      setIsHidden(true);
    }
  };

  const playFadeOutAnimation = () => {
    setIsHidden(false);
    setFadeOut(true);
    setFadeIn(false);
  };

  const playFadeInAnimation = () => {
    setIsHidden(false);
    setFadeOut(false);
    setFadeIn(true);
  };

  useEffect(() => {
    if (show) {
      playFadeInAnimation();
    } else {
      setIsHidden(true);
      playFadeOutAnimation();
    }
  }, [show]);

  return (
    <div
      className={classNames(
        "transition-opacity fixed top-0 left-0 h-screen w-screen bg-slate-900/80 z-50 flex flex-col align-middle justify-center basis-0",
        { hidden: !show }
        //{ "opacity-0": fadeOut },
        //{ "opacity-100": fadeIn }
      )}
      style={{
        backdropFilter: "blur(5px)",
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="m-auto">
        <svg
          className="mx-auto animate-spin h-10 w-10 text-orange-400 drop-shadow"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>

        <div className="mx-auto mt-5">
          <div
            className="text-show text-lg"
            style={{ textShadow: "0 0 3px rgb(0 0 0 / 48%)" }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
