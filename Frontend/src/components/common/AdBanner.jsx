import * as React from "react";
import { axiosFetchInstance } from "../../Axios";

// Shared cache so we only fetch once per page load
let cachedPlacements = null;
let fetchPromise = null;

const fetchPlacements = () => {
  if (cachedPlacements) return Promise.resolve(cachedPlacements);
  if (!fetchPromise) {
    // Use the base axiosFetchInstance but call a public endpoint
    fetchPromise = axiosFetchInstance
      .get("/ads/placements/")
      .then((res) => {
        cachedPlacements = res.data;
        return cachedPlacements;
      })
      .catch(() => {
        fetchPromise = null; // allow retry on next render
        return [];
      });
  }
  return fetchPromise;
};

/**
 * AdBanner — renders the Google AdSense unit for a given placement location.
 *
 * Props:
 *   location: 'banner_top' | 'between_products' | 'product_page_mid'
 *   style: optional inline styles for the wrapper
 */
const AdBanner = ({ location, style = {} }) => {
  const [placement, setPlacement] = React.useState(null);
  const adRef = React.useRef(null);
  const pushed = React.useRef(false);

  React.useEffect(() => {
    fetchPlacements().then((placements) => {
      const match = placements.find((p) => p.location === location);
      if (match) setPlacement(match);
    });
  }, [location]);

  React.useEffect(() => {
    if (!placement || pushed.current) return;
    try {
      // Push the ad after a short delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }, 100);
      return () => clearTimeout(timer);
    } catch (e) {
      // adsbygoogle not loaded yet (e.g. local dev) — silently ignore
    }
  }, [placement]);

  if (!placement) return null;

  return (
    <div
      style={{
        textAlign: "center",
        margin: "1rem auto",
        overflow: "hidden",
        ...style,
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={placement.client_id}
        data-ad-slot={placement.slot_id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
