import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 bg-primary rounded-sm"></span>
          <span className="text-lg">MindMap</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/demo">Try Demo</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <div className="w-full max-w-md space-y-6 px-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome</h1>
            <p className="text-muted-foreground">
              Sign in to continue to MindMap
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
