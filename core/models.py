from django.db import models

class Project(models.Model):
    CATEGORY_CHOICES = [
        ('Frontend', 'Frontend'),
        ('Backend', 'Backend'),
        ('Full Stack', 'Full Stack'),
        ('Agents', 'Agents'),
        ('AI Assistant', 'AI Assistant'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    tech_stack = models.CharField(max_length=255, blank=True, null=True)
    github_link = models.URLField(max_length=255, blank=True, null=True)
    live_demo = models.URLField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Full Stack')
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    image_url = models.URLField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('AI', 'AI'),
        ('Frontend', 'Frontend'),
        ('Backend', 'Backend'),
        ('Full Stack', 'Full Stack'),
        ('Tools', 'Tools'),
        ('Database', 'Database'),
    ]

    skill_name = models.CharField(max_length=100)
    proficiency = models.IntegerField(help_text="1-100")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="FontAwesome icon class")
    experience_summary = models.TextField(blank=True, null=True)
    projects_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.skill_name

class Message(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='blogs/', blank=True, null=True)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class JourneyItem(models.Model):
    title = models.CharField(max_length=120)
    period = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('order', 'created_at')

    def __str__(self):
        return self.title

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=120, blank=True)
    company = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    rating = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name

class Repository(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    repository_url = models.URLField(max_length=255)
    language = models.CharField(max_length=60, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name

class SiteProfile(models.Model):
    hero_title = models.CharField(max_length=255, default="Hi, I’m Ahsan — Full Stack Developer & AI Builder")
    hero_subtitle = models.TextField(default="I build polished products with Python, Django, modern frontend stacks, and AI-driven experiences.")
    hero_badge = models.CharField(max_length=80, default="AI-Driven Developer")
    hero_highlight = models.CharField(max_length=120, default="Python • Django • AI Products")
    currently_learning = models.CharField(max_length=255, default="Django, Python, Advanced AI & Automation")
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    profile_image_url = models.URLField(max_length=255, blank=True, null=True)
    cv_file = models.FileField(upload_to='cv/', blank=True, null=True)
    email = models.EmailField(default="hello@developer.com")
    contact_email = models.EmailField(blank=True, null=True, help_text="Where contact form messages should be sent.")
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    whatsapp = models.CharField(max_length=50, blank=True, null=True, default='+92 3436052116')
    about_heading = models.CharField(max_length=255, default="Crafting thoughtful digital experiences with code and creativity")
    about_text = models.TextField(default="I blend product thinking, scalable architecture, and AI-driven automation to deliver polished web applications that feel effortless for users and reliable for businesses.")
    about_subheading = models.TextField(default="From intuitive interfaces to robust backend systems, I focus on creating experiences that are fast, modern, and impactful.")
    experience_years = models.CharField(max_length=50, default="2.5")
    site_title = models.CharField(max_length=100, default="Ahsan Portfolio")
    footer_title = models.CharField(max_length=100, default="Ahsan Portfolio")
    footer_description = models.TextField(default="Crafting elegant digital experiences with Python, Django, and AI-driven product thinking.")
    footer_about_text = models.TextField(
        default="I'm Ahsan Manzoor, a MERN Stack & AI Developer passionate about building scalable web applications and agentic AI systems that solve real-world problems.",
        help_text="Short bio shown in the About column of the footer."
    )
    footer_copyright = models.CharField(max_length=255, default="© 2026 Ahsan Manzoor. All rights reserved.")
    
    def __str__(self):
        return "Site Profile"
    
    def save(self, *args, **kwargs):
        # Only one instance allowed
        if not self.pk and SiteProfile.objects.exists():
            return SiteProfile.objects.first()
        super(SiteProfile, self).save(*args, **kwargs)

class Setting(models.Model):
    setting_key = models.CharField(max_length=50, unique=True)
    setting_value = models.TextField()

    def __str__(self):
        return self.setting_key


class ChatMessage(models.Model):
    """Stores every chatbot conversation turn for admin review."""
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    session_id   = models.CharField(max_length=64, db_index=True, help_text="Browser session identifier")
    role         = models.CharField(max_length=12, choices=ROLE_CHOICES)
    content      = models.TextField()
    is_feedback  = models.BooleanField(default=False, help_text="True when message is a site-feedback response")
    visitor_ip   = models.GenericIPAddressField(blank=True, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('session_id', 'created_at')

    def __str__(self):
        return f"[{self.session_id[:8]}] {self.role}: {self.content[:60]}"
