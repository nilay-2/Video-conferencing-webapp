import React, { useState, useContext, useEffect } from "react";
import { resizeComponent } from "../utils/resizeComponent";
import Message from "./Message";
import TextareaAutosize from "react-textarea-autosize";
import { AppContext } from "../App";
const Chat = () => {
  const [message, setMessage] = useState("");

  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    const { socket } = state;

    socket?.on("send_message_to_room", (msgData) => {
      dispatch({
        type: "APPEND_MESSAGE",
        payload: { msgData: msgData },
      });
    });

    return () => {
      socket.off("send_message_to_room");
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
    <>
      <div
        className={`h-full p-2 transition-all duration-500 md:w-1/4 w-full absolute right-0 top-0 bottom-0 ${resizeComponent(
          {
            status: state.showChatBox,
            lead: "translate-x-0",
            fallback: "translate-x-full",
          }
        )} z-10`}
      >
        <div className="content h-full p-3 bg-white rounded-md flex flex-col gap-2">
          <div className="header flex justify-between items-center rounded-md px-3 py-2 bg-slate-300 ">
            <span>In-call messages</span>
            <button
              className="px-2 py-1 rounded-full hover:bg-slate-400 active:bg-slate-500"
              onClick={() => {
                dispatch({ type: "TOGGLE_CHAT_BOX" });
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="messages-container h-full overflow-auto p-3 flex flex-col gap-2">
            <Message chats={state.chat} />
          </div>
          <div className="chat-form flex justify-between items-center border border-slate-600 rounded-md">
            <TextareaAutosize
              style={{
                padding: "10px",
                width: "100%",
                height: "45px",
                borderRadius: "6px",
              }}
              maxRows={3}
              value={message}
              placeholder="Send a message"
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <button
              onClick={sendMessage}
              className=" block px-3"
              disabled={message ? false : true}
            >
              {message ? (
                <i className="bi bi-send-fill text-blue-600"></i>
              ) : (
                <i className="bi bi-send-fill text-slate-600"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
