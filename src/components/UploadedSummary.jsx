import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

function UploadedSummary() {
  const [files, setFiles] = useState([]);
  const [healthID, setHealthID] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("healthID");
    if (!id) {
      alert("No Health ID found. Please upload a report first.");
      return;
    }
    setHealthID(id);
    fetchReports(id);
  }, []);

  const fetchReports = async (id) => {
    const { data, error } = await supabase
      .from("report_metadata")
      .select("*")
      .eq("health_id", id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error.message);
    } else {
      setFiles(data);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-semibold text-blue-800 mb-4">
        Uploaded Reports
      </h2>

      <p className="text-gray-600 mb-6">
        Showing reports for Health ID:{" "}
        <strong className="text-blue-700">{healthID}</strong>
      </p>

      {files.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file, index) => (
            <li
              key={file.id || index}
              className="border-b pb-4 flex flex-col md:flex-row justify-between md:items-center"
            >
              <div className="flex-1">
                <p className="font-medium">{file.filename}</p>
                <p className="text-sm text-gray-500">
                  Uploaded at:{" "}
                  {new Date(file.uploaded_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-4 mt-2 md:mt-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
                <a
                  href={file.file_url}
                  download
                  className="text-green-600 underline"
                >
                  Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UploadedSummary;
