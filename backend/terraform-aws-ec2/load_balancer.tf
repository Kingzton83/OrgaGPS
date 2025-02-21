data "aws_route53_zone" "existing" {
  name = "orgagps.com."
}


resource "aws_lb" "app_lb" {
  name               = "orgagps-loadbalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ec2_sg.id]
  subnets            = [
    aws_subnet.main_subnet.id,
    aws_subnet.additional_subnet.id, # Falls mehrere Subnets vorhanden sind
  ]

  tags = {
    Name = "orgagps-lb"
  }
}

resource "aws_lb_target_group" "app_tg" {
  name        = "orgagps-app-target-group"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main_vpc.id
  target_type = "instance"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "app-target-group"
  }
}

resource "aws_lb_target_group_attachment" "app_tg_attachment" {
  depends_on = [aws_instance.orgagps]
  target_group_arn = aws_lb_target_group.app_tg.arn
  target_id        = aws_instance.orgagps.id
  port             = 80
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.cert_validation.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# Route 53 Record
resource "aws_route53_record" "app" {
  depends_on = [aws_lb.app_lb]
  zone_id = data.aws_route53_zone.existing.zone_id
  name    = "orgagps.com"
  type    = "A"

  alias {
    name                   = aws_lb.app_lb.dns_name
    zone_id                = aws_lb.app_lb.zone_id
    evaluate_target_health = true
  }
}