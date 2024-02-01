import React, { useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { io } from "socket.io-client";

const constraints = {
  audio: true,
  video: true,
};

const Home = () => {
  // using context
  const { state, dispatch } = useContext(AppContext);
  // react hoot form
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const url =
      process.env.NODE_ENV === "production"
        ? "https://meetvistaserver.onrender.com"
        : "http://localhost:5000";

    console.log(`Environment: ${process.env.NODE_ENV}`);
    const socket = io(url, {
      // withCredentials: true,
    });

    dispatch({ type: "SET_SOCKET_CONNECTION", payload: { socket: socket } });

    socket.on("connect", () => {
      console.log(socket.id);
    });
  }, []);

  const onSubmit = (data) => {
    const { roomId, email } = data;

    window.navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // console.log("local stream", stream);

        const clone = stream.clone();

        dispatch({
          type: "SET_CREDENTIALS",
          payload: {
            email: email,
            roomId: roomId,
            mediaStream: stream,
            mediaStreamClone: clone,
          },
        });

        state.socket.emit("join-room", data);

        navigate(`/room/${roomId}`);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <p className="my-4">Welcome to google meet clone</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto flex flex-col gap-2"
      >
        <input
          type="email"
          placeholder="email"
          className="outline px-2 py-1"
          {...register("email", { required: true })}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email?.type === "required" && (
          <p role="alert" className="text-red-500 text-sm text-start">
            Email is required
          </p>
        )}

        <input
          type="text"
          placeholder="room id"
          className="outline px-2 py-1"
          {...register("roomId", { required: true })}
          aria-invalid={errors.roomId ? "true" : "false"}
        />
        {errors.roomId?.type === "required" && (
          <p role="alert" className="text-red-500 text-sm text-start">
            Room id is required
          </p>
        )}

        <input
          type="submit"
          value="Join"
          className="bg-blue-700 text-white rounded-md p-1 hover:cursor-pointer"
        />
      </form>
    </div>
  );
};

export default Home;
