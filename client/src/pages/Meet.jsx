import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../App";
import {
  prepareForIncomingConnection,
  handleSignallingData,
  closeAllPeerConnectionOfCurrentUser,
  closePeerConnectionOfLeavingUser,
  replaceTrack,
} from "../utils/webRtcHandler";
import VideoContainer from "../Components/VideoContainer";
import "../css/Meet_Grid.css";
import Chat from "../Components/Chat";
import { resizeComponent } from "../utils/resizeComponent";

const displayMediaOptions = {
  video: true,
  // video: {
  //   displaySurface: "browser",
  // },
  audio: true,
  // audio: {
  //   suppressLocalAudioPlayback: false,
  // },
  preferCurrentTab: false,
  selfBrowserSurface: "exclude",
  systemAudio: "include",
  surfaceSwitching: "include",
  monitorTypeSurfaces: "include",
};

const Meet = () => {
  // using context
  const context = useContext(AppContext);
  console.log(context.state);
  // url params
  const { roomId } = useParams();

  // ref
  const videoRef = useRef();
  const screenSharingRef = useRef();

  // media stream
  // const [mediaStream, setMediaStream] = useState(null);

  // toggle variables
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableScreenSharing, setEnableScreenSharing] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showMember, setShowMember] = useState(false);

  useEffect(() => {
    // event received from the incoming user
    const { socket } = context.state;

    videoRef.current.srcObject = context.state.mediaStream;

    socket?.on("connection-prepare", (data) => {
      console.log(`preparation data ${data}`);
      const { incomingSocketId } = data;

      prepareForIncomingConnection(socket, incomingSocketId, false, context);
      // event sent to the incoming user
      socket?.emit("connection-init", { incomingSocketId });
    });

    socket?.on("connection-init", (data) => {
      console.log(data);
      const { incomingSocketId } = data;
      prepareForIncomingConnection(socket, incomingSocketId, true, context);
    });

    socket?.on("connection-signal", (signalingData) => {
      handleSignallingData(signalingData);
    });

    socket?.on("notify-participant-left-room", (roomLeavingUserSocketId) => {
      // console.log(`leaving user socket id: ${roomLeavingUserSocketId}`);
      closePeerConnectionOfLeavingUser(roomLeavingUserSocketId, context);
    });

    return () => {
      socket?.removeAllListeners("connection-prepare");
      socket?.removeAllListeners("connection-init");
      socket?.removeAllListeners("connection-signal");
      socket?.removeAllListeners("notify-participant-left-room");
    };
  }, []);

  const toggleCamera = () => {
    const { state } = context;
    const videoTracks = state.mediaStream.getVideoTracks();
    videoTracks[0].enabled = !enableVideo;
    setEnableVideo(!enableVideo);
  };

  const toggleAudio = () => {
    const { state } = context;
    const audioTracks = state.mediaStream.getAudioTracks();
    audioTracks[0].enabled = !enableAudio;
    setEnableAudio(!enableAudio);
  };

  const toggleScreenSharing = async () => {
    try {
      const screenSharingStream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );
      // screenSharingRef.current.srcObject = screenSharingStream;

      dispatchScreenSharingStream(screenSharingStream);

      setEnableScreenSharing(true);

      replaceTrack(screenSharingStream);

      screenSharingStream.oninactive = function () {
        setEnableScreenSharing(false);
        screenSharingRef.current.srcObject = null;
        replaceTrack(context.state.mediaStream);
        const tracks = screenSharingStream.getTracks();
        tracks.forEach((track) => track.stop());
        dispatchScreenSharingStream(null);
      };
    } catch (err) {
      // console.error(`Error: ${err}`);
      setEnableScreenSharing(false);
      dispatchScreenSharingStream(null);
    }
  };

  const dispatchScreenSharingStream = (stream) => {
    const { dispatch } = context;
    dispatch({
      type: "SET_SCREEN_SHARING_STREAM",
      payload: { screenSharingStream: stream },
    });
  };

  const ScreeSharingComponent = () => {
    const { state } = context;

    useEffect(() => {
      screenSharingRef.current.srcObject = state.screenSharingStream;
    }, []);

    return (
      <div className="h-full w-full mx-auto bg-black rounded-md">
        <video
          ref={screenSharingRef}
          autoPlay
          className="w-full h-full"
        ></video>
      </div>
    );
  };

  const IconToggle = (props) => {
    if (!props.state) {
      return props.fallback;
    }
    return props.lead;
  };

  const endCallHandler = () => {
    if (context.state.socket) {
      const { state } = context;
      closeAllPeerConnectionOfCurrentUser(context);
      context.state.socket.emit("leave-room", { roomId, email: state.email });
    }

    const url =
      process.env.NODE_ENV === "production"
        ? "https://meetvista.netlify.app"
        : "http://localhost:3000";

    window.location.href = url;
  };

  return (
    <>
      <div
        className="w-screen main-layout xl:max-w-screen-2xl xl:mx-auto overflow-x-hidden relative"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <div
          className={`p-2 h-full ${resizeComponent({
            status: showChatBox,
            lead: "md:w-3/4",
            fallback: "w-full",
          })}`}
        >
          <div className="h-full w-full overflow-auto">
            <div className="video-grid-container h-full w-full">
              <div className="h-full w-full mx-auto bg-black rounded-md">
                <video
                  ref={videoRef}
                  autoPlay
                  className="w-full h-full"
                  muted
                ></video>
              </div>
              {enableScreenSharing && <ScreeSharingComponent />}

              {context.state.remoteStreams.map((streamPayload, i) => {
                return (
                  <VideoContainer
                    streamPayload={streamPayload}
                    key={streamPayload.remoteStream.id}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="flex justify-center gap-3 options-bar py-3 fixed bottom-0 left-0 right-0"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <button
            className="text-white bg-gray-700 rounded-full px-3 py-2 text-lg"
            onClick={() => {
              setShowMember(!showMember);
            }}
          >
            <IconToggle
              state={showMember}
              fallback={<i className="bi bi-people"></i>}
              lead={<i className="bi bi-people-fill"></i>}
            />
          </button>
          <button
            className="text-white bg-gray-700 rounded-full px-3 py-2"
            onClick={() => {
              setShowChatBox(!showChatBox);
            }}
          >
            <IconToggle
              state={showChatBox}
              fallback={<i className="bi bi-chat-right-text"></i>}
              lead={<i className="bi bi-chat-right-fill"></i>}
            />
          </button>
          <button
            className="text-white bg-gray-700 rounded-full px-3 py-2"
            onClick={toggleCamera}
          >
            <IconToggle
              state={enableVideo}
              fallback={<i className="bi bi-camera-video-off"></i>}
              lead={<i className="bi bi-camera-video"></i>}
            />
          </button>
          <button
            className="text-white bg-gray-700 rounded-full px-3 py-2"
            onClick={toggleAudio}
          >
            <IconToggle
              state={enableAudio}
              fallback={<i className="bi bi-mic-mute"></i>}
              lead={<i className="bi bi-mic"></i>}
            />
          </button>
          <button
            onClick={toggleScreenSharing}
            className="text-white bg-gray-700 rounded-full px-3 py-2"
            disabled={enableScreenSharing}
          >
            <i className="bi bi-display"></i>
          </button>
          <button
            className="text-white bg-red-700 rounded-full px-3 py-2"
            onClick={endCallHandler}
          >
            <i className="bi bi-telephone-fill"></i>
          </button>
        </div>
        <Chat showChatBox={showChatBox} setShowChatBox={setShowChatBox} />
      </div>
    </>
  );
};

export default Meet;
