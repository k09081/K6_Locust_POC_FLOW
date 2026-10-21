# Performance Testing PoC — k6 & Locust

This repository contains Proof of Concept (PoC) scripts and modular framework structures created to evaluate **Grafana k6** and **Locust** for modern performance engineering.

---

## 📁 Repository Structure

* `k6_loadtest/` — Load testing scripts with custom virtual user (VU) profiles, stages, thresholds (SLOs), and checks.
* `k6_ui_based_recording/` — k6 scripts generated via browser/HAR recordings for complex user journeys[cite: 2].
* `k6_revision/` — Modular test scripts focusing on dynamic data parameterization, correlation, and response validations[cite: 2].

---

## 🚀 How to Run the k6 Scripts

### Prerequisites
* Install k6 locally ([k6 Installation Guide](https://k6.io/docs/get-started/installation/))

### Execution Commands
Run a basic load script:
```bash
k6 run k6_loadtest/<your-script-name>.js