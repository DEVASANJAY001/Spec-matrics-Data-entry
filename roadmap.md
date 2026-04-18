# SPEC - Project Roadmap & Next Steps

This document outlines the evolutionary steps for the SPEC Car Quality Inspection System as it scales from an MVP to an enterprise-grade organizational tool.

## 📍 Phase 1: Operational Stability (Current)
- [x] **Digital Data Entry**: Complete part-by-part inspection logic.
- [x] **A4 Digital Travel Cards**: High-fidelity printing support.
- [x] **Basic Dashboard**: Real-time rejection and throughput tracking.
- [x] **Trash/Recovery System**: 7-day data retention policy.

## 🚀 Phase 2: Enterprise Scaling (Next Steps)
### 1. Infrastructure Migration
- **Move to Licensed DB**: Transition from MongoDB Atlas Free Cluster to a **Dedicated Cluster (M10/M20)**. 
    - *Goal*: Handle higher request volumes, provide SLA guarantees, and enable auto-scaling.
- **Enterprise Hosting**: Migrate from Vercel to **AWS (App Runner/ECS)** or **Azure**.
    - *Goal*: Integration with corporate VNets and regional data compliance.

### 2. Advanced Middleware Support
- **Auth Middleware**: Implement centralized authentication (SSO/Entra ID) for secure access.
- **Request Logging**: Centralized logging for traceability and audit compliance.
- **Rate Limiting**: Protect APIs from excessive requests during peak production hours.

### 3. SAP Integration (The "Hub" Model)
- **Direct ERP Sync**: Automated synchronization of "Travel Card" results directly into SAP production orders.
- **Inventory Feedback**: Notify SAP when a part is marked as "NO" (failed) to trigger inventory re-ordering or quality holds.
- **Protocol**: Standardize on OData/REST API integrations with SAP BTP.

## 📈 Long-term Vision
- **AI-Powered Inspection**: Integrate OpenCV/Vision models to automatically detect "Gap/Flush" issues from camera feeds (Building on Phase 1 logic).
- **Global Deployment**: Multi-site support with centralized management for multiple manufacturing plants.
- **Predictive Maintenance**: Use quality trends to predict equipment failure or mechanical issues on the production line.

---
*Document Version: 1.1 - Last Updated: March 2026*
