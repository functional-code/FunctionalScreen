const socket = io();
let peerConnection;
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

async function startHost() {
    socket.emit('join', 'host');

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: false // System audio sharing is browser/OS dependent
        });

        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = stream;

        peerConnection = new RTCPeerConnection(config);

        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);

        socket.on('answer', async (answer) => {
            await peerConnection.setRemoteDescription(answer);
        });

        socket.on('candidate', async (candidate) => {
            try {
                await peerConnection.addIceCandidate(candidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        // Handle user joined event - if a viewer joins LATER, we might need to resend offer?
        // For simplicity, this basic version assumes viewer might be ready or we just refresh.
        // Better: if viewer joins, we can resend offer if we are already streaming.
        socket.on('user-joined', async (role) => {
            if (role === 'viewer') {
                console.log('Viewer joined, sending offer...');
                // If we already have an offer, we might need to renegotiate or just send the current one?
                // WebRTC requires fresh offer usually if state is stable.
                // For now, let's just create a new offer to be safe.
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit('offer', offer);
            }
        });

    } catch (err) {
        console.error("Error starting screen share:", err);
        alert("Error starting screen share: " + err.message);
    }
}
