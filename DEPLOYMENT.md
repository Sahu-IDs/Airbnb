# 🐳 Docker + ☸️ Kubernetes Deployment Guide
## Mazor Airbnb Project

---

## 📁 Project Structure After Setup

```
Mazor Project airbnb/
├── Dockerfile              ← Docker build instructions
├── .dockerignore           ← Files excluded from Docker image
├── k8s/
│   ├── namespace.yaml      ← Kubernetes namespace
│   ├── secret.yaml         ← Environment variable secrets
│   ├── deployment.yaml     ← App Deployment (2 replicas)
│   ├── service.yaml        ← NodePort Service (port 30080)
│   ├── hpa.yaml            ← Auto-scaling (2–5 pods)
│   └── ingress.yaml        ← Domain-based routing (optional)
└── DEPLOYMENT.md           ← This Guide
```

---

## ✅ Prerequisites

Install these tools before starting:

| Tool | Download Link |
|------|--------------|
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| kubectl | https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/ |
| minikube (local) | https://minikube.sigs.k8s.io/docs/start/ |
| Docker Hub Account | https://hub.docker.com |

---

## 🚀 Step-by-Step Deployment

### STEP 1 — Build the Docker Image

Open PowerShell in the project root folder:

```powershell
# Navigate to project directory
cd "c:\Users\sandeep\Desktop\Mazor Project airbnb"

# Build the Docker image (replace YOUR_USERNAME with your Docker Hub username)
docker build -t YOUR_USERNAME/mazor-airbnb:latest .

# Verify the image was created
docker images | findstr mazor-airbnb
```

---

### STEP 2 — Test Locally with Docker

```powershell
docker run -d `
  --name airbnb-test `
  -p 3000:3000 `
  -e NODE_ENV=production `
  -e CLOUD_NAME=da60bminr `
  -e CLOUD_API_KEY=697821455973634 `
  -e CLOUD_API_SECRET=1qcfbjByPe_zFL904YIk_pqJjHU `
  -e ATLASDB_URL="mongodb+srv://student:Sandeep1260@cluster0.owvpojw.mongodb.net/wanderlust" `
  -e SECRET=mysupersecretcode `
  YOUR_USERNAME/mazor-airbnb:latest

# Open browser: http://localhost:3000

# View logs
docker logs airbnb-test

# Stop & clean up
docker stop airbnb-test
docker rm airbnb-test
```

---

### STEP 3 — Push Image to Docker Hub

```powershell
# Login to Docker Hub
docker login

# Push the image
docker push YOUR_USERNAME/mazor-airbnb:latest
```

---

### STEP 4 — Start Kubernetes Cluster (Local with Minikube)

```powershell
# Start minikube
minikube start --driver=docker

# Verify cluster is running
kubectl cluster-info

# Enable the Ingress addon (optional, for domain routing)
minikube addons enable ingress
```

---

### STEP 5 — Update deployment.yaml

Open `k8s/deployment.yaml` and replace:
```yaml
image: YOUR_DOCKERHUB_USERNAME/mazor-airbnb:latest
```
With your actual Docker Hub username:
```yaml
image: sandeep1260/mazor-airbnb:latest  # example
```

---

### STEP 6 — Deploy to Kubernetes

```powershell
# Apply all manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Optional: Only if you have a domain
# kubectl apply -f k8s/ingress.yaml
```

---

### STEP 7 — Verify Deployment

```powershell
# Check all resources in the 'airbnb' namespace
kubectl get all -n airbnb

# Check pods are running (should show 2/2 Running)
kubectl get pods -n airbnb

# Check pod logs
kubectl logs -l app=airbnb-app -n airbnb --follow

# Describe deployment for details
kubectl describe deployment airbnb-app -n airbnb
```

---

### STEP 8 — Access the Application

#### Option A: Using Minikube (Local)
```powershell
# Get the URL to access the app
minikube service airbnb-service -n airbnb --url

# Or open directly in browser
minikube service airbnb-service -n airbnb
```

#### Option B: Using NodePort directly
```powershell
# Get minikube IP
minikube ip

# App available at: http://<MINIKUBE_IP>:30080
```

---

## 📊 Monitoring & Management Commands

```powershell
# Watch pods in real-time
kubectl get pods -n airbnb -w

# Check HPA (autoscaling) status
kubectl get hpa -n airbnb

# Check resource usage
kubectl top pods -n airbnb

# View events (for debugging)
kubectl get events -n airbnb --sort-by=.metadata.creationTimestamp

# Scale manually (override HPA)
kubectl scale deployment airbnb-app --replicas=3 -n airbnb

# Rolling update (after pushing new image)
kubectl rollout restart deployment/airbnb-app -n airbnb

# Check rollout status
kubectl rollout status deployment/airbnb-app -n airbnb

# Rollback to previous version
kubectl rollout undo deployment/airbnb-app -n airbnb
```

---

## 🔄 Updating the Application

```powershell
# 1. Make your code changes

# 2. Build new image with a version tag
docker build -t YOUR_USERNAME/mazor-airbnb:v2 .

# 3. Push to Docker Hub
docker push YOUR_USERNAME/mazor-airbnb:v2

# 4. Update image in deployment
kubectl set image deployment/airbnb-app airbnb-app=YOUR_USERNAME/mazor-airbnb:v2 -n airbnb

# 5. Watch the rolling update
kubectl rollout status deployment/airbnb-app -n airbnb
```

---

## 🧹 Cleanup

```powershell
# Delete everything in the namespace
kubectl delete namespace airbnb

# Stop minikube
minikube stop

# Delete minikube cluster
minikube delete
```

---

## ⚠️ Important Notes

1. **MongoDB Atlas**: Your app uses Atlas Cloud DB — ensure Atlas allows connections from your cluster's IP (or allow all: `0.0.0.0/0` for testing).
2. **Cloudinary**: Already configured via Kubernetes Secret.
3. **Secret Security**: Never commit `k8s/secret.yaml` with real values to a public Git repository.
4. **Production**: For cloud (AWS EKS, Google GKE, Azure AKS), change `service.yaml` type from `NodePort` to `LoadBalancer`.
