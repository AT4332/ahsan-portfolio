"""
Run with:  python seed_skills.py
Adds all new skills to the database without duplicating existing ones.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myportfolio_django.settings')
django.setup()

from core.models import Skill

NEW_SKILLS = [
    # --- AI / Agentic ---
    {'skill_name': 'LangChain',          'proficiency': 82, 'category': 'AI',       'icon': 'fa-robot'},
    {'skill_name': 'LangGraph',          'proficiency': 78, 'category': 'AI',       'icon': 'fa-diagram-project'},
    {'skill_name': 'OpenAI API',         'proficiency': 85, 'category': 'AI',       'icon': 'fa-brain'},
    {'skill_name': 'Agentic AI',         'proficiency': 75, 'category': 'AI',       'icon': 'fa-robot'},
    {'skill_name': 'RAG Pipelines',      'proficiency': 72, 'category': 'AI',       'icon': 'fa-database'},
    {'skill_name': 'Prompt Engineering', 'proficiency': 88, 'category': 'AI',       'icon': 'fa-comments'},
    {'skill_name': 'Vector Databases',   'proficiency': 70, 'category': 'AI',       'icon': 'fa-layer-group'},
    # --- Frontend ---
    {'skill_name': 'React',              'proficiency': 88, 'category': 'Frontend', 'icon': 'fa-react'},
    {'skill_name': 'Redux',              'proficiency': 82, 'category': 'Frontend', 'icon': 'fa-code'},
    {'skill_name': 'Redux Toolkit',      'proficiency': 80, 'category': 'Frontend', 'icon': 'fa-code'},
    {'skill_name': 'Next.js',            'proficiency': 78, 'category': 'Frontend', 'icon': 'fa-n'},
    {'skill_name': 'TypeScript',         'proficiency': 80, 'category': 'Frontend', 'icon': 'fa-code'},
    {'skill_name': 'HTML5',              'proficiency': 95, 'category': 'Frontend', 'icon': 'fa-html5'},
    {'skill_name': 'CSS3',               'proficiency': 90, 'category': 'Frontend', 'icon': 'fa-css3-alt'},
    {'skill_name': 'Bootstrap',          'proficiency': 92, 'category': 'Frontend', 'icon': 'fa-bootstrap'},
    {'skill_name': 'Tailwind CSS',       'proficiency': 85, 'category': 'Frontend', 'icon': 'fa-wind'},
    {'skill_name': 'JavaScript',         'proficiency': 88, 'category': 'Frontend', 'icon': 'fa-js'},
    # --- Backend ---
    {'skill_name': 'Python',             'proficiency': 90, 'category': 'Backend',  'icon': 'fa-python'},
    {'skill_name': 'Django',             'proficiency': 88, 'category': 'Backend',  'icon': 'fa-python'},
    {'skill_name': 'Node.js',            'proficiency': 84, 'category': 'Backend',  'icon': 'fa-node-js'},
    {'skill_name': 'Express.js',         'proficiency': 82, 'category': 'Backend',  'icon': 'fa-server'},
    {'skill_name': 'REST APIs',          'proficiency': 90, 'category': 'Backend',  'icon': 'fa-plug'},
    {'skill_name': 'Socket.IO (Client)', 'proficiency': 78, 'category': 'Backend',  'icon': 'fa-plug'},
    {'skill_name': 'Socket.IO (Server)', 'proficiency': 78, 'category': 'Backend',  'icon': 'fa-server'},
    # --- Full Stack ---
    {'skill_name': 'MERN Stack',         'proficiency': 88, 'category': 'Full Stack', 'icon': 'fa-layer-group'},
    # --- Database ---
    {'skill_name': 'MongoDB',            'proficiency': 82, 'category': 'Database', 'icon': 'fa-leaf'},
    {'skill_name': 'MongoDB Atlas',      'proficiency': 80, 'category': 'Database', 'icon': 'fa-cloud'},
    {'skill_name': 'MySQL',              'proficiency': 82, 'category': 'Database', 'icon': 'fa-database'},
    {'skill_name': 'PostgreSQL',         'proficiency': 76, 'category': 'Database', 'icon': 'fa-database'},
    {'skill_name': 'SQLite',             'proficiency': 85, 'category': 'Database', 'icon': 'fa-database'},
    # --- Tools ---
    {'skill_name': 'Git',                'proficiency': 90, 'category': 'Tools',    'icon': 'fa-code-branch'},
    {'skill_name': 'GitHub Desktop',     'proficiency': 88, 'category': 'Tools',    'icon': 'fa-github'},
    {'skill_name': 'VS Code',            'proficiency': 95, 'category': 'Tools',    'icon': 'fa-code'},
    {'skill_name': 'Vercel',             'proficiency': 85, 'category': 'Tools',    'icon': 'fa-triangle'},
    {'skill_name': 'Render',             'proficiency': 82, 'category': 'Tools',    'icon': 'fa-cloud-upload-alt'},
    {'skill_name': 'Railway',            'proficiency': 80, 'category': 'Tools',    'icon': 'fa-train'},
    {'skill_name': 'Docker',             'proficiency': 70, 'category': 'Tools',    'icon': 'fa-docker'},
    {'skill_name': 'Postman',            'proficiency': 88, 'category': 'Tools',    'icon': 'fa-paper-plane'},
]

added = 0
skipped = 0

for skill_data in NEW_SKILLS:
    obj, created = Skill.objects.get_or_create(
        skill_name=skill_data['skill_name'],
        defaults={
            'proficiency': skill_data['proficiency'],
            'category':    skill_data['category'],
            'icon':        skill_data['icon'],
        }
    )
    if created:
        added += 1
        print(f"  + Added: {skill_data['skill_name']} ({skill_data['category']})")
    else:
        skipped += 1
        print(f"  ~ Skipped (exists): {skill_data['skill_name']}")

print(f"\nDone. Added {added} skills, skipped {skipped} existing.")
