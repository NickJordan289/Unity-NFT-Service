resource "azurerm_container_registry" "res-1" {
  admin_enabled       = true
  location            = "australiaeast"
  name                = "Web3Testing"
  resource_group_name = "Web3_Testing"
  sku                 = "Basic"
  depends_on = [
    azurerm_resource_group.res-2,
  ]
}
resource "azurerm_resource_group" "res-2" {
  location = "eastasia"
  name     = "Web3_Testing"
}
resource "azurerm_container_group" "res-0" {
  location            = "eastasia"
  name                = "unitynftservice"
  network_profile_id  = null
  os_type             = "Linux"
  resource_group_name = "Web3_Testing"
  tags = {
    docker-compose-application = "docker-compose-application"
  }
  dns_name_label = "unitynftservice"
  container {
    cpu = 1
    memory                       = 1
    environment_variables = {
      REACT_APP_PORT = "3000"
    }
    image                        = "web3testing.azurecr.io/unitynftservice-client:latest"
    name                         = "client"
    secure_environment_variables = null # sensitive
    ports {
      port = 80
    }
  }
  container {
    cpu = 1
    memory                       = 1
    environment_variables = {
      API_HOST           = "http://localhost:4000"
      APP_SERVER_PORT    = "4000"
    }
    secure_environment_variables = {
      MONGODB_CONNSTRING = "mongodb://AzureDiamond:hunter2@mongodb"
    }
    image                        = "web3testing.azurecr.io/unitynftservice-server:latest"
    name                         = "server"
    ports {
      port = 4000
    }
  }
  container {
    cpu = 1
    memory                       = 1
    secure_environment_variables = {
      MONGO_INITDB_ROOT_PASSWORD = "hunter2"
      MONGO_INITDB_ROOT_USERNAME = "AzureDiamond"
    }
    image                        = "mongo:6.0.2"
    name                         = "mongodb"
  }
  container {
    cpu                          = 0.01
    image                        = "docker/aci-hostnames-sidecar:1.0"
    memory                       = 0.1
    name                         = "aci--dns--sidecar"
  }
  image_registry_credential {
    server   = azurerm_container_registry.res-1.login_server
    username = azurerm_container_registry.res-1.admin_username
    password = azurerm_container_registry.res-1.admin_password
  }
  depends_on = [
    azurerm_resource_group.res-2,
  ]
}