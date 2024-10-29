import React, { useState, useEffect, useRef } from "react";
import socket from "./socket";
import Callee from "./Callee";
import api from "../../api/api";
const DropCallIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-red-500 cursor-pointer hover:text-red-700 transition duration-200"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 17l3 3 7-7M17 14l3 3 3-3-3-3-3 3z"
    />
  </svg>
);

const Videocall = ({ user, data }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [callAccept, setCall] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [streamReady, setStreamReady] = useState(false); // New state to track stream readiness

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);

  let peerConnection;

  useEffect(() => {
    // Set up socket events
    socket.on("call_accepted", () => {
      console.log("Call accepted");
      setCall(true);
      setIsCalling(false);
    });

    socket.on("call_declined", () => {
      console.log("Call declined");
      setIsRinging(false);
      setIsCalling(false);
      dropCall();
      alert("The user declined your call.");
    });

    socket.on("ice_candidate", ({ candidate }) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("call_accepted");
      socket.off("call_declined");
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      setStreamReady(true); // Set stream ready when localStream is set
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const startVideoCall = async (calleeId) => {
    peerConnection = new RTCPeerConnection();

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      setIsRinging(false);
    };

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(localStream);
      setIsCalling(true);
      setIsRinging(true);

      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("call_user", { sender_id: data["user_id"], calleeId });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera and microphone. Please allow access.");
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", { candidate: event.candidate, calleeId });
      }
    };
  };
  const captureImage = async () => {
    console.log("Canvas Ref:", canvasRef.current);
    console.log("Local Video Ref:", localVideoRef.current);
    console.log("Stream Ready:", streamReady);

    if (localVideoRef.current && canvasRef.current && streamReady) {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        stopWebcam(); // Assuming this stops the webcam

        // Send the image to the server
        try {
          // Convert the base64 image data URL to a Blob
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();

          // Create FormData and append the Blob
          const formData = new FormData();
          formData.append("myImage", blob, "captured-image.jpg"); // Append the blob as a file

          // Make the POST request to upload the image
          await api.post("/uploada", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else {
        console.log("Conditions for capturing image not met.");
      }
    }
  };

  const stopWebcam = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setStreamReady(false); // Reset stream readiness
    }
  };

  const dropCall = () => {
    // Close peer connection and reset states
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIsRinging(false);
  };

  return (
    <>
      <div onClick={() => startVideoCall(user.id)}>start video call </div>
      {isCalling && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 p-4">
          {/* Conditionally render ringing or video elements */}
          {isCalling && (
            <div className="flex flex-col items-center justify-center bg-gray-900 p-8 w-full h-full pt-44 rounded-md shadow-lg">
              <h2 className="text-xl text-white mb-4">Ringing...</h2>
              <p className="text-gray-400 ">
                Waiting for {user.username} to answer...
              </p>
              <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
              <button onClick={captureImage}>Capture Image</button>
              <div className="absolute top-20 right-40" onClick={dropCall}>
                <DropCallIcon />
              </div>
              <div className="w-40 h-40 pt-20 rounded-lg shadow-md">
                <video
                  autoPlay
                  ref={localVideoRef}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          {/* Render video elements only if calling */}
          {callAccept && (
            <div className="flex flex-col items-center mt-4">
              <h2 className="text-white mb-2">Video Call In Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <video
                  autoPlay
                  ref={localVideoRef}
                  className="border-2 border-blue-600 rounded-md w-64 h-48"
                />
                <video
                  autoPlay
                  ref={remoteVideoRef}
                  className="border-2 border-blue-600 rounded-md w-64 h-48"
                />
              </div>
            </div>
          )}
        </div>
      )}
      <Callee data={data} />
    </>
  );
};

export default Videocall;
