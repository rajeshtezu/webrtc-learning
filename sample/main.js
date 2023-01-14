import { getCameraAndMicrophoneMedia, getScreenMedia } from "./media/media-util.js";

const localVideoEl = document.getElementById("localVideo");

async function main() {
  try {
    // const camAndMicMediaStream = await getCameraAndMicrophoneMedia();
    // localVideoEl.srcObject = camAndMicMediaStream;

    const screenMediaStream = await getScreenMedia();
    localVideoEl.srcObject = screenMediaStream;
  } catch (error) {
    console.error("Main Error: ", error);
  }
}

main();
