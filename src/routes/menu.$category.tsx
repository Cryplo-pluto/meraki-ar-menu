import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/menu/$category")({
  component: () => <Outlet />,
});
