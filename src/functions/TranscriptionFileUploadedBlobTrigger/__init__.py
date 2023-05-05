import os
import sys
import logging
import os.path
import azure.functions as func

# Add for relative imports
sys.path.insert(1, os.path.join(sys.path[0], '..'))

from shared.appsettings import OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER
from shared.blob import upload_string_data_to_blob, get_container_and_blob_path, download_blob_to_string
from shared.openai import generate_synopsis, generate_taglines, generate_seokeywords, generate_chinese, generate_german, generate_portuguese, generate_spanish


def main(myblob: func.InputStream):
    logging.info(f"Python blob trigger function processed blob \n"
                 f"Name: {myblob.name}\n"
                 f"Blob Size: {myblob.length} bytes")

    try:
        _, _, filename = get_container_and_blob_path(myblob.name)
        transcription = download_blob_to_string(myblob.name)
        synopsis = generate_synopsis(transcription)
        taglines = generate_taglines(synopsis)
        keywords = generate_seokeywords(transcription)
        chinese = generate_chinese(synopsis)
        german = generate_german(synopsis)
        portuguese = generate_portuguese(synopsis)
        spanish = generate_spanish(synopsis)
        upload_string_data_to_blob(
            synopsis, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-synopsis.txt")
        upload_string_data_to_blob(
            taglines, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-taglines.txt")
        upload_string_data_to_blob(
            keywords, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-seo-keywords.txt")
        upload_string_data_to_blob(
            chinese, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-chinese.txt")
        upload_string_data_to_blob(
            german, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-german.txt")
        upload_string_data_to_blob(
            portuguese, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-portuguese.txt")
        upload_string_data_to_blob(
            spanish, OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER, f"{filename}-spanish.txt")
    except Exception as e:
        logging.error(str(e))
        raise e

    logging.info("done")
