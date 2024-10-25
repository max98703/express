import React, { useState, useEffect, useRef } from 'react';
import socket from './socket';
import Callee from './Callee';

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
  
const Videocall = ({ user , data}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false); // New state for ringing
  const [callAccept, setCall] = useState(false); // New state for ringing
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  let peerConnection;

  useEffect(() => {
    socket.on('call_accepted', () => {
        console.log('Call accepted');
        setCall(true);
        setIsCalling(false);
        console.log(!isRinging);
      });
  
      socket.on('call_declined', () => {
        console.log('Call declined');
        setIsRinging(false);
        setIsCalling(false); // End the call
        dropCall();
        alert('The user declined your call.');
      });
  
      socket.on('ice_candidate', ({ candidate }) => {
        console.log('max',candidate);
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
      
    return () => {
        socket.off('call_accepted');
        socket.off('call_declined');
    };
  }, []);

  const startVideoCall = async (calleeId) => {
    peerConnection = new RTCPeerConnection();
  
    // Set up the ontrack event before sending the offer
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      setIsRinging(false); // Stop ringing when remote stream is received
    };
  
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(localStream);
      setIsCalling(true);
      setIsRinging(true); // Set ringing state
  
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      socket.emit('call_user', { sender_id: data['user_id'], calleeId });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera and microphone. Please allow access.');
    }
  
    // Handle ICE candidates after sending the offer
    peerConnection.onicecandidate = (event) => {
        console.log('max',event.candidate);
      if (event.candidate) {
        socket.emit('ice_candidate', { candidate: event.candidate, calleeId });
      }
    };
  };
  
  const dropCall = () => {
    // Close peer connection and reset states
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIsRinging(false);
  };

  useEffect(() => {
    // Set local stream to video element
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    // Set remote stream to video element
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <>
    
    <div onClick={() => startVideoCall(user.id)} >start video call </div>
    {isCalling &&(

    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 p-4">


      {/* Conditionally render ringing or video elements */}
      { isCalling  && (
        <div className="flex flex-col items-center justify-center bg-gray-900 p-8 w-full h-full pt-44 rounded-md shadow-lg">
          <h2 className="text-xl text-white mb-4">Ringing...</h2>
          <p className="text-gray-400 ">Waiting for {user.username} to answer...</p>
          <div  className="absolute top-20 right-40" onClick={dropCall}>
            <DropCallIcon />
          </div>
          <div className='w-40 h-40 pt-20 rounded-lg shadow-md'>
          <video 
              autoPlay 
              ref={localVideoRef} 
            className='rounded-lg shadow-md'
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
    <Callee data={data}/>
    </>
  );
};

export default Videocall;
