import { useEffect, useRef, useState, useContext } from "react";
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
import { resizeComponent, IconToggle } from "../utils/resizeComponent";
import store from "../app/store";
import { useSelector, useDispatch } from "react-redux";

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
  const dispatch = useDispatch();
  const context = useContext(AppContext);

  // url params
  const { roomId } = useParams();

  // ref
  const videoRef = useRef();
  const screenSharingRef = useRef();

  // toggle variables
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableScreenSharing, setEnableScreenSharing] = useState(false);
  const [showMember, setShowMember] = useState(false);

  useEffect(() => {
    // event received from the incoming user
    const { socket } = context.state;

    videoRef.current.srcObject = context.state.mediaStream;

    socket?.on("connection-prepare", (data) => {
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
      closePeerConnectionOfLeavingUser(roomLeavingUserSocketId, context);
    });
    return () => {
      socket.off("connection-prepare");
      socket.off("connection-init");
      socket.off("connection-signal");
      socket.off("notify-participant-left-room");
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

      dispatch({
        type: "SET_SCREEN_SHARING_STREAM",
        payload: { screenSharingStream: screenSharingStream },
      });

      setEnableScreenSharing(true);

      replaceTrack(screenSharingStream);

      screenSharingStream.oninactive = function () {
        console.log("screen sharing stopped");
        setEnableScreenSharing(false);
        screenSharingRef.current.srcObject = null;

        replaceTrack(context.state.mediaStream);
        dispatch({
          type: "STOP_SCREEN_SHARING_STREAM",
        });
        const tracks = screenSharingStream.getTracks();
        tracks.forEach((track) => track.stop());
      };
    } catch (err) {
      // console.error(`Error: ${err}`);
      setEnableScreenSharing(false);
      dispatch({
        type: "SET_SCREEN_SHARING_STREAM",
        payload: { screenSharingStream: null },
      });
    }
  };

  const ScreeSharingComponent = () => {
    useEffect(() => {
      const state = store.getState();

      screenSharingRef.current.srcObject =
        state.screenSharing.screenSharingStream;
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

  const endCallHandler = () => {
    if (context.state.socket) {
      const { state } = context;
      closeAllPeerConnectionOfCurrentUser(context);
      context.state.socket.emit("leave-room", { roomId, email: state.email });
    }

    const url =
      process.env.NODE_ENV === "production"
        ? "https://video-conferencing-webapp.vercel.app/"
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
            status: context.state.showChatBox,
            lead: "md:w-3/4",
            fallback: "w-full",
          })}`}
        >
          <div className="h-full w-full overflow-auto">
            <div className="video-grid-container h-full w-full">
              <div className="h-full w-full mx-auto bg-black rounded-md relative">
                <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2">
                  <p className=" bottom-5 left-5 text-white">You</p>
                  <div className="text-white items-center  top-2 right-5 text-2xl px-2 rounded-full bg-slate-900 hidden">
                    <i class="bi bi-volume-up-fill"></i>
                    <i class="bi bi-volume-mute-fill"></i>

                    <i class="bi bi-camera-video-fill"></i>
                    <i class="bi bi-camera-video-off"></i>
                  </div>
                </div>
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
                    key={i}
                    vidId={streamPayload.remoteStream.id}
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
              context.dispatch({ type: "TOGGLE_CHAT_BOX" });
            }}
          >
            <IconToggle
              state={context.state.showChatBox}
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
        <Chat />
      </div>
    </>
  );
};

export default Meet;
