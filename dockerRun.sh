docker build -t google-api-server .

# google-api-server tagging 하고 localhost:5000 으로 push 하기
docker tag google-api-server localhost:5000/google-api-server
docker push localhost:5000/google-api-server

kubectl apply -f google-api-server.yml

kubectl rollout restart deployment/google-api-server-deploy

# minikube 에서 실행된 pod 확인하기
kubectl get pods