export const initialState = {
  email: "",
  roomId: "",
  mediaStream: null,
  remoteStreams: [],
  screenSharingStream: null,
  socket: null,
  chat: [],
};

/*
  remote stream schema
  [
    {socketId, remoteStream}
  ]
*/

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_CREDENTIALS":
      return {
        ...state,
        email: action.payload.email,
        roomId: action.payload.roomId,
        mediaStream: action.payload.mediaStream,
      };

    case "SET_REMOTE_STREAMS":
      console.log("Remote stream", action.payload);
      return {
        ...state,
        remoteStreams: [...state.remoteStreams, action.payload],
      };

    case "REMOVE_REMOTE_STREAM":
      const newListOfRemoteStream = state.remoteStreams.filter(
        (streamContent) => {
          let streamPayload = null;
          if (
            streamContent.socketId !== action.payload.roomLeavingUserSocketId
          ) {
            streamPayload = streamContent;
          }
          return streamPayload;
        }
      );

      return {
        ...state,
        remoteStreams: newListOfRemoteStream,
      };

    case "END_CALL":
      return {
        ...state,
        email: "",
        roomId: "",
        mediaStream: null,
        remoteStreams: [],
        screenSharingStream: null,
        socket: null,
        chat: [],
      };

    case "SET_SOCKET_CONNECTION":
      return {
        ...state,
        socket: action.payload.socket,
      };

    case "SET_SCREEN_SHARING_STREAM":
      return {
        ...state,
        screenSharingStream: action.payload.screenSharingStream,
      };

    case "APPEND_MESSAGE":
      // logic to check if current message and previous message are from the same author

      const msgDataObj = { ...action.payload.msgData };

      if (isMessageFromSameAuthor(state.chat, action.payload.msgData)) {
        msgDataObj.fromSameAuthor = true;
      } else {
        msgDataObj.fromSameAuthor = false;
      }

      return {
        ...state,
        chat: [...state.chat, msgDataObj],
      };

    default:
      return state;
  }
};

const isMessageFromSameAuthor = (chat, currMessage) => {
  if (!chat.length) return false;

  const latestMsg = chat[chat.length - 1];

  if (latestMsg.email === currMessage.email) return true;
};
