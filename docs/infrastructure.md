# SPEC - Infrastructure & Database Migration Plan

This document details the transition from free-tier services to scalable, enterprise-grade hosting and database clusters.

## 🗄️ Database: MongoDB Atlas Migration
The current "Shared Cluster" (Free Tier) has limits on storage, IOPS, and concurrent connections.

### Proposed Target: Dedicated Cluster (M10/M20)
- **Why**: 
    - Dedicated RAM, CPU, and Storage.
    - Automated daily backups and point-in-time recovery.
    - Higher network throughput for intensive dashboard queries.
- **Estimated Cost**: ~$60/month (M10) to ~$145/month (M20).
- **Migration Path**: 
    1. Provision new cluster in MongoDB Atlas.
    2. Use the **Atlas Live Migration** tool for zero-downtime transfer.

## 🌐 Hosting: Vercel to Enterprise Cloud
While Vercel is excellent, certain organizational security policies might require moving to VPC-based environments.

### Option A: AWS (Amazon Web Services)
- **Service**: **AWS App Runner** or **Amazon ECS (on Fargate)**.
- **Benefits**: Integration with AWS VPCs, IAM for fine-grained security, and regional data residency.

### Option B: Azure
- **Service**: **Azure App Service**.
- **Benefits**: Seamless integration with Microsoft Entra ID (SSO) and existing Enterprise Agreements.

## 📡 Scalability Goals
- **Requests per Second (RPS)**: Support up to 500 concurrent operators.
- **Availability**: 99.9% Up-time SLA.
- **Retention**: Move archival inspections into a "Cold Storage" collection or S3 bucket after 6 months to keep the primary DB lean.

---
*Document Version: 1.0*
