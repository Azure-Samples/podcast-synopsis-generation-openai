import os
import sys
import logging
import os.path
from os import listdir
from os.path import isfile, join
import azure.functions as func
import shutil

# Add for relative imports
sys.path.insert(1, os.path.join(sys.path[0], '..'))

from shared.appsettings import TRANSCRIPTION_FILE_UPLOAD_CONTAINER
from shared.speech_service import speech_recognize_continuous_from_file
from shared.blob import download_blob_to_temp, upload_string_data_to_blob, get_container_and_blob_path
from shared.audioutils import convert_mp3_to_wav, split_audio_file_into_chunks


def get_file_extension(filename):
    return os.path.splitext(filename)[1][1:].strip().lower()


def main(myblob: func.InputStream):
    logging.info(f"Python blob trigger function processed blob \n"
                 f"Name: {myblob.name}\n"
                 f"Blob Size: {myblob.length} bytes")

    # For some reason, data does not come in InputStream. :( Download from Blob Storage
    # is also the recommended approach.
    audio_file_path = download_blob_to_temp(myblob.name)
    logging.info(f"Successfully downloaded temp file. fname={audio_file_path}")

    # Convert .mp3 to .wav
    if get_file_extension(audio_file_path) == 'mp3':
        logging.info(f"Converting MP3 file to WAV {audio_file_path}")
        audio_file_path = convert_mp3_to_wav(audio_file_path)
        logging.info(f"New audio_file_path={audio_file_path}")

    try:
        transcription = ''

        # Split the audio file into chunks
        audio_file_chunks_dir = split_audio_file_into_chunks(audio_file_path)

        # Find all the chunks and sort them in numerical order
        onlyfiles = [f for f in listdir(
            audio_file_chunks_dir) if isfile(join(audio_file_chunks_dir, f))]
        # sort the list in order
        onlyfiles.sort(key=lambda x: int(x.split('.')[0]))

        logging.info(f"onlyfiles={onlyfiles}")

        # For each chunk, run through speech service
        for i in range(len(onlyfiles)):
            logging.info(f"Starting to process chunk {i + 1}/{len(onlyfiles)}")
            fp = f"{audio_file_chunks_dir}/{onlyfiles[i]}"
            transcription += speech_recognize_continuous_from_file(fp)
            logging.info(f"Finished processing chunk {i + 1}/{len(onlyfiles)}")

        # Upload the final transcription results to blob
        _, _, filename = get_container_and_blob_path(myblob.name)
        upload_string_data_to_blob(
            transcription, TRANSCRIPTION_FILE_UPLOAD_CONTAINER, f"{filename}.txt")
        logging.info(f"Uploaded transcription to blob")

        # Clean up
        # Remove chunks directory
        shutil.rmtree(audio_file_chunks_dir)
    except Exception as e:
        logging.error(str(e))

    try:
        os.remove(audio_file_path)
    except:
        pass

    logging.info("done")
