from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'due_date',
            'completed',
            'created_at',
            'updated_at'
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Task title cannot be empty."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Task title must contain at least 3 characters."
            )

        return value