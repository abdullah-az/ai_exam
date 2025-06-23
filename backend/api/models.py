from django.db import models
from django.contrib.auth.models import AbstractUser

# Independent Models
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class AISettings(models.Model):
    gemini_api_key = models.CharField(max_length=255) # Should be encrypted
    selected_model_name = models.CharField(max_length=100)

    def __str__(self):
        return "AI Settings"

# Dependent Models
class Question(models.Model):
    text = models.TextField()
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, related_name='questions')
    course_year = models.IntegerField()
    mark = models.IntegerField()
    is_ai_generated = models.BooleanField(default=False)

    def __str__(self):
        return self.text[:50]

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class Attachment(models.Model):
    ATTACHMENT_TYPE_CHOICES = (
        ('image', 'Image'),
        ('code', 'Code'),
        ('diagram', 'Diagram'),
        ('text', 'Text'),
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='attachments')
    attachment_type = models.CharField(max_length=10, choices=ATTACHMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='attachments/', blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.file_name or f"{self.attachment_type} for {self.question.id}"

class AdminExamDefinition(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    durationMinutes = models.IntegerField()
    passingGradePercent = models.IntegerField()
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    # Settings
    showResultImmediately = models.BooleanField(default=True)
    allowRetries = models.BooleanField(default=False)
    allowNavigateBack = models.BooleanField(default=True)
    allowAutoGrading = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ExamSession(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    admin_exam_definition = models.ForeignKey(AdminExamDefinition, on_delete=models.CASCADE, null=True, blank=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)
    exam_name = models.CharField(max_length=255)
    score = models.IntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)
    questions = models.ManyToManyField(Question)

    def __str__(self):
        return f"Exam for {self.student.username} on {self.exam_name}"

class StudentAnswer(models.Model):
    exam_session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Answer by {self.exam_session.student.username} for question {self.question.id}"