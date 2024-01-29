import React, { useEffect, useRef, useState } from "react";
import "../css/VideoSpan.css";
import { IconToggle } from "../utils/resizeComponent";
const VideoContainer = (props) => {
  const remoteStreamRef = useRef();

  const [showPinOpt, setShowPinOpt] = useState(false);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    remoteStreamRef.current.srcObject = props.streamPayload.remoteStream;
  }, []);

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
      <TogglePinButton />
      <video ref={remoteStreamRef} autoPlay className="w-full h-full"></video>
    </div>
  );
};

export default VideoContainer;
