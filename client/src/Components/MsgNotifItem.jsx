import React, { useContext } from "react";
import { AppContext } from "../App";

const MsgNotifItem = (props) => {
  const { dispatch } = useContext(AppContext);
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        dispatch({ type: "TOGGLE_CHAT_BOX" });
        props.closeToast();
      }}
    >
      <p className="mb-3">
        <span className="text-blue-500">
          <i className="bi bi-chat-right-text"></i>
        </span>
        <span className="ml-4 font-semibold">{props.latestMsg?.email}</span>
      </p>
      <p className="text-sm">{props.latestMsg?.message}</p>
    </div>
  );
};

export default MsgNotifItem;
