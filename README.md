# Vault Secret Sync Helm Chart

[![Publish Helm Chart](https://github.com/pennlabs/vault-secret-sync/actions/workflows/cdkactions_publish.yaml/badge.svg)](https://github.com/pennlabs/vault-secret-sync/actions/workflows/cdkactions_publish.yaml)

This helm chart sets up secret sync between a Vault instance and a Kubernetes cluster. It is based on, and uses [postfinance/vault-kubernetes](https://github.com/postfinance/vault-kubernetes) to do the actual secret synchronization, but we use the official vault docker image that authenticates using the aws auth method.

By default, this helm chart will sync secrets stored at `secrets/<cluster>/<namespace>/` to namespace `<namespace>` within the K8s cluster. The `<cluster>` parameter allows you to separate secrets by cluster.

For example, with the default values provided, all secrets stored in `secrets/production/default/` will be synced to the `default` namespace.

We are using this chart internally to sync secrets from one vault instance to all our K8s clusters.

## Configuration

See the default [values.yaml](values.yaml) for configuration options.
