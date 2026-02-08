import { Outlet, Link } from "react-router-dom";
import { Code2 } from "lucide-react";

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <Code2 className="h-8 w-8" />
          CodeSphere
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Where developers share,
            <br />
            learn, and grow together.
          </h1>
          <p className="text-lg opacity-80">
            Join a community of developers sharing knowledge through posts and
            articles.
          </p>
        </div>
        <p className="text-sm opacity-60">
          &copy; {new Date().getFullYear()} CodeSphere
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
