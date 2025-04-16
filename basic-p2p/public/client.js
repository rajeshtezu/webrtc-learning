const sdpOfferElm = document.getElementById('sdp-offer');
const sdpAnswerElm = document.getElementById('sdp-answer');
const localVideoElm = document.getElementById('local-video');
const remoteVideoElm = document.getElementById('remote-video');
const createOfferBtn = document.getElementById('create-offer-btn');
const createAnswerBtn = document.getElementById('create-ans-btn');
const remoteSdpOfferElm = document.getElementById('remote-sdp-offer');
const remoteSdpAnswerElm = document.getElementById('remote-sdp-answer');

// User type - offerer or answerer - start
const createOfferContainer = document.getElementById('create-offer-container');
const createAnswerContainer = document.getElementById('create-ans-container');
const acceptOfferContainer = document.getElementById('accept-offer-container');
const acceptAnswerContainer = document.getElementById('accept-ans-container');

function toggleUserType(userType) {
  localStorage.setItem('userType', userType);
  if (userType === 'offerer') {
    createOfferContainer.style.display = 'block';
    acceptAnswerContainer.style.display = 'flex';
    createAnswerContainer.style.display = 'none';
    acceptOfferContainer.style.display = 'none';
  } else {
    createOfferContainer.style.display = 'none';
    acceptAnswerContainer.style.display = 'none';
    createAnswerContainer.style.display = 'block';
    acceptOfferContainer.style.display = 'flex';
  }
}

const userTypeSelect = document.getElementById('user-type');
userTypeSelect.addEventListener('change', (event) => {
  userType = event.target.value;
  toggleUserType(userType);
});

const storedUserType = localStorage.getItem('userType') || 'offerer';
userTypeSelect.value = storedUserType;
toggleUserType(storedUserType); // Default to offerer
// User type - offerer or answerer - end

const iceConfig = {
  // iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  iceServers: []
};

const peerConnection = new RTCPeerConnection(iceConfig);

// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', async (event) => {
  console.log('Connection state changed:', event);

  if (peerConnection.connectionState === 'connected') {
    // Peers connected!
    console.log('Peers connected!');
    alert('Peers connected!');
  }
});

peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('ICE Candidate:', event.candidate);
    if (event.candidate) {
      peerConnection.addIceCandidate(event.candidate);
    }
  }
};

async function addMedia() {
  // Listen for track events to get the remote stream
  // and set the remote video element's srcObject to the stream
  peerConnection.addEventListener('track', async (event) => {
    console.log('Track event:', event);

    const remoteStream = event.streams[0];
    remoteVideoElm.srcObject = remoteStream;
  });

  // Add local video stream to the peer connection
  // and set the local video element's srcObject to the stream
  const localStream = await startLocalVideo();
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
}

async function createOffer() {
  createAnswerBtn.disabled = true;

  await addMedia();

  peerConnection
    .createOffer()
    .then((offer) => {
      return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
      sdpOfferElm.textContent = JSON.stringify(peerConnection.localDescription);
    })
    .catch((error) => {
      console.error('Error creating offer:', error);
    });
}

async function createAnswer() {
  createOfferBtn.disabled = true;
  await addMedia();

  peerConnection
    .createAnswer()
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      sdpAnswerElm.textContent = JSON.stringify(peerConnection.localDescription);
    })
    .catch((error) => {
      console.error('Error creating answer:', error);
    });
}

async function acceptOffer() {
  createOfferBtn.disabled = true;
  const offer = JSON.parse(remoteSdpOfferElm.value);
  const offerSdp = {
    type: offer.type,
    sdp: offer.sdp
  };
  const remoteDesc = new RTCSessionDescription(offerSdp);

  peerConnection
    .setRemoteDescription(remoteDesc)
    .then(() => {
      console.log('Offer accepted');
    })
    .catch((error) => {
      console.error('Error accepting offer:', error);
    });
}

function acceptAnswer() {
  const answer = JSON.parse(remoteSdpAnswerElm.value);
  const answerSdp = {
    type: answer.type,
    sdp: answer.sdp
  };
  const remoteDesc = new RTCSessionDescription(answerSdp);

  peerConnection
    .setRemoteDescription(remoteDesc)
    .then(() => {
      console.log('Answer accepted');
    })
    .catch((error) => {
      console.error('Error accepting answer:', error);
    });
}

function copyText(id) {
  const element = document.getElementById(id);
  const text = element.textContent || element.innerText;

  navigator.clipboard.writeText(text);
}

async function startLocalVideo() {
  const streams = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  localVideoElm.srcObject = streams;

  return streams;
}

function stopLocalVideo() {
  const stream = localVideoElm.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    localVideoElm.srcObject = null;
  }
}
