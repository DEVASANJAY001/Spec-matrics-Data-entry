# SPEC - SAP Integration Strategy

To ensure seamless production data flow between the Shop Floor (SPEC) and the ERP (SAP), the following integration strategy is proposed.

## 🔗 Integration Protocols
We recommend using **REST/OData Services** via the **SAP Business Technology Platform (BTP)** as the primary communication bridge.

### 1. Synchronous Sync (Real-time)
- **Use Case**: Pushing "Final Inspection" results once a Car Code/VIN is completed.
- **Method**: POST request to an OData endpoint.
- **Data Flow**: `SPEC (Next.js) -> SAP BTP -> SAP S/4HANA (Production Order Update)`.

### 2. Asynchronous Sync (Batch/Queue)
- **Use Case**: Syncing master data (Car Models, Variants, Specifications) from SAP to SPEC.
- **Method**: Weekly/Daily scheduled job or Webhooks from SAP.
- **Data Flow**: `SAP -> SPEC API -> MongoDB`.

## 🛠 Required Prerequisites
1. **SAP Service User**: A dedicated account with restricted permissions for OData/RFC access.
2. **API Keys**: Managed via SAP BTP Connectivity Service.
3. **VPN/Cloud Connector**: Required for on-premise SAP instances.

## 🚀 Implementation Roadmap
| Step | Phase | Task |
| :--- | :--- | :--- |
| **01** | Discovery | Identify relevant BAPI/RFC for car quality updates. |
| **02** | Sandbox | Test OData connectivity using Postman with sample VIN data. |
| **03** | Prototype | Create `src/lib/sap/client.ts` in SPEC to handle SAP requests. |
| **04** | Pilot | Sync one production line's data for 2 days. |

---
*Status: Draft Strategy (V1.0)*
