/**
 *
 * @returns Camera and microphone media stream
 */
export async function getCameraAndMicrophoneMedia(constraints) {
  const camAndMicConstraints = constraints || {
    // audio: {
    //   suppressLocalAudioPlayback: true,
    //   noiseSuppression: true,
    // },

    // video: {
    //   height: 100,
    //   width: 100,
    // },

    audio: false,
    video: true,
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(camAndMicConstraints);

  console.log("Camera and Microphone media stream: ", mediaStream);

  return mediaStream;
}

/**
 *
 * @returns Screen media stream
 */
export async function getScreenMedia(constraints) {
  const displayMediaConstraints = constraints || {
    audio: false,
    video: true,
  };

  const screenMediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaConstraints);

  console.log("Screen media stream: ", screenMediaStream);

  return screenMediaStream;
}

/**
 *
 * @param {videoinput, audioinput} type
 */
export async function getConnectedDevices(type) {
  let devices = await navigator.mediaDevices.enumerateDevices();
  devices = devices.filter((device) => device.kind === type);

  return devices;
}
