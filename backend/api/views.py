from rest_framework import viewsets, permissions
from .permissions import IsAdminUser, IsStudentUser
from .models import (
    User, Specialization, Question, AdminExamDefinition, ExamSession, AISettings
)
from .serializers import (
    UserSerializer, SpecializationSerializer, QuestionSerializer, 
    AdminExamDefinitionSerializer, ExamSessionSerializer, AISettingsSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class SpecializationViewSet(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

class AdminExamDefinitionViewSet(viewsets.ModelViewSet):
    queryset = AdminExamDefinition.objects.all()
    serializer_class = AdminExamDefinitionSerializer
    permission_classes = [IsAdminUser]

class ExamSessionViewSet(viewsets.ModelViewSet):
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return ExamSession.objects.filter(student=user)
        elif user.role == 'admin':
            return ExamSession.objects.all()
        return ExamSession.objects.none()

class AISettingsViewSet(viewsets.ModelViewSet):
    queryset = AISettings.objects.all()
    serializer_class = AISettingsSerializer
    permission_classes = [IsAdminUser]