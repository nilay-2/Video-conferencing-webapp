import React, { useEffect, useRef, useState, useContext } from "react";
import "../css/VideoSpan.css";
import { IconToggle } from "../utils/resizeComponent";
import { AppContext } from "../App";
const VideoContainer = (props) => {
  const remoteStreamRef = useRef();

  const { state, dispatch } = useContext(AppContext);

  const [showPinOpt, setShowPinOpt] = useState(false);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    console.log(props.streamPayload.remoteStream);
    remoteStreamRef.current.srcObject = props.streamPayload.remoteStream;

    // get remote stream username
    getRemoteStreamUserName(props.streamPayload.socketId, state.roomId);

    state.socket.on("receive_username", (data) => {
      dispatch({ type: "SET_REMOTE_USERNAME", payload: data });
    });

    return () => {
      state.socket.off("receive_username");
    };
  }, []);

  const getRemoteStreamUserName = async (socketId, roomId) => {
    const data = {
      querySocketId: socketId,
      roomId: roomId,
    };
    state.socket.emit("request_username", data);
  };

  const showPinBox = () => {
    setShowPinOpt(true);
  };

  const hidePinBox = () => {
    setShowPinOpt(false);
  };

  const getVideoComponent = (e) => {
    setExpand(!expand);
    const vidComponent = e.currentTarget.closest(".video-comp-container");

    const isExpanded = vidComponent.classList.contains("expand");

    if (isExpanded) {
      vidComponent.classList.remove("expand");
      setShowPinOpt(false);
      return;
    }

    vidComponent.classList.add("expand");
  };

  const TogglePinButton = () => {
    if (!showPinOpt) return;
    return (
      <div className="pin-video absolute left-0 right-0 top-0 bottom-0 z-10 flex justify-center items-center hover:cursor-pointer">
        <div className="h-fit w-fit px-5 py-2 bg-black rounded-3xl">
          <button
            className="px-3 py-2 rounded-full active:bg-neutral-500 hover:bg-neutral-400"
            onClick={getVideoComponent}
          >
            <IconToggle
              state={expand}
              lead={
                <i className="bi bi-pin-angle-fill text-white text-2xl"></i>
              }
              fallback={<i className="bi bi-pin-angle text-white text-2xl"></i>}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full w-full mx-auto bg-black rounded-md relative video-comp-container"
      onMouseOver={showPinBox}
      onMouseOut={hidePinBox}
      id={props.vidId}
    >
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2">
        <p className=" bottom-5 left-5 text-white">
          {props.streamPayload?.username}
        </p>
        <div className="text-white items-center  top-2 right-5 text-2xl px-2 rounded-full bg-slate-900 hidden">
          <i class="bi bi-volume-up-fill"></i>
          <i class="bi bi-volume-mute-fill"></i>

          <i class="bi bi-camera-video-fill"></i>
          <i class="bi bi-camera-video-off"></i>
        </div>
      </div>
      <TogglePinButton />
      <video ref={remoteStreamRef} autoPlay className="w-full h-full"></video>
    </div>
  );
};

export default VideoContainer;
