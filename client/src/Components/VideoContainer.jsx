import React, { useEffect, useRef } from "react";

const VideoContainer = (props) => {
  const remoteStreamRef = useRef();

  useEffect(() => {
    remoteStreamRef.current.srcObject = props.streamPayload.remoteStream;
  }, []);

  return (
    <div className="h-full w-full mx-auto bg-black rounded-md">
      <video ref={remoteStreamRef} autoPlay className="w-full h-full"></video>
    </div>
  );
};

export default VideoContainer;
