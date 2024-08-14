import { useEffect } from "react";
import  * as PusherPushNotifications from "@pusher/push-notifications-web";

const usePusherBeams = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const beamsClient = new PusherPushNotifications.Client({
      instanceId: "12effc35-a27f-4fd4-ba62-1812b323b16c",
    });

    beamsClient
      .start()
      .then(() => beamsClient.addDeviceInterest(userId))
      .then(() => console.log("Successfully registered and subscribed!"))
      .catch(console.error);

    return () => {
      beamsClient.stop();
    };
  }, [userId]); // Re-run when userId changes
};

export default usePusherBeams;
