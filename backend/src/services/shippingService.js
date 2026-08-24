/**
 * Shipping rate calculator
 * Origin: Alwal, Hyderabad — 500010
 * Based on India Post official tariffs for 3kg parcel including 18% GST
 */

// ── Zone definitions ─────────────────────────────────────────────────────
// Each entry is [prefixStart, prefixEnd, zone]
// Pincode prefix = first 3 digits
const ZONE_RULES = [
  // LOCAL — Hyderabad / Rangareddy / Medchal / Sangareddy districts
  { min: 500, max: 502, zone: 'local' },
  { min: 508, max: 509, zone: 'local' },

  // ZONE A — Rest of Telangana + nearby AP
  { min: 503, max: 507, zone: 'A' },
  { min: 510, max: 535, zone: 'A' }, // AP — Kurnool, Guntur, Krishna, Godavari, Vizag
  { min: 560, max: 560, zone: 'A' }, // Border Karnataka

  // ZONE B — Karnataka, Tamil Nadu, Maharashtra, Odisha, Goa
  { min: 400, max: 445, zone: 'B' }, // Maharashtra
  { min: 403, max: 403, zone: 'B' }, // Goa
  { min: 561, max: 591, zone: 'B' }, // Karnataka (rest)
  { min: 600, max: 643, zone: 'B' }, // Tamil Nadu
  { min: 751, max: 770, zone: 'B' }, // Odisha

  // ZONE C — Delhi, UP, MP, Gujarat, Rajasthan, WB, Kerala, Chhattisgarh
  { min: 110, max: 110, zone: 'C' }, // Delhi
  { min: 200, max: 285, zone: 'C' }, // Uttar Pradesh
  { min: 450, max: 488, zone: 'C' }, // Madhya Pradesh
  { min: 360, max: 396, zone: 'C' }, // Gujarat
  { min: 302, max: 345, zone: 'C' }, // Rajasthan
  { min: 700, max: 743, zone: 'C' }, // West Bengal
  { min: 670, max: 695, zone: 'C' }, // Kerala
  { min: 490, max: 497, zone: 'C' }, // Chhattisgarh

  // ZONE D — Punjab, Haryana, HP, J&K, Bihar, Jharkhand, NE, Uttarakhand, Assam, Ladakh
  { min: 140, max: 160, zone: 'D' }, // Punjab
  { min: 121, max: 136, zone: 'D' }, // Haryana
  { min: 170, max: 177, zone: 'D' }, // Himachal Pradesh
  { min: 180, max: 194, zone: 'D' }, // J&K + Ladakh
  { min: 800, max: 855, zone: 'D' }, // Bihar
  { min: 814, max: 835, zone: 'D' }, // Jharkhand
  { min: 246, max: 263, zone: 'D' }, // Uttarakhand
  { min: 781, max: 799, zone: 'D' }, // Assam + NE
  { min: 737, max: 737, zone: 'D' }, // Sikkim
  { min: 744, max: 744, zone: 'D' }, // Andaman
  { min: 682, max: 682, zone: 'D' }, // Lakshadweep
];

// ── Rate table (3kg, incl. 18% GST, rounded) ────────────────────────────
const RATES = {
  local: { speedPost: 95,  registeredParcel: 65  },
  A:     { speedPost: 130, registeredParcel: 106 },
  B:     { speedPost: 202, registeredParcel: 154 },
  C:     { speedPost: 254, registeredParcel: 208 },
  D:     { speedPost: 308, registeredParcel: 260 },
};

const ZONE_LABELS = {
  local: 'Local (Hyderabad)',
  A: 'Zone A — Telangana & nearby AP',
  B: 'Zone B — Karnataka, TN, Maharashtra, Odisha',
  C: 'Zone C — Delhi, UP, Gujarat, WB, Kerala',
  D: 'Zone D — Punjab, Bihar, Northeast, J&K',
};

const DELIVERY_DAYS = {
  local: { speedPost: '1–2', registeredParcel: '3–5' },
  A:     { speedPost: '2–3', registeredParcel: '5–7' },
  B:     { speedPost: '3–4', registeredParcel: '7–10' },
  C:     { speedPost: '4–5', registeredParcel: '10–14' },
  D:     { speedPost: '5–7', registeredParcel: '12–18' },
};

/**
 * Get shipping zone from pincode
 * @param {string|number} pincode
 * @returns {{ zone: string, label: string } | null}
 */
function getZone(pincode) {
  const pin = String(pincode).trim();
  if (!/^\d{6}$/.test(pin)) return null;

  const prefix = parseInt(pin.substring(0, 3), 10);

  // Check from most specific (local) outward
  for (const rule of ZONE_RULES) {
    if (prefix >= rule.min && prefix <= rule.max) {
      return { zone: rule.zone, label: ZONE_LABELS[rule.zone] };
    }
  }

  // Default fallback for unknown pincodes — assume Zone C
  return { zone: 'C', label: 'Zone C (estimated)' };
}

/**
 * Get full shipping rates for a pincode
 * @param {string|number} pincode
 * @returns {{ zone, label, speedPost, registeredParcel, deliveryDays } | null}
 */
function getShippingRates(pincode) {
  const zoneInfo = getZone(pincode);
  if (!zoneInfo) return null;

  const { zone, label } = zoneInfo;
  const rates = RATES[zone];
  const days = DELIVERY_DAYS[zone];

  return {
    pincode: String(pincode).trim(),
    zone,
    label,
    speedPost: {
      price: rates.speedPost,
      deliveryDays: days.speedPost,
      name: 'Speed Post',
      description: `India Post Speed Post · ${days.speedPost} business days`,
    },
    registeredParcel: {
      price: rates.registeredParcel,
      deliveryDays: days.registeredParcel,
      name: 'Registered Parcel',
      description: `India Post Registered Parcel · ${days.registeredParcel} business days`,
    },
  };
}

module.exports = { getShippingRates, getZone, RATES, ZONE_LABELS };
