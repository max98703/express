import React, { useState, useRef, useEffect } from "react";

const NoteApp = () => {
  const [notes, setNotes] = useState([]);  // List of all saved notes
  const [content, setContent] = useState("");  // State to hold the current note content
  const [textColor, setTextColor] = useState("#000000");  // State for text color
  const [backgroundColor, setBackgroundColor] = useState("#f8f9fa");  // State for background color
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to control modal visibility
  const [editingNote, setEditingNote] = useState(null);  // State to keep track of editing note
  const [activeNote, setActiveNote] = useState(null);  // State to keep track of the active note

  const textAreaRef = useRef(null);  // Reference for text area

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes"));
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        insertImageToContent(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle paste event for images
  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData.items;
    for (let item of clipboardItems) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          insertImageToContent(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Insert image into the content
  const insertImageToContent = (imageUrl) => {
    const imageHtml = `<img src="${imageUrl}" alt="Pasted" style="max-width:100%;margin-top:8px;" />`;
    setContent((prevContent) => prevContent + imageHtml);
  };

  // Handle content change
  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  // Handle save or update note
  const handleSaveNote = () => {
    const newNote = {
      content: content,
      textColor: textColor,
      backgroundColor: backgroundColor,
    };

    if (editingNote !== null) {
      // Update existing note
      const updatedNotes = notes.map((note, index) =>
        index === editingNote ? newNote : note
      );
      setNotes(updatedNotes);
    } else {
      // Add new note
      setNotes([...notes, newNote]);
    }

    // Close the modal and reset states
    setIsModalOpen(false);
    setContent("");
    setTextColor("#000000");
    setBackgroundColor("#f8f9fa");
    setEditingNote(null);
  };

  // Open modal for adding new note or editing an existing one
  const openModal = (noteIndex = null) => {
    if (noteIndex !== null) {
      setEditingNote(noteIndex);
      const noteToEdit = notes[noteIndex];
      setContent(noteToEdit.content);
      setTextColor(noteToEdit.textColor);
      setBackgroundColor(noteToEdit.backgroundColor);
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setContent("");
    setTextColor("#000000");
    setBackgroundColor("#f8f9fa");
    setEditingNote(null);
  };

  const truncateContent = (content) => {
    const words = content.split(" ");
    if (words.length > 100) {
      return words.slice(0, 100).join(" ") + "...";
    }
    return content;
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, noteIndex) => noteIndex !== index);
    setNotes(updatedNotes);
  };

  return (
    <div className="container mx-auto  h-[70vh] example">
      {/* Floating Add Note Button */}
      <button
        onClick={() => openModal()}
        className="fixed bottom-6 right-6 bg-green-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 "
      >
        +
      </button>

      {/* Notes Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {notes.map((note, index) => (
          <div
            key={index}
            className={`p-4  w-80 h-60 rounded-lg shadow-md relative ${
              activeNote === index ? "border-b-4 border-blue-500 transition-all" : ""
            }`}
            style={{
              backgroundColor: note.backgroundColor,
              color: note.textColor,
            }}
            onClick={() => setActiveNote(index)}
          >
            <button
              onClick={() => handleDeleteNote(index)}
              className="absolute top-0 left-0 text-white rounded-full"
            >
              ✖️
            </button>

            {/* Star Icon (Optional) */}
            <span className="absolute top-0 right-0 text-xl text-gray-500">
              ⭐
            </span>

            {/* Note Content */}
            <div
              dangerouslySetInnerHTML={{ __html: truncateContent(note.content) }}
              className="text-sm overflow-hidden h-[100px] leading-relaxed"
            ></div>

            {/* Edit Button */}
            <button
              onClick={() => openModal(index)}
              className="mt-4 bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 block mx-auto"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Modal for adding/editing notes */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 flex justify-center items-center">
    <div className="bg-white rounded-lg p-4 w-[50vw] h-[90vh] relative overflow-auto shadow-lg">
      
      {/* Top-right icons and buttons */}
      <div className="absolute top-2 right-4 flex items-center gap-4">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="bg-red-100 text-white p-2 rounded-full shadow hover:bg-red-600 flex items-center justify-center"
        >
          ❌
        </button>

        {/* Text Color Icon */}
        <label className="cursor-pointer">
          <span className="bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300">
            🎨
          </span>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="hidden"
          />
        </label>

        {/* Background Color Icon */}
        <label className="cursor-pointer">
          <span className="bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300">
            🖌️
          </span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="hidden"
          />
        </label>

        {/* Image Upload Icon */}
        <label className="cursor-pointer">
          <span className="bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300">
            📷
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Save Button Icon */}
        <button
          onClick={handleSaveNote}
          className="bg-green-500 text-white p-2 rounded-full shadow hover:bg-green-600 flex items-center justify-center"
        >
          💾
        </button>
      </div>

      {/* Text Area with pasted image support */}
      <div
        className="w-full h-full example border rounded-lg p-1 overflow-auto "
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <div
          ref={textAreaRef}
          contentEditable
          onInput={(e) => {
            setContent(e.currentTarget.innerHTML);
          }}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: content }}
          className="w-full h-full outline-none"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: textColor,
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            minHeight: "150px",
            padding: "8px",
          }}
        ></div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default NoteApp;
