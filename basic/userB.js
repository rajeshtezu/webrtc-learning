let configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let remoteCon = new RTCPeerConnection(configuration);

remoteCon.onicecandidate = (e) => console.log('ICE candidate: ', JSON.stringify(remoteCon.localDescription));

remoteCon.ondatachannel = (e) => {
  remoteCon['dc'] = e.channel;

  remoteCon.dc.onopen = () => console.log('Open');
  remoteCon.dc.onclose = () => console.log('Closed');
  remoteCon.dc.onmessage = (event) => console.log('Message: ', event.data);
};

// TODO: Receive offer from userA
remoteCon.setRemoteDescription(offer).then((e) => console.log('DONE!!!'));

remoteCon.createAnswer().then((a) => remoteCon.setLocalDescription(a));
