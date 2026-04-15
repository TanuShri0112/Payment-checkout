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
                    sh '''
                    npm install || {
                        echo "Dependency installation failed"
                        exit 1
                    }
                    '''
                }
            }
        }

        stage('Build Project') {
            steps {
                echo "Building Vite project..."
                dir("${PROJECT_DIR}") {
                    sh '''
                    npm run build || {
                        echo "Build failed"
                        exit 1
                    }
                    '''
                }
            }
        }

        stage('Deploy Build') {
            steps {
                echo "Deploying dist files..."
                sh '''
                sudo mkdir -p ${DEPLOY_PATH}
                sudo chown -R jenkins:jenkins ${DEPLOY_PATH}
                sudo chmod -R 755 ${DEPLOY_PATH}
                sudo rm -rf ${DEPLOY_PATH}/*

                sudo cp -r dist/* ${DEPLOY_PATH}/ || {
                    echo "Deployment failed"
                    exit 1
                }
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "Checking deployed files..."
                sh '''
                ls -lah ${DEPLOY_PATH} || {
                    echo "Deployment verification failed"
                    exit 1
                }
                '''
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
