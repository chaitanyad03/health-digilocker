import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase";
import * as QRCode from "qrcode.react";

const UploadReport = () => {
  const [healthId, setHealthId] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [step, setStep] = useState("upload");

  useEffect(() => {
    // Auto-generate or retrieve health ID
    let stored = localStorage.getItem("health_id");
    if (!stored) {
      stored = "HID-" + uuidv4().slice(0, 8).toUpperCase();
      localStorage.setItem("health_id", stored);
    }
    setHealthId(stored);
    fetchReports(stored);
  }, []);

  const fetchReports = async (id) => {
    const { data, error } = await supabase
      .from("report_metadata")
      .select("*")
      .eq("health_id", id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setUploadedFiles(data);
    }
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!healthId || files.length === 0) {
      alert("Select at least one file.");
      return;
    }

    setUploading(true);

    for (const file of files) {
      const path = `${healthId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, file);

      if (uploadError) {
        console.error("❌ Upload error:", uploadError.message);
        alert("Upload failed for file: " + file.name);
        continue;
      }

      const { data: publicURLData } = supabase.storage
        .from("reports")
        .getPublicUrl(path);

      const fileUrl = publicURLData.publicUrl;

      const { error: insertError } = await supabase.from("report_metadata").insert({
        health_id: healthId,
        filename: file.name,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("❌ DB insert error:", insertError.message);
      }
    }

    setUploading(false);
    setFiles([]);
    fetchReports(healthId);
    alert("✅ Upload completed.");
  };

  const handleDelete = async (id, url) => {
    const path = decodeURIComponent(url.split("/storage/v1/object/public/reports/")[1]);

    const { error: storageErr } = await supabase.storage.from("reports").remove([path]);
    if (storageErr) {
      alert("Could not delete from storage.");
      return;
    }

    const { error: dbErr } = await supabase.from("report_metadata").delete().eq("id", id);
    if (dbErr) {
      alert("Could not delete metadata.");
    }

    fetchReports(healthId);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
        Health DigiLocker
      </h1>

      {step === "upload" && (
        <div className="bg-white shadow p-6 rounded space-y-4">
          <div>
            <label className="block mb-1 font-medium">Your Health ID:</label>
            <input
              value={healthId}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload Report(s):</label>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          <div className="flex gap-4 mt-4">
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
              Done
            </button>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div className="mt-6 bg-white shadow p-6 rounded">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Uploaded Reports for {healthId}
          </h2>

          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No reports uploaded yet.</p>
          ) : (
            <ul className="space-y-4">
              {uploadedFiles.map((file, i) => (
                <li key={file.id} className="border-b pb-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p>
                      {i + 1}. <strong>{file.filename}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(file.uploaded_at).toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-3 flex-wrap">
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
                      <button
                        onClick={() => {
                          if (confirm("Delete this report?")) {
                            handleDelete(file.id, file.file_url);
                          }
                        }}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                    {file.filename.endsWith(".pdf") && (
                      <iframe
                        src={file.file_url}
                        className="w-full h-64 mt-4 border"
                        title="PDF Preview"
                      />
                    )}
                  </div>
                  <div>
                    <QRCode value={file.file_url} size={100} />
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
};

export default UploadReport;
