from django.contrib import admin
from .models import Project, Skill, Message, Blog, Setting, SiteProfile, JourneyItem, Testimonial, Repository, ChatMessage

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'views', 'likes', 'created_at')
    list_filter = ('category',)
    search_fields = ('title', 'tech_stack')
    fieldsets = (
        (None, {'fields': ('title', 'description', 'tech_stack', 'category')}),
        ('Links', {'fields': ('github_link', 'live_demo')}),
        ('Images', {'fields': ('image_url', 'image')}),
        ('Stats', {'fields': ('views', 'likes')}),
    )

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('skill_name', 'proficiency', 'category', 'projects_count')
    list_filter = ('category',)
    search_fields = ('skill_name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} message(s) marked as read.")
    mark_as_read.short_description = 'Mark selected messages as read'

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'views', 'created_at')
    search_fields = ('title', 'tags')

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('setting_key', 'setting_value')
    search_fields = ('setting_key',)

@admin.register(JourneyItem)
class JourneyItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'period', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'company', 'rating', 'is_active')
    list_editable = ('rating', 'is_active')
    search_fields = ('name', 'quote')

@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'language', 'repository_url', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name', 'description')

@admin.register(SiteProfile)
class SiteProfileAdmin(admin.ModelAdmin):
    save_on_top = True
    list_display = ('hero_title', 'email', 'contact_email')
    search_fields = ('hero_title', 'email', 'contact_email')
    fieldsets = (
        ('Hero Section', {'fields': ('hero_title', 'hero_subtitle', 'hero_badge', 'hero_highlight', 'currently_learning')}),
        ('Profile & CV', {'fields': ('profile_image', 'profile_image_url', 'cv_file')}),
        ('Social Links', {'fields': ('email', 'contact_email', 'github', 'linkedin', 'twitter', 'whatsapp')}),
        ('About', {'fields': ('about_heading', 'about_text', 'about_subheading', 'experience_years')}),
        ('Branding & Footer', {'fields': ('site_title', 'footer_title', 'footer_description', 'footer_about_text', 'footer_copyright')}),
    )

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ('session_id', 'role', 'short_content', 'is_feedback', 'visitor_ip', 'created_at')
    list_filter   = ('role', 'is_feedback', 'created_at')
    search_fields = ('content', 'session_id', 'visitor_ip')
    readonly_fields = ('session_id', 'role', 'content', 'is_feedback', 'visitor_ip', 'created_at')
    date_hierarchy = 'created_at'

    def short_content(self, obj):
        return obj.content[:80]
    short_content.short_description = 'Content'
