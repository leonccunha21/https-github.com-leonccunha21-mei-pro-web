# Stripe webhook forwarding
# Run this in a separate terminal to forward Stripe events to your local server
# Parameters:
#   -ForwardTo: URL to forward events to (default: http://localhost:4000/api/stripe/webhook)
#   -Port: Local port for Stripe webhook (default: 4000)
#
# Usage: .stripe\listen.ps1

param(
  [string]$ForwardTo = "http://localhost:4000/api/stripe/webhook",
  [string]$Port = "4000"
)

stripe listen --forward-to $ForwardTo --port $Port
