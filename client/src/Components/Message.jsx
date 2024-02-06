import React, { useContext } from "react";
import { AppContext } from "../App";

const Message = (props) => {
  const { state } = useContext(AppContext);

  if (!props.chats.length)
    return (
      <div className="w-full h-full flex justify-center items-center text-slate-600">
        No messages yet
      </div>
    );

  const getUserName = (chatUserEmail) => {
    const { email } = state;

    if (email === chatUserEmail) return "You";
    // add client files
    return chatUserEmail;
  };

  return (
    <>
      {props.chats.map((chat, i) => {
        if (!chat.fromSameAuthor) {
          return (
            <div className="w-full" key={i}>
              <p className="text-sm">
                <span className="font-bold">{getUserName(chat.email)}</span>
                <span className="ml-2 text-slate-600">
                  {timestampToTime(chat.date)}
                </span>
              </p>
              <pre className="max-w-full text-xs mt-2">{chat.message}</pre>
            </div>
          );
        }

        return (
          <div className="w-full" key={i}>
            <pre className="max-w-full text-xs mt-2">{chat.message}</pre>
          </div>
        );
      })}
    </>
  );
};

function timestampToTime(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}

export default Message;
