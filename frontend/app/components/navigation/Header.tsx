import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import Notifications from "./Notifications";

const Header = () => {
  const { pathname } = useLocation();
  const { data: session } = authClient.useSession();

  const pageTitle = pathname.split("/").includes("profile")
    ? "Profile"
    : pathname.split("/").pop();

  return (
    <header
      className="flex h-16 items-center gap-2 border-b w-full px-3"
      role="banner"
    >
      <SidebarTrigger
        className="size-9"
        aria-label="Toggle sidebar navigation"
      />
      <Separator
        orientation="vertical"
        role="presentation"
        aria-hidden="true"
      />
      <div className="flex justify-between w-full">
        <div className="flex flex-col space-y-0.5">
          <h1 className="capitalize font-bold text-lg" id="page-title">
            {pageTitle}
          </h1>
          <p
            className="text-sm text-muted-foreground"
            id="welcome-message"
            aria-live="polite"
            aria-atomic="true"
          >
            Welcome back, {session?.user.role === "doctor" ? "Dr. " : ""}
            {session?.user.name}
          </p>
        </div>
        <nav
          className="flex gap-2 items-center"
          aria-label="Header actions"
        >
          <Separator
            orientation="vertical"
            role="presentation"
            aria-hidden="true"
          />
          <ThemeToggle />
          <Separator
            orientation="vertical"
            role="presentation"
            aria-hidden="true"
          />
          {session?.user && <Notifications user={session?.user} />}
          <Separator
            orientation="vertical"
            role="presentation"
            aria-hidden="true"
          />
          <Link
            to={`/profile/${session?.user.id}`}
            className={
              buttonVariants({
                variant: "ghost",
              }) + " flex items-center gap-2 rounded-lg px-2 py-6"
            }
            aria-label={`View profile for ${session?.user.name}`}
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={session?.user.image || ""}
                alt=""
                role="presentation"
              />
              <AvatarFallback
                className="rounded-lg text-primary"
                aria-hidden="false"
              >
                {session?.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold">{session?.user.name}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {session?.user.role}
              </span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
