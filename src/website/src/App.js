import React, { useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Footer from "./components/footer";
import Header from "./components/header";
import Uploader from "./components/uploader";
import { uploadFileToBlobDirectly, checkAllPendingFiles } from "./core/api";
import Result from "./components/result";
import AudioFileStore from "./core/store";
import { observer } from "mobx-react-lite";

const ResultObserver = observer((store) => {
  return <Result items={store.store.files} />;
});

export default function App() {
  const fullScreenHandle = useFullScreenHandle();

  // poll for pending files
  useEffect(() => {
    const interval = setInterval(() => {
      checkAllPendingFiles();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const onFileDrop = (files) => {
    if (!files || files.length == 0) {
      return;
    }
    const file = files[0];
    //uploadFile(file);
    uploadFileToBlobDirectly(file);
  };

  return (
    <FullScreen handle={fullScreenHandle}>
      <div className="min-h-screen text-slate-900 bg-slate-50">
        <div className="flex flex-col h-screen justify-between">
          <header className="px-5 sm:px-6 md:px-10 pt-10 lg:pt-10">
            <Header fullScreenHandle={fullScreenHandle} />
          </header>

          <main className="px-5 sm:px-6 md:px-10 h-screen ">
            <h1 className="text-3xl lg:text-4xl 2xl:text-5xl font-extrabold text-slate-600 mt-4 lg:mt-4">
              PodAbstracts with
              <br />
              Azure Cognitive Services
              <br />
              and OpenAI
            </h1>
            <div className="flex flex-row space-x-16 h-4/5 -mt-16">
              <div className="sm:basis-full lg:basis-1/3">
                <div className="flex h-full">
                  <div className="m-auto">
                    <div className="h-20 block w-1"></div>
                    <Uploader onDrop={onFileDrop} />
                  </div>
                </div>
              </div>
              <div className="sm:basis-full lg:basis-2/3 -mt-44">
                <ResultObserver store={AudioFileStore} />
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 px-5 sm:px-6 md:px-8 pb-4 lg:pb-6 pt-3">
            <Footer />
          </footer>
        </div>
      </div>
    </FullScreen>
  );
}
