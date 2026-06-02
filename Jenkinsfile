pipeline {
    agent any

    // Parameters injected by GitHub Actions trigger
    parameters {
        string(name: 'BACKEND_IMAGE',  defaultValue: '', description: 'Docker image tag for the backend')
        string(name: 'FRONTEND_IMAGE', defaultValue: '', description: 'Docker image tag for the frontend')
        string(name: 'GIT_COMMIT',     defaultValue: '', description: 'Git commit SHA triggering this deploy')
        string(name: 'GIT_BRANCH',     defaultValue: 'main', description: 'Git branch triggering this deploy')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'skillcerts'
        DEPLOY_DIR           = "${WORKSPACE}"
        COMPOSE_FILE         = "${WORKSPACE}/docker-compose.yml"
        HEALTH_CHECK_RETRIES = '10'
        HEALTH_CHECK_DELAY   = '10'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20')) // Clean build history logs
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        // Step 1: Ensure GitHub Actions passed both tags
        stage('🔍 Validate Parameters') {
            steps {
                script {
                    echo "=== Deployment Triggered ==="
                    echo "Branch      : ${params.GIT_BRANCH}"
                    echo "Commit SHA  : ${params.GIT_COMMIT}"
                    echo "Backend     : ${params.BACKEND_IMAGE}"
                    echo "Frontend    : ${params.FRONTEND_IMAGE}"

                    if (!params.BACKEND_IMAGE || !params.FRONTEND_IMAGE) {
                        error("❌ BACKEND_IMAGE and FRONTEND_IMAGE parameters are required!")
                    }
                }
            }
        }

        // Step 2: Grab latest infrastructure code and files
        // (Removed redundant explicit Checkout stage, as Jenkins SCM handles this automatically on agent startup)

        // Step 3: Fetch pre-built images from Docker Hub to EC2 host
        stage('🐳 Pull Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                        echo "Pulling backend image: ${BACKEND_IMAGE}"
                        docker pull ${BACKEND_IMAGE}

                        echo "Pulling frontend image: ${FRONTEND_IMAGE}"
                        docker pull ${FRONTEND_IMAGE}
                    '''
                }
            }
        }

        // Step 4: Copy production secrets and write Docker Hub image tags into .env
        stage('📁 Prepare Deploy Directory') {
            steps {
                withCredentials([
                    file(credentialsId: 'skillcerts-env-file', variable: 'ENV_FILE')
                ]) {
                    sh '''
                        rm -f "${DEPLOY_DIR}/.env"
                        cp "$ENV_FILE" "${DEPLOY_DIR}/.env"
                        chmod 644 "${DEPLOY_DIR}/.env"

                        echo "" >> "${DEPLOY_DIR}/.env"
                        echo "# Auto-injected by Jenkins CD pipeline" >> "${DEPLOY_DIR}/.env"
                        echo "BACKEND_IMAGE_TAG=${BACKEND_IMAGE}" >> "${DEPLOY_DIR}/.env"
                        echo "FRONTEND_IMAGE_TAG=${FRONTEND_IMAGE}" >> "${DEPLOY_DIR}/.env"
                    '''
                }
            }
        }

        // Step 5: Perform zero-downtime rolling update of containers
        stage('🚀 Deploy Containers') {
            steps {
                sh '''
                    cd ${DEPLOY_DIR}
                    docker-compose up -d --remove-orphans
                '''
            }
        }

        // Step 6: Test if containers are running and responding successfully
        stage('🏥 Health Check') {
            steps {
                sh '''
                    RETRIES=${HEALTH_CHECK_RETRIES}
                    DELAY=${HEALTH_CHECK_DELAY}

                    # Route traffic through Docker network host gateway on Linux/Docker Desktop
                    HOST_IP="localhost"
                    if getent hosts host.docker.internal > /dev/null 2>&1; then
                        HOST_IP="host.docker.internal"
                        echo "Using host.docker.internal for health check."
                    fi

                    BACKEND_URL="http://${HOST_IP}:3000/health"
                    FRONTEND_URL="http://${HOST_IP}:80"

                    echo "=== Waiting for backend health ==="
                    for i in $(seq 1 $RETRIES); do
                        HTTP=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL || true)
                        if [ "$HTTP" = "200" ]; then
                            echo "✅ Backend is healthy (HTTP 200)"
                            break
                        fi
                        echo "Attempt $i/$RETRIES — backend returned HTTP $HTTP. Retrying in ${DELAY}s..."
                        sleep $DELAY
                        if [ "$i" = "$RETRIES" ]; then
                            echo "❌ Backend health check failed after $RETRIES attempts!"
                            docker-compose -f ${COMPOSE_FILE} logs backend --tail=50
                            exit 1
                        fi
                    done

                    echo "=== Waiting for frontend health ==="
                    for i in $(seq 1 $RETRIES); do
                        HTTP=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL || true)
                        if [ "$HTTP" = "200" ]; then
                            echo "✅ Frontend is healthy (HTTP 200)"
                            break
                        fi
                        echo "Attempt $i/$RETRIES — frontend returned HTTP $HTTP. Retrying in ${DELAY}s..."
                        sleep $DELAY
                        if [ "$i" = "$RETRIES" ]; then
                            echo "❌ Frontend health check failed after $RETRIES attempts!"
                            docker-compose -f ${COMPOSE_FILE} logs frontend --tail=50
                            exit 1
                        fi
                    done

                    echo "✅ All services are healthy!"
                '''
            }
        }

        // Step 7: Clear out old Docker images to save EC2 disk space
        stage('🧹 Cleanup') {
            steps {
                sh '''
                    docker image prune -f
                '''
            }
        }
    }

    // Build notifications and error rollbacks
    post {
        success {
            echo """
            ╔══════════════════════════════════════════════╗
            ║  ✅ DEPLOYMENT SUCCESSFUL                     ║
            ║  Branch  : ${params.GIT_BRANCH}              ║
            ║  Commit  : ${params.GIT_COMMIT}              ║
            ║  Backend : ${params.BACKEND_IMAGE}           ║
            ║  Frontend: ${params.FRONTEND_IMAGE}          ║
            ╚══════════════════════════════════════════════╝
            """
        }

        failure {
            echo "❌ Deployment FAILED. Rolling back..."
            sh '''
                cd "${WORKSPACE}"
                docker-compose down || true
                docker-compose up -d --no-build || true
            '''
        }

        always {
            sh 'docker logout || true'
            echo "Pipeline finished at: ${new Date()}"
        }
    }
}
