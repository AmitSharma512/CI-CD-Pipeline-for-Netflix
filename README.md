# FilmFlix: CI/CD Pipeline for React-Based Video Streaming Platform

## Overview
This project implements a robust CI/CD pipeline for FilmFlix, a React-based video streaming platform. The pipeline automates the build, test, and deployment processes, ensuring efficient development and reliable releases. It integrates various tools and technologies to enhance code quality, security, and deployment efficiency.

## Prerequests

- Create an account if you don't have on [TMDB](https://www.themoviedb.org/).
  Because I use its free API to consume movie/tv data.
- And then follow the [documentation](https://developers.themoviedb.org/3/getting-started/introduction) to create API Key
- Finally, if you use v3 of TMDB API, create a file named `.env`, and copy and paste the content of `.env.example`.
  And then paste the API Key you just created.

## Which features this project deal with

- How to create and use [Custom Hooks](https://reactjs.org/docs/hooks-custom.html)
- How to use [Context](https://reactjs.org/docs/context.html) and its provider
- How to use lazy and Suspense for [Code-Splitting](https://reactjs.org/docs/code-splitting.html)
- How to use a new [lazy](https://reactrouter.com/en/main/route/lazy) feature of react-router to reduce bundle size.
- How to use data [loader](https://reactrouter.com/en/main/route/loader) of react-router, and how to use redux dispatch in the loader to fetch data before rendering component.
- How to use [Portal](https://reactjs.org/docs/portals.html)
- How to use [Fowarding Refs](https://reactjs.org/docs/forwarding-refs.html) to make components reusuable
- How to create and use [HOC](https://reactjs.org/docs/higher-order-components.html)
- How to customize default theme of [MUI](https://mui.com/)
- How to use [RTK](https://redux-toolkit.js.org/introduction/getting-started)
- How to use [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- How to customize default classname of [MUI](https://mui.com/material-ui/experimental-api/classname-generator)
- Infinite Scrolling(using [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API))
- How to make awesome carousel using [slick-carousel](https://react-slick.neostack.com)

## Third Party libraries used except for React and RTK

- [react-router-dom@v6.9](https://reactrouter.com/en/main)
- [MUI(Material UI)](https://mui.com/)
- [framer-motion](https://www.framer.com/docs/)
- [video.js](https://videojs.com)
- [react-slick](https://react-slick.neostack.com/)

## Complete CI/CD Pipeline Setup

### 1. Launch an Ubuntu (22.04) T2 Large Instance

- Log into AWS Console
- Navigate to EC2 dashboard
- Click "Launch Instance"
- Choose Ubuntu Server 22.04 LTS AMI
- Select t2.large instance type
- Configure instance details (VPC, subnet, etc.)
- Add storage as needed
- Configure security group (allow SSH, HTTP, HTTPS)
- Review and launch with your key pair

### 2. Install Jenkins, Docker, and Trivy. Create a Sonarqube container

- SSH into your EC2 instance
- Update system: sudo apt update && sudo apt upgrade -y
- Install Jenkins:
  - Add Jenkins repo and install: sudo apt install jenkins
  - Start Jenkins: sudo systemctl start jenkins

- Install Docker:
  - sudo apt install docker.io
  - sudo usermod -aG docker ubuntu

- Install Trivy:
  - sudo apt-get install wget apt-transport-https gnupg lsb-release
  - wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
  - echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
  - sudo apt-get update
  - sudo apt-get install trivy

- Create Sonarqube container:
  - docker run -d --name sonarqube -p 9000:9000 sonarqube:lts

### 3. Create a TMDB API Key

- Go to https://www.themoviedb.org/
- Sign up for an account
- Go to settings > API
- Request an API key for developer use
- Fill out the form and submit
- Copy your new API key


### 4. Install Prometheus and Grafana:

- Install Prometheus:
  - Download Prometheus
  - Extract and move to /usr/local/bin
  - Create prometheus.yml configuration
  - Set up as a systemd service
    
- Install Grafana:

  - Add Grafana repo
  - sudo apt-get install grafana
  - Start Grafana: sudo systemctl start grafana-server

### 5. Install Prometheus Plugin and integrate with Prometheus server:

- In Jenkins, go to "Manage Jenkins" > "Manage Plugins"
- Install "Prometheus metrics plugin"
- Configure Prometheus to scrape Jenkins metrics
- Add Jenkins job to Prometheus configuration

### 6. Set up email integration and configure plugins:

- Install "Email Extension Plugin" in Jenkins
- Configure SMTP settings in Jenkins system configuration
- Set up email notifications in your Jenkins pipeline

### 7. Install additional Jenkins plugins:

- Go to "Manage Jenkins" > "Manage Plugins"
- Install: JDK, SonarQube Scanner, NodeJS, OWASP Dependency-Check
- Configure these tools in "Global Tool Configuration"

### 8. Create Pipeline Project:

- Click "New Item" in Jenkins
- Choose "Pipeline" project
- Configure Git repository in pipeline definition
- Write Declarative Pipeline script

### 9. Install OWASP Dependency Check Plugin:

- Go to "Manage Jenkins" > "Manage Plugins"
- Install "OWASP Dependency-Check Plugin"
- Configure the plugin in "Global Tool Configuration"

### 10. Implement Docker Image Build and Push:

- Add Docker Build and Push stages to your Jenkins pipeline
- Configure Docker Hub (or other registry) credentials in Jenkins
  
### 11. Deploy image using Docker:

- Add a stage in your pipeline to run the Docker image
- Use docker run command with appropriate parameters

### 12. Set up Kubernetes master and slave:

- Launch two Ubuntu 20.04 instances
- Install kubectl, kubeadm, kubelet on both
- Initialize master node with kubeadm init
- Join worker node to the cluster
- Set up networking (e.g., Flannel)

### 13. Access FilmFlix app on browser:

- Ensure your app is exposed via LoadBalancer or NodePort
- Get the external IP or NodePort
- Access in browser: http://<IP>:<PORT>

### 14. Terminate AWS EC2 Instances:

- Go to EC2 dashboard in AWS Console
- Select all related instances
- Click "Instance State" > "Terminate"
- Confirm termination

### Complete Jenkins Pipeline

```
pipeline{
    agent any
    tools{
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME=tool 'sonar-scanner'
    }
    stages {
        stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Checkout from Git'){
            steps{
                git branch: 'main', url: 'https://github.com/AmitSharma512/CI/CD_Pipeline_for_FilmFlix.git'
            }
        }
        stage("Sonarqube Analysis "){
            steps{
                withSonarQubeEnv('sonar-server') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=FilmFlix \
                    -Dsonar.projectKey=FilmFlix '''
                }
            }
        }
        stage("quality gate"){
           steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }
        stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        stage("Docker Build & Push"){
            steps{
                script{
                   withDockerRegistry(credentialsId: 'docker', toolName: 'docker'){
                       sh "docker build --build-arg TMDB_V3_API_KEY=AJ7AYe14eca3e76864yah319b92 -t FilmFlix ."
                       sh "docker tag FilmFlix amit/FilmFlix:latest "
                       sh "docker push amit/FilmFlix:latest "
                    }
                }
            }
        }
        stage("TRIVY"){
            steps{
                sh "trivy image amit/FilmFlix:latest > trivyimage.txt"
            }
        }
        stage('Deploy to container'){
            steps{
                sh 'docker run -d --name FilmFlix -p 8081:80 amit/FilmFlix:latest'
            }
        }
        stage('Deploy to kubernets'){
            steps{
                script{
                    dir('Kubernetes') {
                        withKubeConfig(caCertificate: '', clusterName: '', contextName: '', credentialsId: 'k8s', namespace: '', restrictKubeConfigAccess: false, serverUrl: '') {
                                sh 'kubectl apply -f deployment.yml'
                                sh 'kubectl apply -f service.yml'
                        }
                    }
                }
            }
        }
    }
    post {
     always {
        emailext attachLog: true,
            subject: "'${currentBuild.result}'",
            body: "Project: ${env.JOB_NAME}<br/>" +
                "Build Number: ${env.BUILD_NUMBER}<br/>" +
                "URL: ${env.BUILD_URL}<br/>",
            to: 'amit.sharma1022526@gmail.com',
            attachmentsPattern: 'trivyfs.txt,trivyimage.txt'
        }
    }
}
```

## Install with Docker

```sh
docker build --build-arg TMDB_V3_API_KEY=your_api_key_here -t CI/CD_pipeline .

docker run --name CI/CD_Pipeline_for_FilmFlix --rm -d -p 80:80 CI/CD_pipeline
```
