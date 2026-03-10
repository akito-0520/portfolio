---
title: Nginx + CertbotでGoのAPIサーバーをSSL化した話
tags: [nginx, certbot, Go, SSL, サーバー構築]
author: akito-0520
createdAt: "2026-02-14"
updatedAt: "2026-02-14"
description: Nginx + CertbotでGoのAPIサーバーをSSL化した話
---

# はじめに

[前回の手順](./20260213_golang-api-setup-ubuntu.md)で，GoのAPIサーバーをGitHub Actionsで自動デプロイする環境を構築しました。しかし，このままでは通信が暗号化（HTTPS）されていません．

今回は，Nginxを導入してリバースプロキシを構築し，Certbot (Let's Encrypt) を使って無料でSSL化，さらにそのデプロイも自動化する方法をまとめようと思います．

# システム構成

前回構築したGoコンテナの前に，Nginxコンテナを「窓口」として配置します．

- **Nginx**: 80/443番ポートで受付け，SSLを解除して内部のGoへ転送
- **Certbot**: SSl証明書の取得・更新を担当
- **Docker Compose**: 全体のコンテナを管理

## 前提条件

- **ドメイン**: `example.com`などといった独自ドメインを取得しないといけないのでお好きなサービスを使用して取得しましょう
- **DNS（Aレコード）**: ドメインの管理画面でサーバーの**グローバルIPアドレス**をAレコードに設定しましょう

### 1. ライブラリのインストール

まずはNginxをインストールします。

```zsh:zsh
$ sudo apt install nginx
```

### 2. NginxとCertbotの設定

#### NginxのHTTPの疎通確認

まずはインストールしたNginxの設定ファイルを書いていきます．`your-domain`のところは各自取得した独自ドメインを使用してください．

```conf:backend/nginx/conf/default.conf
server {
    listen 80;
    server_name your-domain;

    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

次にNginxに合わせて`docker-compose.yml`も書き換えます．`git-name`と`repo-name`はそれぞれに合わせて書き換えてください．また，`container_name`は被らないようにそれぞれわかりやすく書いてください．

```yml:docker-compose.yml
services:
  backend:
    image: ghcr.io/git-name/repo-name:latest
    container_name: your-project-name
    expose:
      - "8080"
    restart: always

  nginx:
    image: nginx:latest
    container_name: your-nginx-name
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
    restart: always
    depends_on:
      - backend
```

これらをサーバー上へ自動でアップロードするために`GitHub Actions`を用います．
[前回の手順](https://qiita.com/akito-0520/items/bfc92b04c877c8f19048)ではサーバーでGitにログインしてプロジェクト全体をpullしていましたが，GHCRにdockerイメージをあげてサーバーでpullする場合はgoのコードなどはサーバー側でいらないことに気づいたので，GitHub Actionsで必要な設定ファイル等だけをコピーする方針にします．
ついでにブランチを切った場合でも**動作検証**のためにサーバー側へデプロイできるように手動でgithub上のactionsからも実行できるようにもしました．
**`your-repo-name`は各自で自身のリポジトリ名に変更してください（小文字推奨）**

```yaml:workflows/deploy.yml
name: CD Pipeline

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - "!backend/README.md"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    env:
      DEPLOY_FILES: "backend/docker-compose.yml,backend/nginx"
      TARGET_DIR: "~/your-repo-name"

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # リポジトリ名を小文字に変換（Dockerタグ用）
      - name: Lowercase Repo Name
        run: echo "REPO_NAME=${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV

      # ブランチ名を環境変数に設定
      - name: Set Branch Name and Docker Tag
        run: |
          BRANCH_NAME="${{ github.ref_name }}"
          echo "BRANCH_NAME=${BRANCH_NAME}" >> $GITHUB_ENV

          # Dockerタグ用にブランチ名をサニタイズ
          # 1. 小文字化
          SANITIZED_BRANCH=$(echo "${BRANCH_NAME}" | tr '[:upper:]' '[:lower:]')
          # 2. Dockerタグで許可されていない文字を '-' に置換し、前後の '-' を削除
          #    (小文字化後なので、[a-z0-9_.-] のみを許可)
          SANITIZED_BRANCH=$(echo "${SANITIZED_BRANCH}" | sed -E 's/[^a-z0-9_.-]+/-/g; s/^-+//; s/-+$//')
          # 3. すべて削除されて空になった場合のフォールバック
          if [ -z "${SANITIZED_BRANCH}" ]; then
            SANITIZED_BRANCH="branch"
          fi
          # 4. 短いコミットSHAを付与して一意性を担保しつつ、Dockerタグ長を満たすように調整
          #    Dockerタグの最大長は128文字
          MAX_TAG_LENGTH=128
          SHORT_SHA="${GITHUB_SHA::7}"
          RESERVED_LENGTH=$(( ${#SHORT_SHA} + 1 )) # '-' + SHORT_SHA
          BASE_MAX_LENGTH=$(( MAX_TAG_LENGTH - RESERVED_LENGTH ))
          if [ ${#SANITIZED_BRANCH} -gt ${BASE_MAX_LENGTH} ]; then
            SANITIZED_BRANCH="${SANITIZED_BRANCH:0:${BASE_MAX_LENGTH}}"
          fi
          DOCKER_TAG="${SANITIZED_BRANCH}-${SHORT_SHA}"
          echo "DOCKER_TAG=${DOCKER_TAG}" >> $GITHUB_ENV

      # 1. GHCRへログイン
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # 2. ビルド & プッシュ (ブランチ固有タグ)
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ env.REPO_NAME }}:${{ env.DOCKER_TAG }}

      # 2-2. mainブランチの場合は latest タグも更新
      - name: Build and Push latest (main only)
        if: ${{ env.BRANCH_NAME == 'main' }}
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ env.REPO_NAME }}:latest

      # 3. サーバー上のディレクトリを準備
      - name: Prepare Server Directory
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            mkdir -p ~/your-repo-name
            sudo chown -R ubuntu:ubuntu ~/your-repo-name/nginx ~/your-repo-name/docker-compose.yml 2>/dev/null || true
            chmod -R 755 ~/your-repo-name/nginx 2>/dev/null || true

      # 4. docker-compose.yml をサーバーへ転送
      - name: Copy docker-compose.yml to Server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: ${{ env.DEPLOY_FILES }}
          target: ${{ env.TARGET_DIR }}
          strip_components: 1

      # 5. SSHデプロイ
      - name: Deploy to Ubuntu
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # ディレクトリへ移動
            cd ~/your-repo-name

            # GHCRへログイン (一時トークンによる認証)
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # イメージを取得してコンテナ再起動
            docker compose pull
            docker compose up -d --remove-orphans

            # ログアウト（セキュリティのため）
            docker logout ghcr.io

```

このワークフローを走らせることでサーバーへ`default.conf`と`docker-compose.yml`が自動でサーバーへ転送され，GHCRから自動でイメージを持ってきて起動する仕組みになっています．

ターミナルから`curl`を叩いて正しく返ってくるかを試します．

```zsh:zsh
$ curl your-domain
{"message":"〇〇"}
```

といったように表示されたらnginxを用いたリバースプロキシの設定ができました．

### 3. Nginxの設定

前章では暗号化の土台を固めるために疎通確認を行いました．次に行うのはいよいよcertbotを用いたSSL化（通信の暗号化）を行なっていこうと思います．
まずはCertbotで証明書を取得するために`default.conf`を変更していきます．

```diff_conf:default.conf
server {
    listen 80;
    server_name your-domain;

+   location /.well-known/acme-challenge/ {
+       root /var/www/certbot;
+   }

    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

次にこれをgithubにpushした後でワークフローを実行してサーバーへ移します．
サーバー上で次のコマンドを実行します．`your-domain`は各自の独自ドメインへ書き換えてください．

```zsh:zsh
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d your-domain
```

するとLet's Encryptの利用規約へ同意するかどうかやメールアドレス等を聞かれるのでその都度答えていくと証明書を発行してもらえます．

証明書の発行が終わった後はHTTP(80)へのアクセスをHTTPS(443)へ強制リダイレクトし，APIリクエストをGo（backend）へ流すようにnginxの設定を変更します．`your-domain`は各自変更してください．

```:default.conf
server {
    listen 80;
    server_name your-domain;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain;

    ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

次に`docker-compose.yml`も変更していきます．

```diff_yml:docker-compose.yml
services:
  backend:
    image: ghcr.io/git-name/repo-name:latest
    container_name: your-project-name
    expose:
      - "8080"
    restart: always

  nginx:
    image: nginx:latest
    container_name: your-nginx-name
    ports:
      - "80:80"
+     - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
+     - ./certbot/conf:/etc/letsencrypt
+     - ./certbot/www:/var/www/certbot
    restart: always
    depends_on:
      - backend

+ certbot:
+   image: certbot/certbot
+   volumes:
+     - ./certbot/conf:/etc/letsencrypt
+     - ./certbot/www:/var/www/certbot
```

最後に`deploy.yml`も変更します．`your-repo-name`はて記事変更してください．

```diff_yml:deploy.yml
name: CD Pipeline

# ...（中略）...

      # 3. サーバー上のディレクトリを準備
      - name: Prepare Server Directory
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            mkdir -p ~/your-repo-name
-           sudo chown -R ubuntu:ubuntu ~/your-repo-name/nginx ~/your-repo-name/docker-compose.yml 2>/dev/null || true
-           chmod -R 755 ~/your-repo-name/nginx 2>/dev/null || true
+           sudo chown -R ubuntu:ubuntu ~/your-repo-name/nginx ~/your-repo-name/docker-compose.yml ~/your-repo-name/certbot 2>/dev/null || true
+           chmod -R 755 ~/your-repo-name/nginx ~/your-repo-name/certbot 2>/dev/null || true

      # 4. docker-compose.yml をサーバーへ転送
      - name: Copy docker-compose.yml to Server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: ${{ env.DEPLOY_FILES }}
          target: ${{ env.TARGET_DIR }}
          strip_components: 1

      # 5. SSHデプロイ
      - name: Deploy to Ubuntu

# ...（中略）...

            # ログアウト（セキュリティのため）
            docker logout ghcr.io

```

これらを再びgithubへプッシュしてワークフローを走らせましょう．
すると成功するとエラーが出ずにデプロイが完了し，ブラウザなどでアクセスするとSSL化されていることが確認できると思います．

### 4. 証明書の自動更新

証明書の期限が切れないように`cron`というジョブ管理ツールを用いて自動更新タスクを登録します．

```zsh:zsh
$ crontab -e
```

を実行するとはじめに使用するエディタを選択できるので適当に選び次のコードを登録します．

```text:text
0 4 * * * cd ~/muselog && /usr/bin/docker compose run --rm certbot renew && /usr/bin/docker compose restart nginx
```

これを登録することで毎朝4時に有効期限を確認して更新してくれます．

# おわりに

これで，安全なHTTPS通信が可能なAPIサーバーを構築することができました．Nginxの設定ファイル（default.conf）を適切に構成することで，SSL化だけでなく，将来的な負荷分散やセキュリティ対策も行いやすくなります．
