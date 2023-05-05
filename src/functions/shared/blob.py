import os
import tempfile
from datetime import datetime, timedelta
from pathlib import Path

from azure.storage.blob import (BlobClient, BlobSasPermissions,
                                BlobServiceClient, generate_blob_sas)

from . import appsettings


def get_file_extension(filename):
    return os.path.splitext(filename)[1][1:].strip()


def get_container_and_blob_path(path):
    path = os.path.normpath(path)
    parts = path.split(os.sep)
    fp = os.sep.join(parts[1:])
    return parts[0], fp, os.path.basename(fp)


def get_blob_client():
    blob_service_client = BlobServiceClient.from_connection_string(
        appsettings.STORAGE_ACCOUNT_CONNECTION_STRING)
    return blob_service_client


def get_file_blob_client(filepath):
    container, blobpath, _ = get_container_and_blob_path(filepath)
    blob_service_client = get_blob_client()
    container_client = blob_service_client.get_container_client(container)
    blob_client = container_client.get_blob_client(blobpath)
    return blob_client


def download_blob_to_temp(filepath):
    extension = get_file_extension(filepath)
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extension}") as tmp:
        fname = tmp.name
        with open(fname, "wb") as f:
            blob_client = get_file_blob_client(filepath)
            data = blob_client.download_blob()
            data.readinto(f)
    return fname


def download_blob_to_string(filepath):
    filepath = download_blob_to_temp(filepath)
    txt = Path(filepath).read_text()
    os.remove(filepath)
    return txt


def upload_audio_file_to_blob(newfilename, file_input_stream):
    blob_client = get_blob_client().get_blob_client(
        container=appsettings.AUDIO_FILE_UPLOAD_CONTAINER, blob=newfilename)
    blob_client.upload_blob(
        file_input_stream, blob_type="BlockBlob", overwrite=True)


def upload_string_data_to_blob(string_data, container_name, blob_name):
    blob = BlobClient.from_connection_string(
        appsettings.STORAGE_ACCOUNT_CONNECTION_STRING, container_name=container_name, blob_name=blob_name)
    blob.upload_blob(string_data, overwrite=True)


def exists(container_name, blob_name):
    blob = BlobClient.from_connection_string(
        appsettings.STORAGE_ACCOUNT_CONNECTION_STRING, container_name=container_name, blob_name=blob_name)
    return blob.exists()


def get_blob_sas(container_name, blob_name):
    kv_info = dict(s.split('=', 1)
                   for s in appsettings.STORAGE_ACCOUNT_CONNECTION_STRING.split(";"))
    account_name = kv_info['AccountName']
    account_key = kv_info['AccountKey']
    sas_blob = generate_blob_sas(account_name=account_name,
                                 container_name=container_name,
                                 blob_name=blob_name,
                                 account_key=account_key,
                                 permission=BlobSasPermissions(write=True),
                                 expiry=datetime.utcnow() + timedelta(hours=1))
    # return f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_blob}"
    return f"https://{account_name}.blob.core.windows.net/?{sas_blob}"
