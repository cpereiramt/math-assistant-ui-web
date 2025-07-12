import React from "react";

const LoginWithGoogle = () => {
  const handleLogin = () => {
    // Trigger your OAuth flow here
    window.location.href = "/auth/google"; // or call a function from your auth client
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Login with Google
        </h1>

        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-17.4-1.6-34-4.7-50.2H272v95h147.3c-6.4 34.7-25.5 64.1-54.5 83.5v68h88c51.4-47.4 80.7-117.3 80.7-196.3z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c73.6 0 135.4-24.4 180.6-66.4l-88-68c-24.4 16.4-55.5 26-92.6 26-71 0-131.2-47.9-152.7-112.3h-90.4v70.6C77.2 477 167.5 544.3 272 544.3z"
            />
            <path
              fill="#FBBC05"
              d="M119.3 323.6c-5.4-16.4-8.4-34-8.4-52s3-35.6 8.4-52V149h-90.4C10.3 195.7 0 242.5 0 291.6s10.3 95.9 28.9 139.5l90.4-70.6z"
            />
            <path
              fill="#EA4335"
              d="M272 108.7c39.9 0 75.7 13.8 103.8 40.8l77.8-77.8C407.4 25.5 345.6 0 272 0 167.5 0 77.2 67.3 28.9 163.1l90.4 70.6C140.8 156.6 201 108.7 272 108.7z"
            />
          </svg>
          Login with Google to access formulas
        </button>
      </div>
    </div>
  );
};

export default LoginWithGoogle;