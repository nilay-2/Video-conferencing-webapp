import Peer from "simple-peer";

const peers = {};

export const prepareForIncomingConnection = (
  socket,
  incomingSocketId,
  initiator,
  context
) => {
  // console.log(context.state.mediaStream);

  // if (initiator) {
  //   console.log("waiting as initiator");
  // } else {
  //   console.log("waiting as non initiator");
  // }

  // console.log(`Incoming socket id: ${incomingSocketId}`);

  const { state, dispatch } = context;

  // console.log(state?.mediaStream);
  peers[incomingSocketId] = new Peer({
    initiator,
    stream: state.mediaStream,
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
  // console.log(peers);

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

  // listen to remote streams
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
  const screenSharingTracks = stream.getTracks();
  const scrShareVidTrack = screenSharingTracks[1];
  // console.log(scrShareVidTrack);

  // replace the video track of peer users with the video track of screen sharing stream
  const peerConnections = Object.values(peers);
  peerConnections.forEach((conn) => {
    const tracks = Object.values(conn.streams[0].getTracks());
    tracks.forEach((track) => {
      if (track.kind === scrShareVidTrack.kind) {
        // console.log(track, scrShareVidTrack);
        conn.replaceTrack(track, scrShareVidTrack, conn.streams[0]);
      }
    });
  });
};
