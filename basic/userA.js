let configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

let localCon = new RTCPeerConnection(configuration);

localCon.onicecandidate = (e) => console.log('ICE candidate: ', JSON.stringify(localCon.localDescription));

let sendData = localCon.createDataChannel('sendData');

sendData.onopen = () => console.log('Open');
sendData.onclose = () => console.log('Closed');
sendData.onmessage = (e) => console.log('Message: ', e.data);

localCon.createOffer().then((o) => localCon.setLocalDescription(o));

// TODO: Receive answer from userB
localCon.setRemoteDescription(answer).then((e) => console.log('Done!'));
