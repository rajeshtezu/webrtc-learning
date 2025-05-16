# WebRTC Learning

This repository contains the sample projects (POCs) for various WebRTC flows.

Please read through below about each of the samples and follow the instructions to try it out.

## basic-p2p

- After cloning the repo, navigate to `basic-p2p` folder
- Run `npm install`
- Run `npm start`

You will see the below UIs

<span><img src="./assets/p2p-offerer.png" height="400" width="400"></span>
<span><img src="./assets/p2p-answerer.png" height="400" width="400"></span>

Now open the above two screens in two different browsers and do the following

- Offerer screen: Click `Create offer` and copy the SDP offer
- Answerer screen: Paste the SDP offer in the accept offer and click `Accept offer`
- Answerer screen: Click `Create Answer` and copy SDP answer
- Offerer screen: Paste the SDP answer and click `Accept answer`

After doing above steps, the connection should get established.

**Note**: Don't forget to give media permission when asked

### Concepts and Code Architecture

There is a node (express.js) server which hosts the html page from `public/index.html` and all the **webrtc** logic is written inside the `public/client` file.

**Part-1: Offer and Answer**

- userA -> gets browser media and creates offer
- userB -> gets browser media and Accepts offer
- userB -> creats answer
- userA -> accepts answer

**Part-2: Adding ICE candidates**

For this we need signaling to pass the ice candidates from one user to another. This project simply creates http endpoints to get and post the ice candidates and once the `remoteDescription` is added to the `peerConnection` the user fetches the ice candidate of other user from the server and adds to the `peerConnection`. Once this is done the peers get **connected**!
