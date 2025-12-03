let viewerPeerConnection;

async function startViewer() {
    socket.emit('join', 'viewer');

    viewerPeerConnection = new RTCPeerConnection(config);

    viewerPeerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    viewerPeerConnection.ontrack = event => {
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.srcObject = event.streams[0];
    };

    socket.on('offer', async (offer) => {
        await viewerPeerConnection.setRemoteDescription(offer);
        const answer = await viewerPeerConnection.createAnswer();
        await viewerPeerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });

    socket.on('candidate', async (candidate) => {
        try {
            await viewerPeerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    });

    // Fullscreen button logic
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        const video = document.getElementById('remote-video');
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) { /* Safari */
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { /* IE11 */
            video.msRequestFullscreen();
        }
    });
}
