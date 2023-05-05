import React from "react";
import IconExitScreen from "../../images/exit-full-screen-8.svg";
import IconFullScreen from "../../images/full-screen-38.svg";
import Logo from "./logo.svg";

export default function Header({ fullScreenHandle }) {
  return (
    <div className="mb-9">
      <div className="flex flex-row">
        <div className="basis-1/2">
          <a href="./" title="Microsoft">
            <img src={Logo} className="h-7 inline" title="Microsoft" />
          </a>
        </div>
        <div className="basis-1/2 text-right ">
          <button
            title={
              !fullScreenHandle.active ? "Enter fullscreen" : "Exit fullscreen"
            }
            className="float-right transition-all text-white p-2 -m-1 rounded-full hover:bg-gray-300 relative"
            onClick={() => {
              if (fullScreenHandle.active) {
                fullScreenHandle.exit();
              } else {
                fullScreenHandle.enter();
              }
            }}
          >
            <img
              src={!fullScreenHandle.active ? IconFullScreen : IconExitScreen}
              className="h-5"
            />
          </button>
          <a
            href="https://microsoft-my.sharepoint.com/:p:/p/katlee/EfZ6E5CbQeFBjwLU3h_r6kkBkxGZi97_WmbH2n8awivuoQ?e=GnOnHt"
            target="_blank"
            className="float-right transition-all text-gray-500 text-sm border px-3 py-1 mr-3 font-lato rounded-full hover:bg-gray-300 relative"
          >
            Slides
          </a>
        </div>
      </div>
    </div>
  );
}
