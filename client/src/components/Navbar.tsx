import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-4 lg:px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <span className="inline-block h-6 w-6 bg-primary rounded-sm"></span>
        <span className="text-lg">MindMap</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Button variant="ghost" asChild size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Sign up</Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/demo">Try Demo</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
