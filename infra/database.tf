resource "yandex_mdb_postgresql_cluster" "main" {
  name        = "even-dictionary-pg"
  environment = "PRODUCTION"
  network_id  = data.yandex_vpc_network.main.id

  config {
    version = "16"
    resources {
      resource_preset_id = var.db_preset_id
      disk_type_id       = "network-ssd"
      disk_size          = var.db_disk_gb
    }
  }

  host {
    zone             = var.zone
    subnet_id        = yandex_vpc_subnet.main.id
    assign_public_ip = false
  }

  security_group_ids = [yandex_vpc_security_group.db.id]

  timeouts {
    create = "30m"
    update = "30m"
    delete = "15m"
  }
}

resource "yandex_mdb_postgresql_user" "app" {
  cluster_id = yandex_mdb_postgresql_cluster.main.id
  name       = "even_dictionary"
  password   = var.db_password
}

resource "yandex_mdb_postgresql_database" "app" {
  cluster_id = yandex_mdb_postgresql_cluster.main.id
  name       = "even_dictionary"
  owner      = yandex_mdb_postgresql_user.app.name
  depends_on = [yandex_mdb_postgresql_user.app]
}
