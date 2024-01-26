import React, { useState, useContext, useEffect } from "react";
import { resizeComponent } from "../utils/resizeComponent";
import Message from "./Message";
import TextareaAutosize from "react-textarea-autosize";
import { AppContext } from "../App";
const Chat = ({ showChatBox, setShowChatBox }) => {
  const [message, setMessage] = useState("");

  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    const { socket } = state;

    socket?.on("send_message_to_room", (msgData) => {
      // console.log(msgData);
      dispatch({
        type: "APPEND_MESSAGE",
        payload: { msgData: msgData },
      });
    });

    return () => {
      socket?.removeListener("send_message_to_room");
    };
  }, []);

  const sendMessage = () => {
    if (!message) return;

    const { socket } = state;

    const msgData = {
      roomId: state.roomId,
      email: state.email,
      message: message,
      date: Date.now(),
    };

    setMessage("");

    socket.emit("send_message", msgData);
  };

  return (
    <div
      className={`h-full p-2 transition-all duration-500 md:w-1/4 w-full absolute right-0 top-0 bottom-0 ${resizeComponent(
        {
          status: showChatBox,
          lead: "translate-x-0",
          fallback: "translate-x-full",
        }
      )}`}
    >
      <div className="content h-full p-3 bg-white rounded-md flex flex-col gap-2">
        <div className="header flex justify-between items-center rounded-md px-3 py-2 bg-slate-300 ">
          <span>In-call messages</span>
          <button
            className="px-2 py-1 rounded-full hover:bg-slate-400 active:bg-slate-500"
            onClick={() => {
              setShowChatBox(false);
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="messages-container border border-green-400 h-full overflow-auto p-3 flex flex-col gap-2">
          <Message chats={state.chat} />
        </div>
        {/*<input
          type="text"
          className="p-3 bg-slate-200 text-black rounded-full"
          placeholder="Send a message"
    />*/}
        <TextareaAutosize
          style={{ padding: "10px" }}
          value={message}
          placeholder="Send a message"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button onClick={sendMessage}>send</button>
      </div>
    </div>
  );
};

export default Chat;
