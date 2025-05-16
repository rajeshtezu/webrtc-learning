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
    await fetch('/iceCandidates', {
      method: 'DELETE'
    });
  }
});

peerConnection.onicecandidate = (event) => {
  if (event.candidate && event.candidate.candidate) {
    console.log('ICE Candidate:', event.candidate);

    // Send the candidate to the remote peer using fetch on /iceCandidate1 or /iceCandidate2
    const path = localStorage.getItem('userType') === 'offerer' ? '/iceCandidate1' : '/iceCandidate2';

    fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event.candidate)
    })
      .then((response) => {
        if (response.ok) {
          console.log('ICE candidate sent successfully');
        } else {
          console.error('Error sending ICE candidate:', response.statusText);
        }
      })
      .catch((error) => {
        console.error('Error sending ICE candidate:', error);
      });
  }
};

function addRemoteIceCandidate() {
  const isOfferer = localStorage.getItem('userType') === 'offerer';
  const path = isOfferer ? '/iceCandidate2' : '/iceCandidate1';

  if (!peerConnection.remoteDescription) return;

  fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Received remote ICE candidate:', data);

      if (!data) return;

      const candidate = new RTCIceCandidate(data);
      console.log('Parsed remote ICE candidate:', candidate);

      // Add the remote ICE candidate to the peer connection
      peerConnection
        .addIceCandidate(candidate)
        .then(() => {
          console.log('Remote ICE candidate added:', candidate);
          clearInterval(iceInterval); // Stop fetching after adding the candidate
        })
        .catch((error) => {
          console.error('Error adding remote ICE candidate:', error);
        });
    })
    .catch((error) => {
      console.error('Error fetching remote ICE candidate:', error);
    });
}

let iceInterval;

function startIceInterval() {
  iceInterval = setInterval(() => {
    console.log('Fetching remote ICE candidate...');

    addRemoteIceCandidate();
  }, 15000);
}

startIceInterval();

async function addMedia() {
  // Listen for track events to get the remote stream
  // and set the remote video element's srcObject to the stream
  peerConnection.addEventListener('track', async (event) => {
    console.log('Track event:', event);
    console.log('Remote stream:', event.streams[0]);

    remoteVideoElm.srcObject = event.streams[0];
    console.log('remoteVideoElm.srcObject:', remoteVideoElm.srcObject);
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
  // await addMedia(); // This was not setting the remote stream listener on the answerer side

  peerConnection
    .createAnswer()
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      sdpAnswerElm.textContent = JSON.stringify(peerConnection.localDescription);
      isAnswerCreated = true;
    })
    .catch((error) => {
      console.error('Error creating answer:', error);
    });
}

async function acceptOffer() {
  await addMedia();
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
  alert(`Copied`);
}

async function startLocalVideo() {
  const streams = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  console.log('Local stream:', streams);

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
