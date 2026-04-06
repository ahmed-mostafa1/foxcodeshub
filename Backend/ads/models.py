from django.db import models


class AdPlacement(models.Model):
    LOCATION_CHOICES = [
        ('banner_top', 'Top Banner (Site-wide)'),
        ('between_products', 'Between Products (Catalog)'),
        ('product_page_mid', 'Product Page Mid-Section'),
    ]

    name = models.CharField(max_length=100)
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES, unique=True)
    client_id = models.CharField(max_length=100, help_text='Google AdSense publisher ID (ca-pub-XXXX)')
    slot_id = models.CharField(max_length=50, help_text='AdSense ad slot ID')
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.name} ({self.get_location_display()})'
