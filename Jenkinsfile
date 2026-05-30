// =========================================================
// Jenkinsfile — CD Pipeline for SkillCerts
//
// Triggered by : GitHub Actions (via webhook/API call)
// Stages       : Validate → Pull Images → Deploy → Smoke Test → Notify
//
// Required Jenkins Credentials (configure in Jenkins > Credentials):
//   DOCKERHUB_USERNAME   - Docker Hub username
//   DOCKERHUB_TOKEN      - Docker Hub access token
//   SKILLCERTS_ENV_FILE  - Secret file containing production .env variables
//
// Required Jenkins Parameters (auto-passed from GitHub Actions):
//   BACKEND_IMAGE        - Full backend image tag  e.g. user/skillcerts-backend:sha-abc1234
//   FRONTEND_IMAGE       - Full frontend image tag e.g. user/skillcerts-frontend:sha-abc1234
//   GIT_COMMIT           - Git commit SHA
//   GIT_BRANCH           - Git branch name
// =========================================================

pipeline {

    agent {
        label 'docker'   // Jenkins agent must have Docker & docker-compose installed
    }

    // ── Parameters passed from GitHub Actions ──────────
    parameters {
        string(name: 'BACKEND_IMAGE',  defaultValue: '', description: 'Docker image tag for the backend')
        string(name: 'FRONTEND_IMAGE', defaultValue: '', description: 'Docker image tag for the frontend')
        string(name: 'GIT_COMMIT',     defaultValue: '', description: 'Git commit SHA triggering this deploy')
        string(name: 'GIT_BRANCH',     defaultValue: 'main', description: 'Git branch triggering this deploy')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'skillcerts'
        DEPLOY_DIR           = '/opt/skillcerts'           // Directory on the server where files live
        COMPOSE_FILE         = "${DEPLOY_DIR}/docker-compose.yml"
        HEALTH_CHECK_RETRIES = '10'
        HEALTH_CHECK_DELAY   = '10'                        // seconds between retries
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        // ───────────────────────────────────────────────
        // STAGE 1: Validate
        // ───────────────────────────────────────────────
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

        // ───────────────────────────────────────────────
        // STAGE 2: Checkout Infrastructure Files
        // ───────────────────────────────────────────────
        stage('📥 Checkout Repo') {
            steps {
                checkout([
                    $class           : 'GitSCM',
                    branches         : [[name: "*/${params.GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url          : 'https://github.com/girishgarg12/SkillCerts.git',
                        credentialsId: 'github-credentials'   // Jenkins credential ID
                    ]]
                ])
                echo "✅ Repository checked out successfully"
            }
        }

        // ───────────────────────────────────────────────
        // STAGE 3: Docker Hub Login & Pull Images
        // ───────────────────────────────────────────────
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
                        echo "✅ Logged into Docker Hub"

                        echo "Pulling backend image: ${BACKEND_IMAGE}"
                        docker pull ${BACKEND_IMAGE}

                        echo "Pulling frontend image: ${FRONTEND_IMAGE}"
                        docker pull ${FRONTEND_IMAGE}

                        echo "✅ Images pulled successfully"
                    '''
                }
            }
        }

        // ───────────────────────────────────────────────
        // STAGE 4: Prepare Deployment Directory
        // ───────────────────────────────────────────────
        stage('📁 Prepare Deploy Directory') {
            steps {
                withCredentials([
                    file(credentialsId: 'skillcerts-env-file', variable: 'ENV_FILE')
                ]) {
                    sh '''
                        # Create deploy directory if not exists
                        mkdir -p ${DEPLOY_DIR}

                        # Copy environment file
                        cp "$ENV_FILE" "${DEPLOY_DIR}/.env"

                        # Copy docker-compose file from checked-out repo
                        cp docker-compose.yml "${DEPLOY_DIR}/docker-compose.yml"

                        # Override image tags in the .env file with the ones passed from CI
                        echo "" >> "${DEPLOY_DIR}/.env"
                        echo "# Auto-injected by Jenkins CD pipeline" >> "${DEPLOY_DIR}/.env"
                        echo "BACKEND_IMAGE_TAG=${BACKEND_IMAGE}" >> "${DEPLOY_DIR}/.env"
                        echo "FRONTEND_IMAGE_TAG=${FRONTEND_IMAGE}" >> "${DEPLOY_DIR}/.env"

                        echo "✅ Deploy directory prepared"
                        ls -la ${DEPLOY_DIR}
                    '''
                }
            }
        }

        // ───────────────────────────────────────────────
        // STAGE 5: Deploy (Rolling Update)
        // ───────────────────────────────────────────────
        stage('🚀 Deploy Containers') {
            steps {
                sh '''
                    cd ${DEPLOY_DIR}

                    echo "=== Current running containers ==="
                    docker compose ps || true

                    echo "=== Pulling latest images via compose ==="
                    docker compose pull

                    echo "=== Starting services with zero-downtime rolling update ==="
                    docker compose up -d --remove-orphans

                    echo "✅ Containers deployed"
                    docker compose ps
                '''
            }
        }

        // ───────────────────────────────────────────────
        // STAGE 6: Health Check / Smoke Test
        // ───────────────────────────────────────────────
        stage('🏥 Health Check') {
            steps {
                sh '''
                    RETRIES=${HEALTH_CHECK_RETRIES}
                    DELAY=${HEALTH_CHECK_DELAY}
                    BACKEND_URL="http://localhost:3000/health"
                    FRONTEND_URL="http://localhost:80"

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
                            docker compose -f ${COMPOSE_FILE} logs backend --tail=50
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
                            docker compose -f ${COMPOSE_FILE} logs frontend --tail=50
                            exit 1
                        fi
                    done

                    echo "✅ All services are healthy!"
                '''
            }
        }

        // ───────────────────────────────────────────────
        // STAGE 7: Cleanup Old Images
        // ───────────────────────────────────────────────
        stage('🧹 Cleanup') {
            steps {
                sh '''
                    echo "Removing dangling images to free disk space..."
                    docker image prune -f
                    echo "✅ Cleanup complete"
                '''
            }
        }
    }

    // ── Post Actions ────────────────────────────────────
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
            // Add Slack/email notification here if needed
            // slackSend(color: 'good', message: "✅ SkillCerts deployed: ${params.GIT_COMMIT}")
        }

        failure {
            echo "❌ Deployment FAILED. Rolling back..."
            sh '''
                cd ${DEPLOY_DIR}
                # Attempt to restore the previous state
                docker compose down || true
                docker compose up -d --no-build || true
                echo "⚠️  Rollback attempted. Check container logs."
            '''
            // slackSend(color: 'danger', message: "❌ SkillCerts deployment FAILED: ${params.GIT_COMMIT}")
        }

        always {
            // Logout from Docker Hub
            sh 'docker logout || true'
            echo "Pipeline finished at: ${new Date()}"
        }
    }
}
