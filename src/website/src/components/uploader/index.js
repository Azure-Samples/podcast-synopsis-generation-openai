import React, { useCallback } from "react";
import classNames from "classnames";
import { useDropzone } from "react-dropzone";
import UploadIllustrationSvg from "../../images/undraw_happy_music_g6wc.svg";
import "./style.css";

const DEFAULT_ACCEPT = {
  "audio/*": [".aac", ".mp3", ".ogg", ".oga", ".wav", ".weba", ".3gp"],
};

function UploadIllustration({ isActive, isReject }) {
  return (
    <div
      className={classNames(
        "shadow-md transition-all duration-200 rounded-full border relative border-gray-400 border-dashed inline-block aspect-square bg-slate-300/50  hover:bg-lime-600/80 hover:scale-105 cursor-pointer",
        { "bg-lime-600/80": isActive },
        { "bg-red-600/80": isReject }
      )}
      style={{
        height: 475,
      }}
    >
      <div className="text-center items-center absolute top-10 w-full">
        <svg
          className="w-10 h-10 mb-3 mx-auto text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <p className="mb-2 text-sm text-gray-700">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-700 opacity-50">
          MP3, WAV or OGG (MAX. 25mb)
        </p>
      </div>
      <img src={UploadIllustrationSvg} className="" />
      {/* <div className="muzieknootjes opacity-30 -mt-48">
            <div className="noot-1">
                &#9835; &#9833;
            </div>
            <div className="noot-2">
                &#9833;
            </div>
            <div className="noot-3">
                &#9839; &#9834;
            </div>
            <div className="noot-4">
                &#9834;
            </div>
        </div> */}
    </div>
  );
}

export default function Uploader({
  accept = DEFAULT_ACCEPT,
  maxSize,
  onDrop,
  className,
}) {
  const onDropCallback = useCallback(
    (acceptedFiles) => {
      if (onDrop) {
        onDrop(acceptedFiles);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: onDropCallback,
      accept,
      maxSize,
    });

  return (
    <div className="">
      <div {...getRootProps({ className: className })}>
        <input {...getInputProps()} />
        <UploadIllustration isActive={isDragActive} isReject={isDragReject} />
      </div>
    </div>
  );
}
