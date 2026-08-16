
import psycopg2
from psycopg2 import OperationalError

def create_database():
    try:
        # Connect to default 'postgres' database first to create new db
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='',
            host='localhost',
            port='5432'
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='myportfolio_db'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE myportfolio_db")
            print("Database 'myportfolio_db' created successfully!")
        else:
            print("Database 'myportfolio_db' already exists!")
        
        cursor.close()
        conn.close()
    except OperationalError as e:
        print(f"Error connecting to PostgreSQL: {e}")
        print("Please make sure PostgreSQL is running and the credentials are correct!")

if __name__ == "__main__":
    create_database()
