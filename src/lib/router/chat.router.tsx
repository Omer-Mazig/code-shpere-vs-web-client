import type { RouteObject } from "react-router-dom";
import {
  MessagesEmptyPane,
  MessagesPage,
  MessagesThreadPane,
} from "@/pages/messages-page";
import { RequireAuth } from "@/features/auth/components/require-auth";

export const chatRoutes: RouteObject[] = [
  {
    path: "messages",
    element: (
      <RequireAuth>
        <MessagesPage />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <MessagesEmptyPane />,
      },
      {
        path: ":conversationId",
        element: <MessagesThreadPane />,
      },
    ],
  },
];
