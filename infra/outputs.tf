output "vm_ip" {
  description = "Public IP of the app VM"
  value       = yandex_compute_instance.app.network_interface[0].nat_ip_address
}

output "db_host" {
  description = "FQDN of the PostgreSQL cluster host"
  value       = yandex_mdb_postgresql_cluster.main.host[0].fqdn
}

output "db_connection_string" {
  description = "PostgreSQL connection string (replace <password>)"
  value       = "postgresql://even_dictionary:<password>@${yandex_mdb_postgresql_cluster.main.host[0].fqdn}:6432/even_dictionary?sslmode=require"
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ubuntu@${yandex_compute_instance.app.network_interface[0].nat_ip_address}"
}
