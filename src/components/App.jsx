import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../supabase"; // ✅ Update path if needed

function App() {
  const [healthId, setHealthId] = useState("");
  const [enteredId, setEnteredId] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("init"); // 'init' | 'upload' | 'summary'

  useEffect(() => {
    const saved = localStorage.getItem("health_id");
    if (saved) {
      setHealthId(saved);
      fetchFiles(saved);
    }
  }, []);

  const generateHealthId = () => {
    const newId = uuidv4();
    setHealthId(newId);
    localStorage.setItem("health_id", newId);
    setStep("upload");
  };

  const confirmExistingId = () => {
    if (enteredId.trim()) {
      setHealthId(enteredId.trim());
      localStorage.setItem("health_id", enteredId.trim());
      fetchFiles(enteredId.trim());
      setStep("upload");
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      alert("You can upload a maximum of 5 files at a time.");
      return;
    }
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (!healthId) {
      alert("Please enter or generate a Health ID first.");
      return;
    }

    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploading(true);

    for (let file of files) {
      const filePath = `${healthId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("File upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("reports")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from("report_metadata").insert({
        health_id: healthId,
        filename: file.name,
        file_url: publicUrl,
        uploaded_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Insert error:", dbError.message);
        alert("Failed to save metadata.");
      }
    }

    setUploading(false);
    setFiles([]);
    fetchFiles(healthId);
  };

  const fetchFiles = async (id) => {
    const { data, error } = await supabase
      .from("report_metadata")
      .select("*")
      .eq("health_id", id)
      .order("uploaded_at", { ascending: false });

    if (!error) {
      setUploadedFiles(data);
    }
  };

  const handleDelete = async (id, url) => {
    const path = decodeURIComponent(
      url.split("/storage/v1/object/public/reports/")[1]
    );
    await supabase.storage.from("reports").remove([path]);
    await supabase.from("report_metadata").delete().eq("id", id);
    fetchFiles(healthId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Health DigiLocker
      </h1>

      {/* Step 1: Choose or Enter Health ID */}
      {step === "init" && (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
          <button
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
            onClick={generateHealthId}
          >
            I'm a New User – Generate Health ID
          </button>

          <div className="text-center text-gray-500">or</div>

          <div>
            <input
              type="text"
              value={enteredId}
              onChange={(e) => setEnteredId(e.target.value)}
              placeholder="Enter your Health ID"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <button
              onClick={confirmExistingId}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Access My Files
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload View */}
      {step === "upload" && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
          <div>
            <p className="text-blue-600 font-medium mb-2">Your Health ID:</p>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              value={healthId}
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Select Reports (PDF, Images):</label>
            <input type="file" multiple onChange={handleFileChange} />
            <p className="text-sm text-gray-500 mt-1">
              You can upload up to 5 files at once.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={() => setStep("summary")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              View All Files
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Summary View */}
      {step === "summary" && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6">
          <h3 className="text-xl font-bold mb-4 text-blue-800">
            Uploaded Reports for ID: {healthId}
          </h3>
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No files found.</p>
          ) : (
            <ul className="space-y-6">
              {uploadedFiles.map((file, i) => (
                <li
                  key={file.id}
                  className="border-b pb-4 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{i + 1}. {file.filename}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <a href={file.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        View
                      </a>
                      <a href={file.file_url} download className="text-green-600 underline">
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(file.id, file.file_url)}
                        className="text-red-500 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div>
                    <QRCodeCanvas value={file.file_url} size={100} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <button
              onClick={() => setStep("upload")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
