import datetime
import logging
import os
import sys
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename


# Add for relative imports
sys.path.insert(1, os.path.join(sys.path[0], '..'))

from shared.blob import download_blob_to_string, upload_audio_file_to_blob, get_blob_sas
from shared.appsettings import (AUDIO_FILE_UPLOAD_CONTAINER,
                                OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER,
                                TRANSCRIPTION_FILE_UPLOAD_CONTAINER)


ALLOWED_EXTENSIONS = {'mp3', 'wav', 'oga'}


def is_file_allowed(filename, allowed_extensions=ALLOWED_EXTENSIONS):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def hello_world():
    print(get_blob_sas(TRANSCRIPTION_FILE_UPLOAD_CONTAINER, "file.abc"))
    return 'Hi! Current time is ' + str(datetime.datetime.now())


@app.route('/details', methods=['GET'])
def get_filedetails():
    filename = request.args.get('filename')
    transcription = None
    openai = None

    try:
        transcription = download_blob_to_string(
            f"{TRANSCRIPTION_FILE_UPLOAD_CONTAINER}/{filename}.txt")
    except Exception as e:
        pass

    try:
        openai_results = {
            'synopsis': None,
            'taglines': None,
            'seo-keywords': None,
            'chinese': None,
            'german': None,
            'portuguese': None,
            'spanish': None,
        }
        for key in openai_results:
            openai_results[key] = download_blob_to_string(
                f"{OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER}/{filename}.txt-{key}.txt")

        openai = openai_results
    except Exception as e:
        print(e)
        pass

    return jsonify(filename=filename, transcription=transcription, openai=openai)


@app.route('/upload-to-blob-directly/<filename>', methods=['POST'])
def upload_via_sas_to_blob(filename):
    oldfilename = filename
    extension = filename.rsplit('.', 1)[1]
    filename = str(uuid.uuid4()) + '.' + extension
    return jsonify({
        'sasToken': get_blob_sas(AUDIO_FILE_UPLOAD_CONTAINER, filename),
        'containerName': AUDIO_FILE_UPLOAD_CONTAINER,
        'newFileName': filename
    })


@app.route('/upload', methods=['POST'])
def upload_file():
    logging.info("upload_file() : start")

    if 'file' not in request.files:
        raise Exception("File not specified")
    file = request.files['file']

    if file.filename == '':
        raise Exception('No selected file')

    if not file or (file and not is_file_allowed(file.filename)):
        raise Exception(
            f"Invalid file. Only {', '.join(ALLOWED_EXTENSIONS)} allowed")

    # Rename the file
    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[1]
    filename = str(uuid.uuid4()) + '.' + extension

    # Upload to Blob
    try:
        upload_audio_file_to_blob(filename, file)
    except Exception as e:
        logging.error(str(e))
        raise Exception(e)

    logging.info("upload_file() : finished")

    return filename


if __name__ == '__main__':
    app.run()
