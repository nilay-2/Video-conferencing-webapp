const initialState = {
  screenSharingStream: null,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SCREEN_SHARING_STREAM":
      return {
        ...state,
        screenSharingStream: action.payload.screenSharingStream,
      };

    case "STOP_SCREEN_SHARING_STREAM":
      return {
        ...state,
        screenSharingStream: null,
      };

    default:
      return state;
  }
};
