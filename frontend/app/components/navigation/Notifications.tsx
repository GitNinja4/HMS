import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, UserPlus, Activity, AlertCircle, FileText } from "lucide-react";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { fetchNotifications, markAsRead } from "@/lib/api";
import type { User } from "better-auth";
import type { Notification } from "@/types";

export default function Notifications({ user }: { user: User }) {
  // 1. Fetch Notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", user.id],
    queryFn: fetchNotifications,
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 mins
  });

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount: number = data?.unreadCount || 0;

  // 2. Mutation to Mark as Read
  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // Refresh the list to update the unread count badge instantly
      refetch();
    },
  });

  // Helper to choose the right icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <UserPlus className="h-4 w-4 text-indigo-500" aria-hidden="true" />;
      case "lab_result":
        return <Activity className="h-4 w-4 text-blue-500" aria-hidden="true" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <Bell
            className="size-[1.2rem] text-slate-600 dark:text-slate-300"
            aria-hidden="true"
          />

          {/* Unread Badge with Ping Animation */}
          {unreadCount > 0 && (
            <span
              className="absolute top-0.5 right-0 size-4 bg-primary rounded-full flex items-center justify-center"
              aria-label={`${unreadCount} unread notifications`}
            >
              <span className="text-[10px] text-white font-bold">
                {unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 shadow-xl rounded-xl"
        role="menu"
        aria-label="Notifications menu"
      >
        <DropdownMenuLabel
          className="p-4 pb-2 flex justify-between items-center"
          role="heading"
          aria-level={2}
        >
          <span className="font-bold">Notifications</span>
          {unreadCount > 0 && (
            <span
              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
              aria-live="polite"
            >
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" role="presentation" />
        <div className="max-h-[60vh] overflow-y-auto" role="region" aria-label="Notification list">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500" role="status">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="p-8 text-center text-sm text-slate-500 flex flex-col items-center"
              role="status"
            >
              <Bell
                className="h-8 w-8 text-slate-200 mb-2"
                aria-hidden="true"
              />
              You're all caught up!
            </div>
          ) : (
            <DropdownMenuGroup role="group">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif._id}
                  className={cn(
                    "p-4 border-b last:border-0 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900 transition-colors",
                    !notif.isRead
                      ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                      : "",
                  )}
                  onClick={() => {
                    // Mark as read when clicked
                    if (!notif.isRead) readMutation.mutate(notif._id);
                  }}
                  asChild
                >
                  {/* Link wrapper allows the user to click and navigate */}
                  <Link
                    to={notif.link || "#"}
                    className="flex items-start gap-3 w-full"
                  >
                    <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full border shadow-sm shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          !notif.isRead
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {/* Unread Indicator Dot */}
                    {!notif.isRead && (
                      <div className="h-2 w-2 bg-indigo-600 rounded-full mt-2 shrink-0" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs text-indigo-600 hover:text-indigo-700 h-8"
                onClick={() => {
                  // Mark all as read by sending multiple requests (could be optimized with a batch endpoint)
                  notifications.forEach((notif) => {
                    if (!notif.isRead) readMutation.mutate(notif._id);
                  });
                }}
                disabled={unreadCount === 0 || readMutation.isPending}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
