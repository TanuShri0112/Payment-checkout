pipeline {
    agent any

    environment {
        PROJECT_DIR = "."
        DEPLOY_PATH = "/var/www/payment-checkout"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies..."
                dir("${PROJECT_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Build Project') {
            steps {
                echo "Building Vite project..."
                dir("${PROJECT_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Build') {
            steps {
                echo "Deploying dist files..."
                sh '''
                rm -rf ${DEPLOY_PATH}/*
                cp -r dist/* ${DEPLOY_PATH}/
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "Checking deployed files..."
                sh 'ls -lah ${DEPLOY_PATH}'
            }
        }
    }

    post {
        success {
            echo "Deployment successful"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}
