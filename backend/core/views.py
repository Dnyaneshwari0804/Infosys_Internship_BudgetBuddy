from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum
import csv

from .models import User, Expense, Income, Budget, SavingsGoal, Notification
from .serializers import (
    RegisterSerializer, UserSerializer, ExpenseSerializer, 
    IncomeSerializer, BudgetSerializer, SavingsGoalSerializer, NotificationSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

# --- NEW: Dashboard Analytics API ---
class DashboardStatsView(APIView):
    def get(self, request):
        total_income = request.user.incomes.aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = request.user.expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        savings = float(total_income) - float(total_expense)
        return Response({
            'income': float(total_income), 
            'expense': float(total_expense), 
            'savings': savings
        })

# --- NEW: Export CSV API ---
class ExportCSVView(APIView):
    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="my_expenses.csv"'
        writer = csv.writer(response)
        writer.writerow(['Date', 'Category', 'Amount', 'Description'])
        for exp in request.user.expenses.all():
            writer.writerow([exp.date, exp.category, exp.amount, exp.description])
        return response

# --- Core Views ---
class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    def get_queryset(self):
        return self.request.user.expenses.all()
    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        # AUTO-NOTIFICATION TRIGGER
        if float(expense.amount) > 500:
            Notification.objects.create(
                user=self.request.user, 
                title="Large Expense Alert", 
                message=f"Whoa! You spent {expense.amount} on {expense.category}."
            )

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    def get_queryset(self):
        return self.request.user.incomes.all()
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    def get_queryset(self):
        return self.request.user.budgets.all()
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    def get_queryset(self):
        return self.request.user.goals.all()
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    def get_queryset(self):
        return self.request.user.notifications.all()