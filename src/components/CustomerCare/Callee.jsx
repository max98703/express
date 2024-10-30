import React, { useState, useEffect } from "react";
import socket from "./socket";

const Callee = ({ data }) => {
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);

  useEffect(() => {
    // Listen for incoming call event
    socket.on("incoming_call", ({ id, from }) => {
      setIsReceivingCall(true);
      setCaller({ id: id, sender_id: from });
    });

    return () => {
      socket.off("incoming_call");
    };
  }, []);

  const answerCall = () => {
    setIsReceivingCall(false);
    socket.emit("accept_call", { callerId: caller.id });
    // Start the video call logic here (you can integrate your video call function)
  };

  const declineCall = () => {
    setIsReceivingCall(false);
    console.log(caller.sender_id);
    socket.emit("decline_call", { callerId: caller.sender_id });
  };

  return (
    <>
      {isReceivingCall && (
        <div className="flex flex-col items-center justify-center bg-gray-800 p-4">
          <h2 className="text-white mb-4">{caller.name} is calling you...</h2>
          <div className="flex gap-4">
            <button
              onClick={answerCall}
              className="bg-green-500 p-2 rounded-lg"
            >
              Answer
            </button>
            <button onClick={declineCall} className="bg-red-500 p-2 rounded-lg">
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Callee;
