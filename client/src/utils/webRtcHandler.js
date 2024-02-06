import store from "../app/store";
import SimplePeer from "simple-peer";
const peers = {};

export const prepareForIncomingConnection = (
  socket,
  incomingSocketId,
  initiator,
  context
) => {
  const { state, dispatch } = context;

  const scrShrStream = store.getState();

  const stream = state.mediaStream;

  let combinedStream = null;

  // if user has already started screen sharing
  if (scrShrStream.screenSharing.screenSharingStream) {
    combinedStream = new MediaStream();
    combinedStream.addTrack(
      scrShrStream.screenSharing.screenSharingStream.getVideoTracks()[0]
    );
    combinedStream.addTrack(stream.getAudioTracks()[0]);
  }

  peers[incomingSocketId] = new SimplePeer({
    initiator,
    stream: combinedStream || stream,
  });
  peers[incomingSocketId].on("signal", (data) => {
    // again send data of the current user to the peer
    // console.log("signalling data", data);
    const signalData = {
      signal: data,
      incomingSocketId: incomingSocketId,
    };

    socket.emit("connection-signal", signalData);
  });

  // send signalling data

  peers[incomingSocketId].on("stream", (stream) => {
    // console.log("Received remote stream");
    // console.log(stream);
    dispatch({
      type: "SET_REMOTE_STREAMS",
      payload: { remoteStream: stream, socketId: incomingSocketId },
    });
  });

  peers[incomingSocketId].on("error", (error) => {
    console.log(error);
  });
};

export const handleSignallingData = (signallingData) => {
  const { incomingSocketId, signal } = signallingData;
  // console.log(peers[incomingSocketId].destroyed);
  if (peers[incomingSocketId]) {
    peers[incomingSocketId].signal(signal);
  }
};

// when user clicks on the end call button the connections with all the peer connections for this current user will be destroyed

export const closeAllPeerConnectionOfCurrentUser = (context) => {
  const { dispatch } = context;
  Object.entries(peers).forEach((mappedObj) => {
    const remoteUserSocketId = mappedObj[0];
    if (peers[remoteUserSocketId]) {
      peers[remoteUserSocketId].destroy();
      delete peers[remoteUserSocketId];
    }
  });

  dispatch({ type: "END_CALL" });

  // console.log("Removing connection of all the users");
};

export const closePeerConnectionOfLeavingUser = (
  roomLeavingUserSocketId,
  context
) => {
  const { dispatch } = context;
  if (peers[roomLeavingUserSocketId]) {
    peers[roomLeavingUserSocketId].destroy();
    delete peers[roomLeavingUserSocketId];
  }
  dispatch({
    type: "REMOVE_REMOTE_STREAM",
    payload: { roomLeavingUserSocketId },
  });
  // console.log("Remove the peer connection of remote user leaving");
};

/*mappedObj ---> 

[
    [
    socketId, peer
  ], [
    socketId, peer
  ], [
    socketId, peer
  ]
]

*/

export const replaceTrack = (stream) => {
  // get screen sharing video track
  const peerConnections = Object.values(peers);
  if (!peerConnections.length) return;

  const screenSharingTracks = stream.getTracks();
  const scrShareVidTrack = screenSharingTracks[1];
  console.log(scrShareVidTrack);

  // replace the video track of peer users with the video track of screen sharing stream
  peerConnections.forEach((conn) => {
    const tracks = Object.values(conn.streams[0].getTracks());
    tracks.forEach((track) => {
      if (track.kind === scrShareVidTrack.kind) {
        conn.replaceTrack(track, scrShareVidTrack, conn.streams[0]);
      }
    });
  });
};
