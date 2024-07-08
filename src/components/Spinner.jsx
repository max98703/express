import React from "react";
import "./spinner.css";

const Spinner = () => {
  return (
    <div class="text-center h-100vh spinner-container">
      <div class="spinner-grow spinner-grow-sm text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-secondary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-success" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-danger" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow spinner-grow-sm text-dark" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
