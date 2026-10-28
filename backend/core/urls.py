from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView, 
    ExpenseViewSet, IncomeViewSet, BudgetViewSet,
    SavingsGoalViewSet, NotificationViewSet,
    DashboardStatsView, ExportCSVView, ExportPDFView, ExportExcelView
)

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', SavingsGoalViewSet, basename='goal')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Auth Routes
    path('register/', RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', MeView.as_view()),
    
    # Analytics & Dashboard
    path('dashboard-stats/', DashboardStatsView.as_view()),
    
    # Export Routes
    path('export-csv/', ExportCSVView.as_view()),
    path('export-pdf/', ExportPDFView.as_view()),
    path('export-excel/', ExportExcelView.as_view()),
    
    # API ViewSets (CRUD)
    path('', include(router.urls)),
]