data "yandex_compute_image" "ubuntu" {
  family = "ubuntu-2204-lts"
}

locals {
  cloud_init = <<-CLOUDINIT
    #cloud-config
    package_update: true
    package_upgrade: false

    packages:
      - nginx

    write_files:
      - path: /etc/nginx/sites-available/even-dictionary
        content: |
          server {
              listen 80 default_server;
              listen [::]:80 default_server;
              server_name _;

              gzip on;
              gzip_comp_level 5;
              gzip_min_length 1024;
              gzip_types text/plain text/css application/json application/javascript text/javascript;

              location / {
                  proxy_pass         http://127.0.0.1:3001;
                  proxy_http_version 1.1;
                  proxy_set_header   Host              $host;
                  proxy_set_header   X-Real-IP         $remote_addr;
                  proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
                  proxy_set_header   X-Forwarded-Proto $scheme;
                  proxy_read_timeout 30s;
              }
          }

    runcmd:
      - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      - apt-get install -y nodejs
      - npm install -g pm2
      - ln -sf /etc/nginx/sites-available/even-dictionary /etc/nginx/sites-enabled/even-dictionary
      - rm -f /etc/nginx/sites-enabled/default
      - systemctl enable nginx
      - systemctl restart nginx
      - mkdir -p /app
      - chown -R ubuntu:ubuntu /app
      - su - ubuntu -c "pm2 startup systemd -u ubuntu --hp /home/ubuntu" | tail -1 | bash
  CLOUDINIT
}

resource "yandex_compute_instance" "app" {
  name        = "even-dictionary-app"
  hostname    = "even-dictionary-app"
  platform_id = "standard-v3"
  zone        = var.zone

  resources {
    cores         = var.vm_cores
    memory        = var.vm_memory_gb
    core_fraction = 100
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.ubuntu.id
      size     = var.vm_disk_gb
      type     = "network-ssd"
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.main.id
    nat                = true
    security_group_ids = [yandex_vpc_security_group.vm.id]
  }

  metadata = {
    user-data = local.cloud_init
    ssh-keys  = "ubuntu:${var.ssh_public_key}"
  }
}
