import React, { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { SessionContext } from "./sessionContext";
import { shouldTrackPath, trackAnalyticsEvent } from "../utils/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();
  const previousPathRef = useRef("");
  const { session } = useContext(SessionContext);

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search || ""}`;
    if (!shouldTrackPath(location.pathname)) {
      previousPathRef.current = currentPath;
      return;
    }

    trackAnalyticsEvent(
      {
        event_type: "page_view",
        page_path: currentPath,
        metadata: {
          previous_path: previousPathRef.current || null,
        },
      },
      { token: session?.accessToken || null },
    );

    previousPathRef.current = currentPath;
  }, [location.pathname, location.search, session?.accessToken]);

  return null;
}
