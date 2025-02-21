# Erstellen einer Hosted Zone für die Domain orgagps.com
resource "aws_route53_zone" "main" {
  name = "orgagps.com"

  tags = {
    Name = "orgagps-hosted-zone"
  }
}

# Optional: www-Alias für die Domain
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.orgagps.com"
  type    = "A"
  alias {
    name                   = aws_lb.app_lb.dns_name
    zone_id                = aws_lb.app_lb.zone_id
    evaluate_target_health = true
  }
}

