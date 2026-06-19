data "yandex_vpc_network" "main" {
  name = "default"
}

resource "yandex_vpc_subnet" "main" {
  name           = "even-dictionary-subnet"
  zone           = var.zone
  network_id     = data.yandex_vpc_network.main.id
  v4_cidr_blocks = ["10.0.1.0/24"]
}

resource "yandex_vpc_security_group" "vm" {
  name       = "even-dictionary-vm-sg"
  network_id = data.yandex_vpc_network.main.id

  ingress {
    protocol       = "TCP"
    description    = "SSH"
    port           = 22
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol       = "TCP"
    description    = "HTTP"
    port           = 80
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol       = "TCP"
    description    = "HTTPS"
    port           = 443
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol       = "ANY"
    description    = "All outbound"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "yandex_vpc_security_group" "db" {
  name       = "even-dictionary-db-sg"
  network_id = data.yandex_vpc_network.main.id

  ingress {
    protocol          = "TCP"
    description       = "PostgreSQL from app VM"
    port              = 6432
    security_group_id = yandex_vpc_security_group.vm.id
  }
}
