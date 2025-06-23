from rest_framework import serializers
from .models import (
    User, Specialization, Question, Choice, Attachment, 
    AdminExamDefinition, ExamSession, StudentAnswer, AISettings
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'specialization', 'course_year', 'mark', 'is_ai_generated', 'choices', 'attachments']

class AdminExamDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminExamDefinition
        fields = '__all__'

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = '__all__'

class ExamSessionSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    student = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    admin_exam_definition = AdminExamDefinitionSerializer(read_only=True)

    class Meta:
        model = ExamSession
        fields = '__all__'

class AISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISettings
        fields = '__all__'