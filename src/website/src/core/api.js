import axios from "axios";
import { API_SERVER_URL } from "./config";
import AudioFileStore from "./store";
import { BlobServiceClient } from "@azure/storage-blob";

export const http = axios.create({
  baseURL: API_SERVER_URL,
  headers: {
    "Content-type": "application/json",
  },
});

export function getFileDetails(filename) {
  return http.get(`/details?filename=${filename}`);
}

const pendingApiCallsInProgress = new Set();
export function checkAllPendingFiles() {
  const pendingFileNames = AudioFileStore.getPendingFiles();
  pendingFileNames.forEach((fileName) => {
    if (!fileName || pendingApiCallsInProgress.has(fileName)) {
      return;
    }
    pendingApiCallsInProgress.add(fileName);
    getFileDetails(fileName)
      .then((response) => {
        const data = response.data;
        if (!data || data.transcription === null) {
          AudioFileStore.updateStatusToTranscribe(fileName);
          return;
        }
        if (data.openai === null) {
          AudioFileStore.updateStatusToOpenAi(fileName);
          return;
        }
        AudioFileStore.updateStatusToDone(fileName, data);
      })
      .finally(() => {
        pendingApiCallsInProgress.delete(fileName);
      });
  });
}

export function uploadFile(file, onUploadProgress = null) {
  let formData = new FormData();
  formData.append("file", file);

  AudioFileStore.startTracking(file.name);
  AudioFileStore.updateUploadFileProgress(file.name, 0, "Uploading");

  return http
    .post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: function (evt) {
        const percentComplete = (evt.loaded / evt.total) * 100;
        AudioFileStore.updateUploadFileProgress(file.name, percentComplete);
        onUploadProgress && onUploadProgress(evt);
      },
    })
    .catch((err) => {
      AudioFileStore.updateUploadFailure(file.name, err.response.data);
    })
    .then((response) => {
      if (response && response.data) {
        const newFilename = response.data;
        AudioFileStore.setUploadFileComplete(file.name, newFilename);
      }
      return response;
    });
}

function getSasToken(filename) {
  return http.post(`/upload-to-blob-directly/${filename}`);
}

export function uploadFileToBlobDirectly(file) {
  AudioFileStore.startTracking(file.name);
  AudioFileStore.updateUploadFileProgress(file.name, 0, "Uploading");

  getSasToken(file.name).then((res) => {
    const blobSasUrl = res.data["sasToken"];
    const newFileName = res.data["newFileName"];
    const containerName = res.data["containerName"];
    const blobServiceClient = new BlobServiceClient(blobSasUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
    blockBlobClient
      .uploadBrowserData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
        onProgress: (progress) => {
          AudioFileStore.updateUploadFileProgress(
            file.name,
            (progress.loadedBytes / file.size) * 100
          );
        },
      })
      .then((r) => {
        AudioFileStore.setUploadFileComplete(file.name, newFileName);
      })
      .catch((err) => {
        AudioFileStore.updateUploadFailure(file.name, err.response.data);
      });
  });
}
