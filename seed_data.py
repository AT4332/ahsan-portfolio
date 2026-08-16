import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myportfolio_django.settings')
django.setup()

from core.models import Skill, Project, Setting
from django.contrib.auth.models import User

def seed():
    print("Clearing existing data...")
    Skill.objects.all().delete()
    Project.objects.all().delete()
    Setting.objects.all().delete()

    print("Adding Skills...")
    skills = [
        {'name': 'HTML', 'prof': 95, 'cat': 'Frontend', 'icon': 'fa-html5'},
        {'name': 'CSS', 'prof': 90, 'cat': 'Frontend', 'icon': 'fa-css3-alt'},
        {'name': 'JavaScript', 'prof': 88, 'cat': 'Frontend', 'icon': 'fa-js'},
        {'name': 'Bootstrap', 'prof': 92, 'cat': 'Frontend', 'icon': 'fa-bootstrap'},
        {'name': 'React', 'prof': 80, 'cat': 'Frontend', 'icon': 'fa-react'},
        {'name': 'Python', 'prof': 85, 'cat': 'Backend', 'icon': 'fa-python'},
        {'name': 'Django', 'prof': 82, 'cat': 'Backend', 'icon': 'fa-python'},
        {'name': 'PHP', 'prof': 85, 'cat': 'Backend', 'icon': 'fa-php'},
        {'name': 'MySQL', 'prof': 85, 'cat': 'Database', 'icon': 'fa-database'},
        {'name': 'PostgreSQL', 'prof': 75, 'cat': 'Database', 'icon': 'fa-database'},
        {'name': 'Node.js', 'prof': 85, 'cat': 'Backend', 'icon': 'fa-node-js'},
        {'name': 'Express.js', 'prof': 85, 'cat': 'Backend', 'icon': 'fa-node-js'},
        {'name': 'MongoDB', 'prof': 82, 'cat': 'Database', 'icon': 'fa-database'},
        {'name': 'Socket.io (Client)', 'prof': 78, 'cat': 'Frontend', 'icon': 'fa-bolt'},
        {'name': 'Socket.io (Server)', 'prof': 78, 'cat': 'Backend', 'icon': 'fa-bolt'},
        {'name': 'Docker', 'prof': 80, 'cat': 'Tools', 'icon': 'fa-docker'},
        {'name': 'TanStack Query', 'prof': 78, 'cat': 'Frontend', 'icon': 'fa-layer-group'},
        {'name': 'Passport.js', 'prof': 78, 'cat': 'Backend', 'icon': 'fa-shield-halved'},
        {'name': 'bcrypt.js', 'prof': 80, 'cat': 'Backend', 'icon': 'fa-lock'},
        {'name': 'Git & GitHub', 'prof': 90, 'cat': 'Tools', 'icon': 'fa-github'},
    ]

    for s in skills:
        Skill.objects.create(
            skill_name=s['name'],
            proficiency=s['prof'],
            category=s['cat'],
            icon=s['icon']
        )
    print(f"Added {len(skills)} skills.")

    print("Adding Projects...")
    projects = [
        {
            'title': 'Dynamic Portfolio Platform',
            'desc': 'A fully responsive and dynamic portfolio website built with Django and MySQL, featuring animations and smooth transitions.',
            'tech': 'Python, Django, Bootstrap, MySQL, HTML, CSS',
            'cat': 'Full Stack',
            'img': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            'github': 'https://github.com/ahsan/portfolio',
        },
        {
            'title': 'React E-Commerce',
            'desc': 'Modern e-commerce platform with a React frontend and Django REST Framework backend.',
            'tech': 'React, Python, Django, PostgreSQL, Bootstrap',
            'cat': 'Full Stack',
            'img': 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop',
            'github': 'https://github.com/ahsan/react-ecommerce',
        },
        {
            'title': 'PHP School Management',
            'desc': 'Legacy school management system migrated from raw PHP to a structured framework.',
            'tech': 'PHP, MySQL, JavaScript, HTML, CSS',
            'cat': 'Backend',
            'img': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop',
            'github': 'https://github.com/ahsan/php-school',
        }
    ]

    for p in projects:
        Project.objects.create(
            title=p['title'],
            description=p['desc'],
            tech_stack=p['tech'],
            category=p['cat'],
            image_url=p['img'],
            github_link=p['github']
        )
    print(f"Added {len(projects)} projects.")

    print("Adding Settings...")
    Setting.objects.create(setting_key='hero_title', setting_value='Hi, I\'m a Full Stack Python Developer')
    Setting.objects.create(setting_key='hero_subtitle', setting_value='Building robust systems and beautiful user experiences with modern tech.')
    Setting.objects.create(setting_key='currently_learning', setting_value='React Native, Advanced PostgreSQL, System Architecture')
    
    # Create superuser if it doesn't exist
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created superuser 'admin' with password 'admin123'.")

    print("Seeding completed successfully.")

if __name__ == '__main__':
    seed()
