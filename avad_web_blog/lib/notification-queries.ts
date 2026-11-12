"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getJson, patchJson } from "@/lib/http";

import type { NotificationCountResponse } from "@/lib/notification";

export const notificationUnreadCountKey = ["notifications", "unread-count"] as const;
export const contactUnreadCountKey = ["contacts", "unread-count"] as const;

export function useNotificationUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationUnreadCountKey,
    queryFn: async () => (await getJson<NotificationCountResponse>("/api/notifications/unread-count")).unread,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useContactUnreadCount(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: contactUnreadCountKey });
    };
    window.addEventListener("contacts-unread-count-updated", refresh);
    return () => window.removeEventListener("contacts-unread-count-updated", refresh);
  }, [enabled, queryClient]);

  return useQuery({
    queryKey: contactUnreadCountKey,
    queryFn: async () => (await getJson<NotificationCountResponse>("/api/dashboard/contacts/unread-count")).unread,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => patchJson(`/api/notifications/${notificationId}/read`, {}),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationUnreadCountKey });
      const previous = queryClient.getQueryData<number>(notificationUnreadCountKey);
      queryClient.setQueryData(notificationUnreadCountKey, (count: number | undefined) => Math.max(0, (count ?? 0) - 1));
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(notificationUnreadCountKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationUnreadCountKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patchJson("/api/notifications/read-all", {}),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationUnreadCountKey });
      const previous = queryClient.getQueryData<number>(notificationUnreadCountKey);
      queryClient.setQueryData(notificationUnreadCountKey, 0);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(notificationUnreadCountKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationUnreadCountKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}