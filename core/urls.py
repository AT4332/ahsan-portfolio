from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('contact/', views.contact, name='contact'),
    path('api-tester/', views.api_tester, name='api_tester'),
    path('chatbot/', views.chatbot, name='chatbot'),
    path('chatbot/save/', views.save_chat_message, name='chatbot_save'),
]
