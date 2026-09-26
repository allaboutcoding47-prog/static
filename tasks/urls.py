from django.urls import path
from .views import TaskListCreateAPIView, TaskDetailAPIView


urlpatterns = [

    path(
        'api/tasks/',
        TaskListCreateAPIView.as_view(),
        name='task-list'
    ),

    path(
        'api/tasks/<int:pk>/',
        TaskDetailAPIView.as_view(),
        name='task-detail'
    ),

]