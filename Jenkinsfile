node {
  def project = 'archimedes-01201'
  def appName = 'ahcip-app'
  def feSvcName = 'ahcip-app-serv'
  // def imageTag = "us.gcr.io/${project}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"
  def imageTag = "us.gcr.io/${project}/${appName}:latest"
	def deployArch = "os.linux.x86_64"

  checkout scm

  // stage 'Building application:'
  // sh("npm test")

  stage 'Building application:'
	sh("npm install")
  sh("meteor build . --architecture ${deployArch}")

  stage 'Building application image:'
  sh("sudo docker build -t ${imageTag} -f Dockerfile .")

  stage 'Pushing container image to registry:'
  sh("sudo gcloud docker push -- ${imageTag}")

  stage 'Deploying Application:'
	// sh("sudo gcloud container clusters get-credentials ahcip-cluster")
	//sh("kubectl apply -f k8s/develop/")
  sh("set image deployment/ahcip-app-dep ahcip-app-cont=us.gcr.io/archimedes-01201/ahcip-app:latest")
	sh("echo http://`kubectl get service/${feSvcName} --output=json | jq -r '.status.loadBalancer.ingress[0].ip'` > ${feSvcName}")
}
