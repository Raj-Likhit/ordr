"use client";

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function PageViewTracker({ productId, vendorId }: { productId: string, vendorId: string }) {
  useEffect(() => {
    // Generate a session ID if one doesn't exist in sessionStorage
    let sessionId = sessionStorage.getItem('ordr_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('ordr_session_id', sessionId);
    }

    // Fire and forget
    fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        vendor_id: vendorId,
        session_id: sessionId
      })
    }).catch(() => { /* ignore tracking errors */ });
  }, [productId, vendorId]);

  return null;
}
