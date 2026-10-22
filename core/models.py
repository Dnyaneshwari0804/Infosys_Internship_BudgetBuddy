from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (('student', 'Student'),
                    ('premium', 'Premium User'),
                    ('admin', 'Admin'))
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='INR')
    preferences = models.JSONField(default=dict, blank=True)  # e.g. alert thresholds


class Income(models.Model):
    SOURCE_CHOICES = (('pocket_money', 'Pocket Money'),
                      ('scholarship', 'Scholarship'),
                      ('freelance', 'Freelance'),
                      ('other', 'Other'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)


class Expense(models.Model):
    CATEGORY_CHOICES = (('food', 'Food'), ('travel', 'Travel'),
                        ('shopping', 'Shopping'), ('education', 'Education'),
                        ('entertainment', 'Entertainment'), ('misc', 'Miscellaneous'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    month = models.CharField(max_length=7)  # "2025-01"
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    category_allocations = models.JSONField(default=dict)  # {"food": 3000, ...}

    class Meta:
        unique_together = ('user', 'month')


class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    month = models.CharField(max_length=7)
    report_type = models.CharField(max_length=20, default='monthly')
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)