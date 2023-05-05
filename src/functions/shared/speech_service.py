import logging
import time

import azure.cognitiveservices.speech as speechsdk

from .appsettings import SPEECH_KEY, SPEECH_REGION

# See https://github.com/Azure-Samples/cognitive-services-speech-sdk/blob/master/samples/python/console/speech_sample.py#L325


def speech_recognize_continuous_from_file(filepath):
    """performs continuous speech recognition with input from an audio file"""

    try:
        speech_config = speechsdk.SpeechConfig(
            subscription=SPEECH_KEY, region=SPEECH_REGION)
        audio_config = speechsdk.audio.AudioConfig(filename=filepath)
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, audio_config=audio_config)

        done = False
        texts = []

        def stop_cb(evt: speechsdk.SessionEventArgs):
            """callback that signals to stop continuous recognition upon receiving an event `evt`"""
            # print('CLOSING on {}'.format(evt))
            nonlocal done
            done = True

        def capture_text(evt: speechsdk.SessionEventArgs):
            nonlocal texts
            texts.append(evt.result.text)

        # Connect callbacks to the events fired by the speech recognizer
        # speech_recognizer.recognizing.connect(lambda evt: print('RECOGNIZING: {}'.format(evt)))
        speech_recognizer.recognized.connect(capture_text)
        # speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt)))
        # speech_recognizer.session_stopped.connect(lambda evt: print('SESSION STOPPED {}'.format(evt)))
        # speech_recognizer.canceled.connect(lambda evt: print('CANCELED {}'.format(evt)))
        # stop continuous recognition on either session stopped or canceled events
        speech_recognizer.session_stopped.connect(stop_cb)
        speech_recognizer.canceled.connect(stop_cb)

        # Start continuous speech recognition
        speech_recognizer.start_continuous_recognition()
        while not done:
            time.sleep(.1)

        speech_recognizer.stop_continuous_recognition()

        return '\n'.join(texts)
    except Exception as e:
        logging.error(e)
        pass
    return ''
