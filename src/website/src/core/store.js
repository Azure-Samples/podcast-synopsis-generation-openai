import { makeAutoObservable, autorun, set, toJS } from "mobx";

export const STATE = {
  UPLOAD: "UPLOAD",
  UPLOAD_FAIL: "UPLOAD_FAIL",
  TRANSCRIBE: "TRANSCRIBE",
  OPENAI: "OPENAI",
  DONE: "DONE",
};

// Credits: https://gist.github.com/du5rte/dbd18a1a6dc72d866737a5e95ca1e663?permalink_comment_id=3580822#gistcomment-3580822
export function autoSave(_this, name) {
  const storedJson = localStorage.getItem(name);
  if (storedJson) {
    set(_this, JSON.parse(storedJson));
  }
  autorun(() => {
    const value = toJS(_this);
    localStorage.setItem(name, JSON.stringify(value));
  });
}

class AudioFileStore {
  _trackedFiles = [];

  constructor() {
    makeAutoObservable(this, {});
    autoSave(this, "audioStore");
  }

  get files() {
    return toJS(this._trackedFiles);
  }

  startTracking(originalFileName) {
    const obj = {
      originalFileName: originalFileName,
      uniqueFileName: null,
      progress: 0,
      currentStatus: "",
      state: STATE.UPLOAD,
      startTimestamp: Date.now(),
      endTimestamp: 0,
      details: null,
    };
    this._trackedFiles.unshift(obj);
  }

  updateUploadFileProgress(originalFileName, uploadProgress) {
    let trackedItem = this._findFirstByOriginalFileName(originalFileName);
    if (trackedItem) {
      trackedItem.progress = (uploadProgress * 0.6).toFixed(0); // 70 % is uploading, another 15% is transcribing, last 15% is openai
      trackedItem.currentStatus = "Uploading file...";
      trackedItem.state = STATE.UPLOAD;
    }
  }

  setUploadFileComplete(originalFileName, newUniqueFileName) {
    let trackedItem = this._findFirstByOriginalFileName(originalFileName);
    if (trackedItem) {
      trackedItem.uniqueFileName = newUniqueFileName;
      trackedItem.state = STATE.TRANSCRIBE;
    }
    this.updateStatusToTranscribe(newUniqueFileName);
  }

  updateUploadFailure(originalFileName, status) {
    let trackedItem = this._findFirstByOriginalFileName(originalFileName);
    if (trackedItem) {
      trackedItem.state = STATE.UPLOAD_FAIL;
      trackedItem.currentStatus = status;
      trackedItem.progress = 0;
    }
  }

  getPendingFiles() {
    const pending = [];
    this._trackedFiles.forEach((file) => {
      if (
        file.state != STATE.DONE &&
        file.state != STATE.UPLOAD &&
        file.state != STATE.UPLOAD_FAIL
      ) {
        pending.push(file.uniqueFileName);
      }
    });
    return pending;
  }

  updateStatusToTranscribe(uniqueFileName) {
    const trackedItem = this._findFirstByUniqueFileName(uniqueFileName);
    if (trackedItem) {
      trackedItem.progress = 70; // 70 % is uploading, another 15% is transcribing, last 15% is openai
      trackedItem.currentStatus = "Transcribing...";
      trackedItem.state = STATE.TRANSCRIBE;
    }
  }

  updateStatusToOpenAi(uniqueFileName) {
    const trackedItem = this._findFirstByUniqueFileName(uniqueFileName);
    if (trackedItem) {
      trackedItem.progress = 85; // 70 % is uploading, another 15% is transcribing, last 15% is openai
      trackedItem.currentStatus = "Using OpenAI to generate insights...";
      trackedItem.state = STATE.OPENAI;
    }
  }

  updateStatusToDone(uniqueFileName, details) {
    const trackedItem = this._findFirstByUniqueFileName(uniqueFileName);
    if (trackedItem) {
      trackedItem.progress = 1; // 70 % is uploading, another 15% is transcribing, last 15% is openai
      trackedItem.currentStatus = "Done";
      trackedItem.state = STATE.DONE;
      trackedItem.endTimestamp = Date.now();
      trackedItem.details = details;
    }
  }

  stopTracking(uniqueFileName) {
    for (let i = 0; i < this._trackedFiles.length; i++) {
      if (this._trackedFiles[i].uniqueFileName == uniqueFileName) {
        this._trackedFiles.splice(i, 1);
        break;
      }
    }
  }

  _findFirstByOriginalFileName(originalFileName) {
    for (let i = 0; i < this._trackedFiles.length; i++) {
      if (this._trackedFiles[i].originalFileName == originalFileName) {
        return this._trackedFiles[i];
      }
    }
    return null;
  }

  _findFirstByUniqueFileName(uniqueFileName) {
    for (let i = 0; i < this._trackedFiles.length; i++) {
      if (this._trackedFiles[i].uniqueFileName == uniqueFileName) {
        return this._trackedFiles[i];
      }
    }
    return null;
  }
}

const instance = new AudioFileStore();

export default instance;
