import os

def get_appsetting(key, default_value=None):
    if key in os.environ:
        return os.environ[key]
    return default_value


STORAGE_ACCOUNT_CONNECTION_STRING     = get_appsetting("STORAGE_ACCOUNT_CONNECTION_STRING")
AUDIO_FILE_UPLOAD_CONTAINER           = get_appsetting("AUDIO_FILE_UPLOAD_CONTAINER")
TRANSCRIPTION_FILE_UPLOAD_CONTAINER   = get_appsetting("TRANSCRIPTION_FILE_UPLOAD_CONTAINER")
OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER = get_appsetting("OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER")
SPEECH_KEY                            = get_appsetting("SPEECH_KEY")
SPEECH_REGION                         = get_appsetting("SPEECH_REGION")
OPENAI_KEY                            = get_appsetting("OPENAI_KEY")
OPENAI_ENDPOINT                       = get_appsetting("OPENAI_ENDPOINT")
FILE_SHARE_MOUNT_PATH                 = get_appsetting("FILE_SHARE_MOUNT_PATH")
