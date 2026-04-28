// import React, { useState, useRef, useCallback } from "react";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./Navbar";
// import Webcam from "react-webcam";

// const LoanApplication = () => {
//   const { register, handleSubmit, reset } = useForm();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [showWebcam, setShowWebcam] = useState(false);
//   const [videoFile, setVideoFile] = useState(null);
//   const webcamRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunks = useRef([]);
//   const nav = useNavigate();

//   const startRecording = useCallback(() => {
//     setShowWebcam(true);
//     recordedChunks.current = [];

//     if (webcamRef.current) {
//       const stream = webcamRef.current.video.srcObject;
//       mediaRecorderRef.current = new MediaRecorder(stream, {
//         mimeType: "video/webm",
//       });

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           recordedChunks.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const videoBlob = new Blob(recordedChunks.current, {
//           type: "video/webm",
//         });
//         const file = new File([videoBlob], "videokyc.webm", {
//           type: "video/webm",
//         });

//         setVideoFile(file);
//         setValue("videokyc", file); // Register video file in react-hook-form
//       };

//       mediaRecorderRef.current.start();
//       setTimeout(() => stopRecording(), 10000); // Stop recording after 10 seconds
//     }
//   }, []);

//   const stopRecording = useCallback(() => {
//     // if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//     //   mediaRecorderRef.current.stop();
//     //   setShowWebcam(false);
//     // }

//     if (webcamRef.current) {
//       webcamRef.current.getScreenshot(); // Just to trigger frame capture
//       setShowWebcam(false);
//     }
//   }, []);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     setMessage("");
//     console.log(data);

//     // const formData = new FormData();
//     // formData.append("name", data.name);
//     // formData.append("dependents", data.dependents);
//     // formData.append("education", data.education);
//     // formData.append("selfEmployed", data.selfEmployed);
//     // formData.append("incomeAnnum", data.incomeAnnum);
//     // formData.append("loanAmount", data.loanAmount);
//     // formData.append("loanTerm", data.loanTerm);
//     // formData.append("cibilScore", data.cibilScore);
//     // formData.append("resedentialAssetValue", data.resedentialAssetValue);
//     // formData.append("commercialAssetValue", data.commercialAssetValue);
//     // formData.append("luxuryAssetValue", data.luxuryAssetValue);
//     // formData.append("bankAssetValue", data.bankAssetValue);
//     // formData.append("debt", data.debt);
//     // formData.append("cibilscoreproof", data.cibilscoreproof[0]); // PDF file

//     try {
//       await axios.post("http://localhost:8000/api/v1/applicant/apply", data, {
//         withCredentials: true,
//       });

//       setMessage("Application submitted successfully!");
//       reset(); // Reset the form
//       nav("/dashboard");
//     } catch (error) {
//       setMessage("Error submitting application.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Navbar login={false} logout={true} signup={false} dashboard={true} />

//       <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//         <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
//           <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
//             Apply for Loan
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 {...register("name")}
//                 placeholder="John Doe"
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* Dependents */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Number of Dependents
//               </label>
//               <input
//                 type="number"
//                 {...register("dependents")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* Education */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Education
//               </label>
//               <select
//                 {...register("education")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               >
//                 <option value="Graduate">Graduate</option>
//                 <option value="Postgraduate">Postgraduate</option>
//                 <option value="Doctorate">Doctorate</option>
//               </select>
//             </div>

//             {/* Self-Employed */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Self-Employed
//               </label>
//               <select
//                 {...register("selfEmployed")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               >
//                 <option value="true">Yes</option>
//                 <option value="false">No</option>
//               </select>
//             </div>

//             {/* Income */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Annual Income (₹)
//               </label>
//               <input
//                 type="number"
//                 {...register("incomeAnnum")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* Loan Amount */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Loan Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 {...register("loanAmount")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* Loan Term */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Loan Term (Years)
//               </label>
//               <input
//                 type="number"
//                 {...register("loanTerm")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* CIBIL Score */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 CIBIL Score
//               </label>
//               <input
//                 type="number"
//                 {...register("cibilScore")}
//                 required
//                 className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//               />
//             </div>

//             {/* Asset Values */}
//             {[
//               "resedentialAssetValue",
//               "commercialAssetValue",
//               "luxuryAssetValue",
//               "bankAssetValue",
//               "debt",
//             ].map((field) => (
//               <div key={field}>
//                 <label className="block text-sm font-medium text-gray-700">
//                   {field.replace(/([A-Z])/g, " $1").trim()} (₹)
//                 </label>
//                 <input
//                   type="number"
//                   {...register(field)}
//                   required
//                   className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//                 />
//               </div>
//             ))}

//             {/* CIBIL Score Proof (PDF) */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 CIBIL Score Proof (PDF)
//               </label>
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 required
//                 className="w-full mt-1 border border-gray-300 rounded-md p-2"
//               />
//             </div>

//             {/* Video KYC */}
//             {/* <div>
//             <label className="block text-sm font-medium text-gray-700">Video KYC (MP4)</label>
//             <input
//               type="file"
//               {...register("videokyc")}
//               accept="video/mp4"
//               required
//               className="w-full mt-1 border border-gray-300 rounded-md p-2"
//             />
//           </div> */}

//             {/* Video KYC */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Video KYC
//               </label>
//               <input type="file" className="hidden" />
//               {showWebcam ? (
//                 <div className="relative">
//                   <Webcam ref={webcamRef} audio={true} />
//                   <button
//                     type="button"
//                     onClick={stopRecording}
//                     className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white py-1 px-3 rounded-md"
//                   >
//                     Stop Recording
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={startRecording}
//                   className="w-full bg-blue-600 text-white py-2 rounded-md"
//                 >
//                   Start KYC
//                 </button>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
//             >
//               {loading ? "Submitting..." : "Apply"}
//             </button>
//           </form>

//           {message && (
//             <p
//               className={`mt-4 text-center text-sm ${
//                 message.includes("Error") ? "text-red-500" : "text-green-600"
//               }`}
//             >
//               {message}
//             </p>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default LoanApplication;

import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const LoanApplication = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    
    try {
      await axios.post("http://localhost:8000/api/v1/applicant/apply", data, {
        withCredentials: true,
      });

      setMessage("Application submitted successfully!");
      reset();
      nav("/dashboard");
    } catch (error) {
      setMessage("Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, type = "text", options, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {type === "select" ? (
        <select
          {...props}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...props}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
        />
      )}
    </div>
  );

  return (
    <>
      <Navbar login={false} logout={true} signup={false} dashboard={true} />

      <div className="min-h-screen py-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900">Apply for Loan</h2>
                <p className="mt-2 text-slate-600">Please fill in your details below</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputField
                  label="Full Name"
                  placeholder="John Doe"
                  {...register("name")}
                  required
                />

                <InputField
                  label="Number of Dependents"
                  type="number"
                  {...register("dependents")}
                  required
                />

                <InputField
                  label="Education"
                  type="select"
                  options={[
                    { value: "Graduate", label: "Graduate" },
                    { value: "Postgraduate", label: "Postgraduate" },
                    { value: "Doctorate", label: "Doctorate" }
                  ]}
                  {...register("education")}
                  required
                />

                <InputField
                  label="Self-Employed"
                  type="select"
                  options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" }
                  ]}
                  {...register("selfEmployed")}
                  required
                />

                <InputField
                  label="Annual Income (₹)"
                  type="number"
                  {...register("incomeAnnum")}
                  required
                />

                <InputField
                  label="Loan Amount (₹)"
                  type="number"
                  {...register("loanAmount")}
                  required
                />

                <InputField
                  label="Loan Term (Years)"
                  type="number"
                  {...register("loanTerm")}
                  required
                />

                <InputField
                  label="CIBIL Score"
                  type="number"
                  {...register("cibilScore")}
                  required
                />

                {[
                  { name: "resedentialAssetValue", label: "Residential Asset Value (₹)" },
                  { name: "commercialAssetValue", label: "Commercial Asset Value (₹)" },
                  { name: "luxuryAssetValue", label: "Luxury Asset Value (₹)" },
                  { name: "bankAssetValue", label: "Bank Asset Value (₹)" },
                  { name: "debt", label: "Debt (₹)" }
                ].map(({ name, label }) => (
                  <InputField
                    key={name}
                    label={label}
                    type="number"
                    {...register(name)}
                    required
                  />
                ))}

                <div className="pt-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition disabled:bg-slate-400"
                    >
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              </form>

              {message && (
                <div className={`text-center text-sm ${
                  message.includes("Error") ? "text-red-600" : "text-green-600"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanApplication;