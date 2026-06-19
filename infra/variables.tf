variable "cloud_id" {
  type        = string
  description = "Yandex Cloud cloud ID (yc config get cloud-id)"
}

variable "folder_id" {
  type        = string
  description = "Yandex Cloud folder ID (yc config get folder-id)"
}

variable "zone" {
  type        = string
  default     = "ru-central1-a"
  description = "Availability zone"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content for VM access (e.g. contents of ~/.ssh/id_ed25519.pub)"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Password for the PostgreSQL application user"
}

variable "vm_cores" {
  type    = number
  default = 2
}

variable "vm_memory_gb" {
  type    = number
  default = 2
}

variable "vm_disk_gb" {
  type    = number
  default = 20
}

variable "db_disk_gb" {
  type    = number
  default = 10
}

variable "db_preset_id" {
  type    = string
  default = "s2.micro"
}
