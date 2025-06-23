from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, SpecializationViewSet, QuestionViewSet, 
    AdminExamDefinitionViewSet, ExamSessionViewSet, AISettingsViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'specializations', SpecializationViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'exam-definitions', AdminExamDefinitionViewSet, basename='admin-exam-definition')
router.register(r'exam-sessions', ExamSessionViewSet)
router.register(r'ai-settings', AISettingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]