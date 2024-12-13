import React, { useState, useRef, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../api/api.js";
import useDebounce from "../../hooks/useDebounce.js"; // Import the debounce hook
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ status, Comments, taskId, model=true,fetchTaskDetails }) => {
  const { showAlert } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [imageUrls, setImageUrls] = useState([]); // Added to store image URLs
  const contentEditableRef = useRef(null);
  const commentsEndRef = useRef(null); // Reference to the bottom of the comments section

  const debouncedComment = useDebounce(comment, 500); // Debounce the comment state
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contentEditableRef.current &&
        !contentEditableRef.current.contains(e.target)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    
  }, []);

  // Handle pasting an image and adding it to the comment section
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    let hasImage = false;

    // Loop through clipboard items to check if an image is pasted
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result;
          setImageUrls((prev) => [...prev, imageUrl]);
          insertImageToState(imageUrl);
        };
        reader.readAsDataURL(file);
        hasImage = true;
      }
    }

    // If no image is pasted, allow default pasting (text)
    if (!hasImage) {
      const pastedText = e.clipboardData.getData("Text");
      setComment((prevComment) => prevComment + pastedText);
    }

    // Prevent default action only if an image is pasted
    if (hasImage) {
      e.preventDefault();
    }
  };

  // Add the image URL to the imageUrls state
  const insertImageToState = (imageUrl) => {
    const imageHtml = `<img src="${imageUrl}" alt="Pasted" style="width: 500px; height: 250px; margin-top: 6px;" />`;
    setComment((prevContent) => prevContent + imageHtml);
  };

  // Handle comment submit
  const handleSubmit = async () => {
    if (!comment.trim() && statusFilter === status) {
      // Throw error if comment is empty and status is unchanged
      showAlert("Comment is required when no status change occurs.", "error");
      return; // Prevent submission
    }
  
    try {
      const payload = {
        task_id: taskId,
        comment: comment,
        status: statusFilter,
        images: imageUrls, // Send images along with the comment
      };

      const response = await api.post("/comment", payload);

      const { message } = response.data;
      if (message) {
        showAlert(message, "success");
      }

      // Clear form fields after adding the task
      setComment("");
      setImageUrls([]);
      await fetchTaskDetails(taskId);
    } catch (error) {
      console.error(error);
      showAlert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error creating comment",
        "error"
      );
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setComment(e.currentTarget.innerHTML);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const formatNameToInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(date).toLocaleString("en-GB", options); // en-GB is d-m-y format
  };

  const filteredComments = model == false ?   Comments.filter(comment => comment.type === "comment") || [] : Comments ;
  console.log(filteredComments);

  return (
    <div>
      {/* Increased height for the comment section and scrollability */}
      <div
  className={`comments-section ${model == false ? '' : 'p-4'} example`}
  style={{ height: "calc(100vh - 250px)", overflowY: "auto" }}
>
        {filteredComments.length > 0 ? (
          filteredComments.map((commentData, index) => {
            // Define statusMap outside the map function
            const statusMap = {
              0: { color: "bg-gray-300", text: "Assigned" },
              1: { color: "bg-yellow-300", text: "In Progress" },
              2: { color: "bg-blue-300", text: "Assigned For Review" },
              3: { color: "bg-green-300", text: "Reviewed" },
              4: { color: "bg-blue-300", text: "Completed" },
            };

            // Get the previous and current status based on statusMap
            const prevStatus = statusMap[commentData.previous_status] || {
              color: "bg-gray-300",
              text: "Unknown",
            };
            const currentStatus = statusMap[commentData.current_status] || {
              color: "bg-gray-300",
              text: "Unknown",
            };

            return (
              <div key={index} className="comment-item flex gap-4">
                {/* Profile Section */}
                <div className="flex flex-col items-center mt-4">
                  {commentData.user_logo ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                      <img
                        src={`/image/${commentData.user_logo}`}
                        alt={commentData.user_name}
                        className="rounded-full w-full h-full object-center object-cover cursor-pointer"
                      />
                    </div>
                  ) : (
                    <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      {formatNameToInitials(commentData.user_name)}
                    </span>
                  )}
                  <span className="w-[1px] block bg-gray-300 dark:bg-slate-700 grow mt-2"></span>
                </div>

                {/* Comment Content */}
                <div className="flex flex-col w-full gap-y-5 " >
                  <div className="border border-gray-300 flex grow relative rounded-lg mt-4 w-full bg-white ">
                    <div className="absolute border border-gray-300 bg-gray-100 w-4 h-4 rotate-45 top-3 -left-2 z-10"></div>
                    <div className="z-20 w-full h-full overflow-hidden rounded-lg">
                      <div className="flex justify-between items-center bg-gray-100 py-2 px-3">
                        <div className="flex gap-3">
                          <span className="text-sm">
                            <strong>{commentData.user_name}</strong>
                          </span>
                        </div>

                        <div className="px-1 text-end flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(commentData.created_at), { addSuffix: true })}
                          </span>
                          <button
                            onClick={() =>
                              console.log(`Reply to ${commentData.id}`)
                            }
                            className="text-sm text-blue-500 bg-transparent border px-4 py-1 rounded border-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      {/* Conditional Rendering based on type */}
                      {commentData.type === "comment" ? (
                        <div className="px-3 py-2">
                          <div className="comment-description text-xs">
                            <div
                              className="text-gray-400 text-[12px] break-words"
                              dangerouslySetInnerHTML={{
                                __html: commentData.text,
                              }}
                            ></div>
                          </div>

                          {/* Image attachment (only if images exist) */}
                          {commentData.get_comment_image &&
                            commentData.get_comment_image.length > 0 && (
                              <div className="mt-1">
                                {commentData.get_comment_image.map(
                                  (image, idx) => (
                                    <a
                                      key={idx}
                                      href={`/storage/tasks/${image.name}`}
                                      className="inline-flex items-center px-3 py-1 mb-2 space-x-2 text-sm transition-all border rounded-full hover:bg-primary-100 text-primary-700 border-primary-700"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        role="img"
                                        className="w-3 h-3"
                                        viewBox="0 0 16 16"
                                      >
                                        <g fill="currentColor">
                                          <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71l-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0z" />
                                        </g>
                                      </svg>
                                      <span className="text-[10px]">
                                        {image.name}
                                      </span>
                                    </a>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      ) : commentData.type === "activity" ? (
                        <div className="px-3 py-2">
                          <div className="comment-description text-xs">
                            <p className="text-gray-500 text-[12px]">
                              <div className="flex items-center space-x-1 text-xs">
                                <span>Change status to</span>
                                <span
                                  className={`px-2 py-1 rounded-full text-white  ${currentStatus.color}`}
                                >
                                  {currentStatus.text}
                                </span>
                                <span>from</span>
                                <span
                                  className={`px-2 py-1 rounded-full text-white ${prevStatus.color}`}
                                >
                                  {prevStatus.text}
                                </span>
                              </div>
                            </p>
                          </div>
                        </div>
                      ) : null}{" "}
                      {/* Add more types as needed */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 flex justify-center items-center h-full">
            No comments yet.
          </p>
        )}

        {/* Ref to scroll to the bottom */}
        <div ref={commentsEndRef}></div>
      </div>
{model && (
  <>
   <div className="fixed bottom-0 z-40 w-full bg-blue-50">
        <div
          ref={contentEditableRef}
          contentEditable={true}
          onInput={handleInputChange}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={`h-16 p-2 border-2 border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 overflow-auto mt-2 ml-6 w-11/12 right-6 bottom-0 transition-all ease-in-out duration-300 ${
            isExpanded ? "h-96" : "h-16"
          }`}
          placeholder="Add your comment here..."
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            minHeight: "80px",
          }}
        >
          {/* Render image previews inline */}
          {imageUrls.length > 0 && (
            <div className="mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="inline-block mr-2 mb-2">
                  <img
                    src={url}
                    alt={`pasted-image-${index}`}
                    className="w-full h-60 object-cover border rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-4 right-0 p-2 mr-8 flex z-40 items-center">
          <select
            onChange={handleStatusFilterChange}
            className="border-2 border-gray-100 bg-white rounded-full px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Status</option>
            <option value="0" selected={status === "0"}>
              Open
            </option>
            <option value="1" selected={status === "1"}>
              In Progress
            </option>
            <option value="2" selected={status === "2"}>
              Assigned For Review
            </option>
            <option value="3" selected={status === "3"}>
              Reviewed
            </option>
            <option value="4" selected={status === "4"}>
              Completed
            </option>
            <option value="5" selected={status === "5"}>
              Closed
            </option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-32 px-4 py-2 ml-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
      </div>
  </>
)}
    </div>
  );
};

export default Comment;
