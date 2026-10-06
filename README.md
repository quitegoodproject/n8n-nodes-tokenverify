# n8n-nodes-tokenverify

[![npm version](https://img.shields.io/npm/v/n8n-nodes-tokenverify.svg)](https://www.npmjs.com/package/n8n-nodes-tokenverify)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-EA4B71.svg)](https://n8n.io)

An official n8n community node for [TokenVerify](https://tokenverifyapi.com). Run **sub-50ms European VAT & Tax ID checksum validation, disposable email detection, and B2B fraud scoring** directly inside your automation workflows.

---

## ⚡ Why Use TokenVerify in n8n?

B2B checkouts, quote generators, and high-value lead funnels get spammed by disposable burner emails, invalid VAT registrations, and VoIP fraud. TokenVerify protects your business pipelines before triggering expensive downstream actions:

* **30-Country Deterministic VAT Checksums**: Instant mathematical checksum validation (ISO 7064, Modulo 97, Modulo 89) for all 27 EU member states, UK VAT, and AU ABN without slow external government API timeouts.
* **Disposable & Spam Trap Detection**: Real-time screening against 80,000+ temporary email domains and disposable MX records.
* **Carrier & Telco Risk Scoring**: Identifies VoIP virtual numbers, landlines, and toll-fraud vectors.
* **Instant B2B Lead Scoring**: Outputs a unified `trust_score` (0–100) and `verdict` (`ALLOW`, `REVIEW`, `REJECT`) for seamless routing.
* **Zero Runtime Dependencies**: The node has zero external runtime dependencies (`dependencies: {}`), ensuring instant startup and rock-solid stability in cloud and self-hosted n8n instances.

---

## 📦 Installation

### Via n8n Community Nodes (Recommended)
1. In your n8n workspace, navigate to **Settings** > **Community Nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-tokenverify` in the **npm package name** field.
4. Agree to the risks of installing community packages and click **Install**.

### Via Docker / Self-Hosted CLI
In your n8n root directory (or container custom directory):
```bash
npm install n8n-nodes-tokenverify
```

---

## 🔑 Authentication & Pricing

TokenVerify works immediately with **zero configuration**:

* **Anonymous Free Tier**: 50 free verifications per IP out of the box (leave credentials empty).
* **Developer Tier**: Enter your developer work email in credentials to unlock 100 free verifications (no credit card required).
* **Production API Key**: For production pipelines and higher volume:
  * **Starter / Builder ($29/mo)**: 10,000 verifications / month. [Subscribe here](https://tokenverifyapi.com/#pricing)
  * **Pro ($79/mo)**: 50,000 verifications / month.
  * **Agency ($149/mo)**: 200,000 verifications / month.

To configure credentials in n8n:
1. Go to **Credentials** > **New Credential**.
2. Search for **TokenVerify API**.
3. Enter your **API Key** (or enter your **Developer Email** for free tier scaling).

---

## 🚀 Node Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **Business Email** | String | Yes | Lead or customer email address to inspect for disposable domains and MX health. |
| **VAT / Tax Registration Number** | String | No | Tax ID string to validate (e.g. `DE811123456`, `GB123456789`). |
| **Two-Letter Country Code** | String | No | ISO country code (e.g. `DE`, `GB`, `FR`) to anchor tax jurisdiction. |
| **Phone Number (E.164)** | String | No | International phone number (e.g. `+447911123456`) to evaluate VoIP/toll risk. |

---

## 📊 Output Data Structure

```json
{
  "success": true,
  "verdict": "ALLOW",
  "trust_score": 96,
  "risk_level": "LOW",
  "execution_time_ms": 38,
  "checks": {
    "email": {
      "is_valid_format": true,
      "is_disposable": false,
      "is_free_provider": false,
      "has_mx_records": true,
      "domain": "acme.de"
    },
    "tax": {
      "is_valid": true,
      "country": "DE",
      "format_valid": true,
      "checksum_valid": true
    },
    "phone": {
      "is_valid": true,
      "line_type": "MOBILE",
      "carrier": "Vodafone D2"
    }
  },
  "summary": {
    "is_business_qualified": true,
    "recommended_action": "APPROVE_ZERO_RATE_VAT"
  }
}
```

---

## 🛠️ Example Workflows

1. **B2B Checkout Reverse Charge Gate**: `Webhook (Stripe / Shopify)` ➔ `TokenVerify` ➔ `If Tax Checksum Valid` ➔ `Exempt 20% VAT on Invoice`
2. **Form Spam Shield**: `Inbound Lead Form` ➔ `TokenVerify` ➔ `If Disposable Email == True` ➔ `Halt / Discard without notifying sales team`
3. **High-Value Lead Enrichment Pipeline**: `TokenVerify` ➔ `TokenEnrich` ➔ `HubSpot / Salesforce Sync`

---

## 📄 License & Attribution

* **License**: MIT
* **Author**: [The Quite Good Project](https://quitegoodproject.com)
* **Support & Security**: `engineering@quitegoodproject.com`
