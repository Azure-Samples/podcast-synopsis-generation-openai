import React, { useState } from "react";
import ProgressBar from "../progressbar";
import { STATE } from "../../core/store";
import classNames from "classnames";
import CloseIconSvg from "../../images/close-icon.svg";
import DeleteIconSvg from "../../images/trash-icon.svg";
import AudioFileStore from "../../core/store";

function trim(str, ch) {
  let start = 0,
    end = str.length;

  while (start < end && str[start] === ch) ++start;

  while (end > start && str[end - 1] === ch) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

function removeNumbersFromBeginningOfString(str) {
  return str.replace(/^\d[.]*[\s]*/gm, "");
}

function removeQuotations(str) {
  return trim(str, '"');
}

function splitAndRemoveEmpty(str) {
  return str
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => !!s);
}

function formattedDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function splitString(n, str) {
  let arr = str?.split(" ");
  let result = [];
  let subStr = arr[0];
  for (let i = 1; i < arr.length; i++) {
    let word = arr[i];
    if (subStr.length + word.length + 1 <= n) {
      subStr = subStr + " " + word;
    } else {
      result.push(subStr);
      subStr = word;
    }
  }
  if (subStr.length) {
    result.push(subStr);
  }
  return result;
}

function DetailsView({ item, onHide }) {
  const [language, setLanguage] = useState("synopsis");
  const [hide, setHide] = useState(false);

  const openai = item.details && item.details.openai;
  if (!openai) {
    return null;
  }

  const hr = "\n\n---\n\n";
  const text = [
    "English\n",
    openai.synopsis.trim(),
    hr,
    "Chinese\n",
    openai.chinese.trim(),
    hr,
    "German\n",
    openai.german.trim(),
    hr,
    "Portuguese\n",
    openai.portuguese.trim(),
    hr,
    "Transription\n",
    item.details.transcription,
  ];

  const openTextLink = () => {
    var w = window.open("Text", "_blank");
    w.document.write(
      "<code style='width:600px; display: block; white-space: pre-line'>" +
        text.join("\n") +
        "</code>"
    );
  };

  return (
    <div
      className={classNames(
        "fixed top-0 left-0 z-50 bg-slate-200 h-screen w-screen overflow-auto block animate__animated animate__backInDown",
        {
          animate__backOutUp: hide,
          "overflow-hidden": hide,
        }
      )}
      onAnimationEnd={() => {
        if (hide) onHide && onHide();
      }}
    >
      <span className=" hidden overflow-hidden" />
      <img
        src={CloseIconSvg}
        className="h-16 w-16 top-7 right-7 fixed cursor-pointer hover:opacity-50 transition-all"
        title="Close"
        onClick={() => setHide(true)}
      />
      <div className="mx-auto mt-20 px-4 sm:px-6 md:max-w-3xl md:px-4 lg:px-0 pb-14">
        <div className="flex flex-col items-start">
          <h2 className="mt-5 text-4xl font-bold text-slate-900 tracking-tight">
            {removeQuotations(
              removeNumbersFromBeginningOfString(
                splitAndRemoveEmpty(openai.taglines)[0]
              )
            )}
          </h2>
          <span className="order-first font-mono text-sm leading-7 text-slate-500">
            {formattedDate(new Date(item.startTimestamp))} {" // "}
            {item.originalFileName}
          </span>

          <div className="relative">
            <div className="absolute -left-40 top-5 text-right">
              <h5 className="mb-8 lg:mb-3 font-semibold text-slate-700 dark:text-slate-200">
                Translate me
              </h5>
              <ul className="text-sm cursor-pointer ext-slate-600 ">
                <li className="text-red-600"></li>
                <li
                  className={classNames("mb-1", {
                    "text-red-600": language == "synopsis",
                  })}
                  onClick={() => setLanguage("synopsis")}
                >
                  English
                </li>
                <li
                  className={classNames(" mb-1", {
                    "text-red-600": language == "chinese",
                  })}
                  onClick={() => setLanguage("chinese")}
                >
                  Chinese
                </li>
                <li
                  className={classNames("mb-1", {
                    "text-red-600": language == "german",
                  })}
                  onClick={() => setLanguage("german")}
                >
                  German
                </li>
                <li
                  className={classNames("mb-1", {
                    "text-red-600": language == "portuguese",
                  })}
                  onClick={() => setLanguage("portuguese")}
                >
                  Portuguese
                </li>
                <li className="mt-5">
                  <span
                    onClick={openTextLink}
                    className="transition-all rounded-full bg-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-slate-700 p-2 px-4 text-slate-300 hover:text-white text-sm font-lato"
                  >
                    Download as TXT
                  </span>
                </li>
              </ul>
            </div>
            {item.state == STATE.DONE && (
              <div className="prose lg:prose-xl mt-5">
                <p className="text-lg leading-8 text-slate-700">
                  {openai[language]}
                </p>

                <hr className="my-12 border-gray-400" />

                <div className="prose prose-base">
                  <h3
                    className="font-normal font-lato"
                    style={{ fontSize: 18 }}
                  >
                    <span className="text-slate-400 -ml-5 text-sm">
                      &#9724;
                    </span>{" "}
                    Alternative titles
                  </h3>
                  <ul className="list-style-arrow">
                    {splitAndRemoveEmpty(openai["taglines"]).map(
                      (keyword, index) => (
                        <li key={index}>
                          {removeQuotations(
                            removeNumbersFromBeginningOfString(keyword)
                          )}
                        </li>
                      )
                    )}
                  </ul>

                  <div className="mt-10" />

                  <h3
                    className="font-normal font-lato"
                    style={{ fontSize: 18 }}
                  >
                    <span className="text-slate-400 -ml-5 text-sm">
                      &#9724;
                    </span>{" "}
                    Search engine optimized (SEO) keywords
                  </h3>
                  <ul className="list-style-arrow">
                    {splitAndRemoveEmpty(openai["seo-keywords"]).map(
                      (keyword, index) => (
                        <li key={index}>
                          {removeNumbersFromBeginningOfString(keyword)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRenderer({ item }) {
  const [showDetails, setShowDetails] = useState(false);
  const openai = item.details && item.details.openai;
  return (
    <article className="py-10 sm:py-12">
      {showDetails && (
        <DetailsView item={item} onHide={() => setShowDetails(false)} />
      )}
      <div className="lg:px-8">
        <div className="max-w-3xl 2xl:max-w-4xl">
          <div className="mx-auto px-4 sm:px-6 md:max-w-1xl md:px-4 lg:px-0">
            {item.state != STATE.UPLOAD && (
              <div className="relative">
                <img
                  src={DeleteIconSvg}
                  className="transition-all h-5 opacity-40 hover:opacity-100 cursor-pointer absolute right-0 top-4"
                  title="Remove"
                  onClick={() => {
                    AudioFileStore.stopTracking(item.uniqueFileName);
                  }}
                />
              </div>
            )}
            <div className="flex flex-col items-start">
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {item.originalFileName}
              </h2>
              <span className="order-first font-mono text-sm leading-7 text-slate-500">
                {formattedDate(new Date(item.startTimestamp))}
              </span>
              {item.state != STATE.DONE && (
                <div className="mt-6 w-full">
                  <ProgressBar
                    progress={item.progress}
                    label={item.currentStatus}
                  />
                </div>
              )}
              {item.state == STATE.DONE && (
                <>
                  <p className="mt-1 text-base leading-7 text-slate-700">
                    {removeQuotations(openai.synopsis)}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="flex items-center text-sm font-bold leading-6 text-rose-500 hover:text-rose-700 active:text-rose-900 cursor-pointer">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 10 10"
                        fill="none"
                        className="h-2.5 w-2.5 fill-current"
                      >
                        <path d="M8.25 4.567a.5.5 0 0 1 0 .866l-7.5 4.33A.5.5 0 0 1 0 9.33V.67A.5.5 0 0 1 .75.237l7.5 4.33Z"></path>
                      </svg>
                      <span className="ml-3" aria-hidden="true">
                        Listen
                      </span>
                    </span>
                    <span className="text-sm font-bold text-slate-400">/</span>
                    <span
                      className="flex items-center text-sm font-bold leading-6 text-rose-500 hover:text-rose-700 active:text-rose-900 cursor-pointer"
                      onClick={() => setShowDetails(true)}
                    >
                      View details
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Result({ items }) {
  return (
    <>
      {items.map((item, index) => (
        <ItemRenderer key={index + item.originalFileName} item={item} />
      ))}
    </>
  );
}
