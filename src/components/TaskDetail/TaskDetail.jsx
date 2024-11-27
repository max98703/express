import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Activity from "../PullRequest/Activity.jsx";
import api from "../../api/api.js";

const Detail = () => {
  const { id } = useParams(); // Retrieve the task ID from URL
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/tasks/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setTaskDetails(data); // Store task details in state
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch task details");
        console.error(err);
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  return (
    <Activity>
    <div className="overflow-x-auto example mt-4 ">
      <div className=" mt-16 text-blue-100">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis quasi fugit provident est vero officiis, harum quia aspernatur, dolore sapiente voluptates inventore natus commodi laudantium? Illo delectus alias dolorum aspernatur aut dolor recusandae qui.
        </div>
        </div>
        </Activity>
  );
};

export default Detail;
