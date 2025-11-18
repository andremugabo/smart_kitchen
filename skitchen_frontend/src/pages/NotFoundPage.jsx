import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell, Button } from "../components";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Page not found"
      subtitle="The page you are looking for doesn’t exist or has been moved."
    >
      <div className="text-center space-y-6">
        <div>
          <p className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">
            404
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Let’s get you back to a safe place.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={() => navigate("/")}>
            Go to login
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>
      </div>
    </AuthShell>
  );
};

export default NotFoundPage;