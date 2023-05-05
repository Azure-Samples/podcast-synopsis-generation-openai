import os

from .appsettings import FILE_SHARE_MOUNT_PATH


def get_file_extension(filename):
    return os.path.splitext(filename)[1][1:].strip().lower()


def execute_ffmpeg_cmd(command):
    ffmpeg_path = f"{FILE_SHARE_MOUNT_PATH}/ffmpeg"
    stream = os.popen(f"{ffmpeg_path} {command}")
    output = stream.read()
    return output


def convert_mp3_to_wav(mp3_path):
    wav_file_path = f"{mp3_path}.wav"
    # convert mp3 to .wav with 1 channel
    command = f"-i '{mp3_path}' -ac 1 '{wav_file_path}'"
    execute_ffmpeg_cmd(command)
    return wav_file_path


def split_audio_file_into_chunks(audio_file_path):
    out_file_path = f"{audio_file_path}-out/"
    file_extension = get_file_extension(audio_file_path)

    # Create directory
    if not os.path.exists(out_file_path):
        os.makedirs(out_file_path)

    # https://unix.stackexchange.com/a/283547
    command = f"-i '{audio_file_path}' -f segment -segment_time 600 -c copy '{out_file_path}%04d.{file_extension}'"
    execute_ffmpeg_cmd(command)
    return out_file_path
