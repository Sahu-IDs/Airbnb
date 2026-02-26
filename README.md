# 🏠 Mazor Airbnb Clone
### Containerized CRUD Web Application — Docker & Kubernetes Deployment
**IBM One Month Cloud Internship | 2025–26**

---

## 📌 Live Docker Hub Image

```bash
docker pull sandeep13677/airbnb-clone:latest
```
🔗 **[hub.docker.com/r/sandeep13677/airbnb-clone](https://hub.docker.com/r/sandeep13677/airbnb-clone)**

| Detail | Value |
|--------|-------|
| **Image** | `sandeep13677/airbnb-clone:latest` |
| **Size** | 56.9 MB |
| **Base** | `node:18-alpine` |
| **Digest** | `sha256:2bf752874510d1bb6a82e392c0792dcadaac9a7b9d2032123e19fc4946dfcbea` |

---

## 📖 Project Overview

A **full-stack Airbnb Clone** CRUD web application built with Node.js & MongoDB, fully containerized using Docker and deployed on Kubernetes (Minikube) with:
- ✅ **2 Pod Replicas** (High Availability)
- ✅ **Auto Scaling (HPA)** — 2 to 5 pods on CPU > 70%
- ✅ **Zero-Downtime Rolling Updates**
- ✅ **Kubernetes Secret Management**
- ✅ **MongoDB Atlas Cloud Database**
- ✅ **Cloudinary Image Storage**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 18, Express.js v5 |
| **Frontend** | EJS Templates, Bootstrap 5 |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | Passport.js (Local Strategy) |
| **Images** | Cloudinary CDN |
| **Validation** | Joi |
| **Container** | Docker (Alpine, Multi-stage) |
| **Orchestration** | Kubernetes (Minikube) |
| **Registry** | Docker Hub |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed

---

## 🐳 Docker Commands

### Build Image
```bash
docker build -t sandeep13677/airbnb-clone:latest .
```

### Login to Docker Hub
```bash
docker login --username sandeep13677
```

### Push to Docker Hub
```bash
docker push sandeep13677/airbnb-clone:latest
```

### Pull from Docker Hub (any machine)
```bash
docker pull sandeep13677/airbnb-clone:latest
```

### Run locally
```bash
docker run -p 3000:3000 --env-file .env sandeep13677/airbnb-clone:latest
```

---

## ☸️ Kubernetes Deployment

### Step 1 — Start Minikube
```bash
minikube start --driver=docker
```

### Step 2 — Apply all K8s manifests
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

### Step 3 — Check pods status
```bash
kubectl get pods -n airbnb
```
Expected output:
```
NAME                         READY   STATUS    RESTARTS   AGE
airbnb-app-55886f9fd8-xxx    1/1     Running   0          2m
airbnb-app-55886f9fd8-yyy    1/1     Running   0          2m
```

### Step 4 — Access the App
```bash
minikube service airbnb-service -n airbnb --url
```
Open the URL in your browser → All listing cards will appear! 🏠

---

## 📁 Project Structure

```
Mazor Project airbnb/
├── 📄 app.js                  # Main Express application
├── 📄 Dockerfile              # Multi-stage Docker build
├── 📄 .dockerignore           # Docker build exclusions
├── 📄 package.json
├── 📁 k8s/                    # Kubernetes manifests
│   ├── namespace.yaml         # Dedicated namespace
│   ├── secret.yaml            # Encrypted env variables
│   ├── deployment.yaml        # 2 replicas + probes
│   ├── service.yaml           # NodePort :30080
│   ├── hpa.yaml               # Auto-scaling 2→5 pods
│   └── ingress.yaml           # Domain routing
├── 📁 Models/                 # Mongoose schemas
├── 📁 routes/                 # Express routes
├── 📁 views/                  # EJS templates
├── 📁 public/                 # Static files
├── 📄 DEPLOYMENT.md           # Full deployment guide
└── 📄 presentation.html       # IBM submission slides
```

---

## 🔄 CRUD Operations

| Method | Route | Operation |
|--------|-------|-----------|
| `GET` | `/listings` | View all listings |
| `POST` | `/listings` | Create new listing |
| `GET` | `/listings/:id` | View single listing |
| `PUT` | `/listings/:id` | Update listing |
| `DELETE` | `/listings/:id` | Delete listing |
| `POST` | `/listings/:id/reviews` | Add review |
| `DELETE` | `/listings/:id/reviews/:rid` | Delete review |

---

## 🏗️ Architecture

```
Browser
  │
  ▼
☸️ K8s Service (NodePort :30080)
  │
  ├──▶ 🐳 Pod 1 (Node.js :3000)
  └──▶ 🐳 Pod 2 (Node.js :3000)
           │
           ├──▶ 🍃 MongoDB Atlas (Cloud DB)
           ├──▶ ☁️  Cloudinary (Image CDN)
           └──▶ 🔐 K8s Secrets (Env Config)

📦 Image Source: Docker Hub
   sandeep13677/airbnb-clone:latest
```

---

## 📊 Kubernetes Files

| File | Purpose |
|------|---------|
| `namespace.yaml` | Isolates resources in `airbnb` namespace |
| `secret.yaml` | Stores API keys as Base64 (never in code!) |
| `deployment.yaml` | 2 replicas, rolling update, health probes |
| `service.yaml` | Exposes app on NodePort 30080 |
| `hpa.yaml` | Auto-scales 2→5 pods when CPU > 70% |
| `ingress.yaml` | Routes domain traffic to service |

---

## 🔄 Update Deployment (when code changes)

```bash
# 1. Build new image
docker build -t sandeep13677/airbnb-clone:latest .

# 2. Push to Docker Hub
docker push sandeep13677/airbnb-clone:latest

# 3. Restart Kubernetes pods (zero-downtime)
kubectl rollout restart deployment/airbnb-app -n airbnb

# 4. Verify rollout
kubectl rollout status deployment/airbnb-app -n airbnb
```

---

## 🔧 Useful kubectl Commands

```bash
# See all resources
kubectl get all -n airbnb

# View logs
kubectl logs <pod-name> -n airbnb

# Scale manually
kubectl scale deployment airbnb-app --replicas=3 -n airbnb

# Debug a pod
kubectl describe pod <pod-name> -n airbnb
```

---

## 📌 Environment Variables (via K8s Secrets)

| Variable | Description |
|----------|-------------|
| `ATLASDB_URL` | MongoDB Atlas connection string |
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API_KEY` | Cloudinary API key |
| `CLOUD_API_SECRET` | Cloudinary API secret |
| `SECRET` | Session secret key |

> 🔐 **Never hardcoded!** All secrets injected via Kubernetes Secrets at runtime.

---

## 👨‍💻 Author

**Sandeep** | Computer Science Student
IBM One Month Cloud Internship — 2025–26

---

*Built with ❤️ using Node.js, Docker & Kubernetes*
