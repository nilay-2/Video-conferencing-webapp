import React, { useEffect, useContext, useState } from "react";
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

  const navigate = useNavigate();

  // react hoot form
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
    const socket = io(url, {});

    dispatch({ type: "SET_SOCKET_CONNECTION", payload: { socket: socket } });

    socket.on("connect", () => {
      console.log(socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const onSubmit = (data) => {
    const { roomId, email } = data;

    window.navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // const clone = stream.clone();

        dispatch({
          type: "SET_CREDENTIALS",
          payload: {
            email: email,
            roomId: roomId,
            mediaStream: stream,
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
    <div className="md:h-screen w-screen h-auto bg-landing_page bg-no-repeat bg-cover p-3">
      <div
        className="h-full w-full mx-auto flex flex-col"
        style={{ maxWidth: "1900px" }}
      >
        <div className="w-full header max-w-7xl mx-auto">
          <p className="text-blue-600 text-3xl font-extrabold">
            <i className="bi bi-person-video3"></i>
            <span className="ml-3">ZoomZest</span>
          </p>
        </div>
        <div className="h-full mt-16">
          <div className="text-content-container md:px-5 max-w-7xl mx-auto flex md:flex-row justify-between flex-col">
            <div className="md:order-1 order-2">
              <div className="text-content md:mt-10 mt-12 flex flex-col md:gap-10 gap-8">
                <p className="sm:text-3xl text-2xl font-semibold text-slate-700 sm:max-w-md text-center md:text-start">
                  Elevate Your Meetings with{" "}
                  <span className="font-extrabold text-slate-800">
                    <span>Zoom</span>
                    <span className="text-pink-600">Zest</span>
                  </span>
                </p>
                <p className="max-w-md sm:text-lg text-slate-600 text-justify md:text-start">
                  Empower your team's collaboration with video conferencing web
                  app. Connect easily, collaborate effortlessly, and make every
                  meeting count, wherever you are.
                </p>
                <p className="sm:text-3xl text-2xl font-semibold text-slate-800 text-center md:text-start">
                  Get Started
                </p>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="w-full max-w-lg flex flex-col gap-3 pb-16 md:pb-0 md:mx-0"
                >
                  <input
                    type="email"
                    placeholder="email"
                    className="px-2 py-1"
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
                    className="px-2 py-1"
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
            </div>
            <div className="h-auto md:order-2 order-1">
              <img src="/landing_hero_img.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
